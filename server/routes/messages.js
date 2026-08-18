const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { isOnline } = require("../lib/presence");
const { messageSendLimiter } = require("../middleware/rateLimit");

// There was previously no cap at all — `messages.content` is an unbounded
// TEXT column, so nothing stopped an arbitrarily large message from being
// stored and re-rendered. Mirrored on the frontend (MessagesPage.jsx).
const MAX_MESSAGE_LENGTH = 2000;

// Helper to ensure a conversation exists between two users.
// pair_key ("<lowUserId>_<highUserId>") is backed by a partial UNIQUE index
// (see db_migrate_conversations_pairkey.js) — the same canonical-pair pattern
// used for the `matches` table, so duplicate 1:1 conversations are
// structurally impossible, not just prevented by a check-then-insert race.
function pairKeyFor(user1, user2) {
    const [low, high] = user1 < user2 ? [user1, user2] : [user2, user1];
    return `${low}_${high}`;
}

// Validates the :otherUserId route param and rejects self-messaging /
// nonexistent recipients up front — without this, a malformed id or a
// deleted/nonexistent user id reaches the INSERT and trips the
// conversation_participants FK or PK constraint, surfacing as an
// undifferentiated 500 instead of a clean 4xx.
async function resolveOtherUserId(req, res, myUserId) {
    const otherUserId = parseInt(req.params.otherUserId, 10);
    if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
        res.status(400).json({ message: "Invalid user id." });
        return null;
    }
    if (otherUserId === myUserId) {
        res.status(400).json({ message: "Cannot message yourself." });
        return null;
    }
    const exists = await pool.query("SELECT id FROM users WHERE id = $1", [otherUserId]);
    if (exists.rows.length === 0) {
        res.status(404).json({ message: "User not found." });
        return null;
    }
    return otherUserId;
}

async function getOrCreateConversation(user1, user2) {
    const pairKey = pairKeyFor(user1, user2);

    const existing = await pool.query(
        `SELECT id FROM conversations WHERE pair_key = $1 AND is_group = false`,
        [pairKey]
    );
    if (existing.rows.length > 0) {
        return existing.rows[0].id;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const insertConvo = await client.query(
            `INSERT INTO conversations (is_group, pair_key) VALUES (false, $1)
             ON CONFLICT (pair_key) WHERE is_group = false AND pair_key IS NOT NULL DO NOTHING
             RETURNING id`,
            [pairKey]
        );

        let convoId;
        if (insertConvo.rows.length > 0) {
            convoId = insertConvo.rows[0].id;
            await client.query(`
                INSERT INTO conversation_participants (conversation_id, user_id)
                VALUES ($1, $2), ($1, $3)
            `, [convoId, user1, user2]);
        } else {
            // Lost the race to a concurrent request for the same pair — reuse
            // the conversation it just created instead of erroring out.
            const race = await client.query(
                `SELECT id FROM conversations WHERE pair_key = $1 AND is_group = false`,
                [pairKey]
            );
            convoId = race.rows[0].id;
        }

        await client.query('COMMIT');
        return convoId;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

// GET /api/messages/conversations
// List recent chats — excludes conversations this user has deleted (soft
// delete: the other participant's copy is untouched), and includes each
// conversation's real archived/muted/manually-unread state.
router.get("/conversations", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        const query = `
            SELECT
                c.id as conversation_id,
                u.id as other_user_id,
                u.first_name, u.last_name, u.last_login,
                up.profile_photo_url as image,
                COALESCE(ous.online_status, true) AS online_status_enabled,
                m.content as last_message,
                m.created_at as last_message_time,
                m.sender_id as last_sender_id,
                cp_me.archived, cp_me.muted, cp_me.manually_unread,
                (SELECT COUNT(*) FROM messages m2 WHERE m2.conversation_id = c.id AND m2.sender_id != $1 AND m2.is_read = false) as unread_count
            FROM conversations c
            JOIN conversation_participants cp_me ON c.id = cp_me.conversation_id AND cp_me.user_id = $1
            JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != $1
            JOIN users u ON cp_other.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_settings ous ON ous.user_id = u.id
            LEFT JOIN LATERAL (
                SELECT content, created_at, sender_id
                FROM messages
                WHERE conversation_id = c.id
                ORDER BY created_at DESC LIMIT 1
            ) m ON true
            WHERE cp_me.deleted_at IS NULL
            ORDER BY COALESCE(m.created_at, c.updated_at) DESC
        `;
        const result = await pool.query(query, [userId]);

        const conversations = result.rows.map(row => {
            const unreadCount = parseInt(row.unread_count) || 0;
            return {
                id: row.conversation_id,
                userId: row.other_user_id,
                name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : "Unknown",
                image: row.image || null,
                lastMessage: row.last_message || "",
                time: row.last_message_time || null,
                unread: row.manually_unread ? Math.max(unreadCount, 1) : unreadCount,
                archived: row.archived,
                muted: row.muted,
                online: isOnline(row.last_login, row.online_status_enabled),
            };
        });

        res.json(conversations);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// PATCH /api/messages/conversations/:conversationId
// Update MY archived/muted/unread state for a conversation. Ownership is
// enforced by the WHERE clause (conversation_id + user_id = req.user.id) —
// there is no way to flip another participant's flags.
router.patch("/conversations/:conversationId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.conversationId;
        const { archived, muted, unread } = req.body;

        const updates = [];
        const values = [];
        let i = 1;

        if (typeof archived === "boolean") { updates.push(`archived = $${i++}`); values.push(archived); }
        if (typeof muted === "boolean") { updates.push(`muted = $${i++}`); values.push(muted); }
        if (typeof unread === "boolean") { updates.push(`manually_unread = $${i++}`); values.push(unread); }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No valid fields provided (archived, muted, unread)." });
        }

        values.push(conversationId, userId);
        const result = await pool.query(
            `UPDATE conversation_participants SET ${updates.join(", ")}
             WHERE conversation_id = $${i} AND user_id = $${i + 1}
             RETURNING conversation_id, archived, muted, manually_unread`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        // "Mark as read" (unread: false) should also actually clear the
        // underlying unread messages, not just the manual flag.
        if (unread === false) {
            await pool.query(
                `UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
                [conversationId, userId]
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating conversation:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/messages/conversations/:conversationId
// Soft-delete — removes the conversation from MY list only. The other
// participant's copy and the message history are untouched, and it
// reappears for me automatically if they send a new message (see POST below).
router.delete("/conversations/:conversationId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const conversationId = req.params.conversationId;

        const result = await pool.query(
            `UPDATE conversation_participants SET deleted_at = CURRENT_TIMESTAMP
             WHERE conversation_id = $1 AND user_id = $2
             RETURNING conversation_id`,
            [conversationId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        res.json({ message: "Conversation deleted." });
    } catch (err) {
        console.error("Error deleting conversation:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/messages/:userId
// Fetch messages with a specific user
router.get("/:otherUserId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = await resolveOtherUserId(req, res, userId);
        if (otherUserId === null) return;

        const blockCheck = await pool.query(
            `SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
            [userId, otherUserId]
        );
        if (blockCheck.rows.length > 0) {
            // Don't auto-create a new conversation with a blocked user, but still
            // let existing history (from before the block) be viewed read-only.
            const existing = await pool.query(
                `SELECT c.id FROM conversations c
                 JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = $1
                 JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = $2
                 WHERE c.is_group = false`,
                [userId, otherUserId]
            );
            if (existing.rows.length === 0) {
                return res.json({ conversationId: null, messages: [] });
            }
        }

        const convoId = await getOrCreateConversation(userId, otherUserId);

        const query = `
            SELECT id, sender_id, content, created_at, is_read
            FROM messages
            WHERE conversation_id = $1
            ORDER BY created_at ASC
        `;
        const result = await pool.query(query, [convoId]);

        // Mark messages as read
        await pool.query(`
            UPDATE messages SET is_read = true 
            WHERE conversation_id = $1 AND sender_id = $2 AND is_read = false
        `, [convoId, otherUserId]);

        const messages = result.rows.map(m => ({
            id: m.id,
            senderId: m.sender_id,
            isMe: m.sender_id === userId,
            text: m.content,
            time: m.created_at,
            read: m.is_read
        }));

        res.json({ conversationId: convoId, messages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/messages/:otherUserId
// Send a message
router.post("/:otherUserId", authMiddleware, messageSendLimiter, async (req, res) => {
    try {
        const userId = req.user.id;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }
        if (text.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ message: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` });
        }

        const otherUserId = await resolveOtherUserId(req, res, userId);
        if (otherUserId === null) return;

        const blockCheck = await pool.query(
            `SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
            [userId, otherUserId]
        );
        if (blockCheck.rows.length > 0) {
            return res.status(403).json({ message: "You can't message this user." });
        }

        const convoId = await getOrCreateConversation(userId, otherUserId);

        const query = `
            INSERT INTO messages (conversation_id, sender_id, content)
            VALUES ($1, $2, $3)
            RETURNING id, sender_id, content, created_at, is_read
        `;
        const result = await pool.query(query, [convoId, userId, text.trim()]);
        
        // Update conversation updated_at
        await pool.query(`UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [convoId]);

        // A new message un-deletes the conversation for the recipient if they'd
        // soft-deleted it — otherwise it would keep sending messages into a
        // conversation the recipient can no longer see.
        await pool.query(
            `UPDATE conversation_participants SET deleted_at = NULL
             WHERE conversation_id = $1 AND user_id = $2 AND deleted_at IS NOT NULL`,
            [convoId, otherUserId]
        );

        // Notify the recipient — best-effort, never blocks the send itself.
        try {
            const sender = await pool.query("SELECT first_name FROM users WHERE id = $1", [userId]);
            const senderName = sender.rows[0]?.first_name || "Someone";
            await pool.query(`
                INSERT INTO notifications (user_id, title, message, type, action_url)
                VALUES ($1, 'New Message', $2, 'message', '/messages')
            `, [otherUserId, `${senderName} sent you a message.`]);
        } catch (e) {
            console.error("Error creating message notification", e);
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
