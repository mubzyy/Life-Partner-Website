const pool = require("../db");

// pair_key ("<lowUserId>_<highUserId>") is backed by a partial UNIQUE index
// (see migrations/db_migrate_conversations_pairkey.js) — the same
// canonical-pair pattern used for the `matches` table, so duplicate 1:1
// conversations are structurally impossible, not just prevented by a
// check-then-insert race.
function pairKeyFor(user1, user2) {
    const [low, high] = user1 < user2 ? [user1, user2] : [user2, user1];
    return `${low}_${high}`;
}

async function userExists(userId) {
    const result = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    return result.rows.length > 0;
}

async function isBlockedEitherWay(userAId, userBId) {
    const result = await pool.query(
        `SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
        [userAId, userBId]
    );
    return result.rows.length > 0;
}

// Existing 1:1 conversation between two users, without creating one —
// used so a blocked pair's pre-block history can still be viewed read-only
// without auto-creating a fresh conversation.
async function findExistingConversation(user1, user2) {
    const result = await pool.query(
        `SELECT c.id FROM conversations c
         JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = $1
         JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = $2
         WHERE c.is_group = false`,
        [user1, user2]
    );
    return result.rows[0]?.id ?? null;
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

// GET /api/messages/conversations — list recent chats — excludes
// conversations this user has deleted (soft delete: the other participant's
// copy is untouched), and includes each conversation's real
// archived/muted/manually-unread state.
async function getConversations(userId) {
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
    return result.rows;
}

// Updates MY archived/muted/unread state for a conversation. Ownership is
// enforced by the WHERE clause (conversation_id + user_id) — there is no
// way to flip another participant's flags.
async function updateParticipantState(conversationId, userId, updates) {
    const setClauses = [];
    const values = [];
    let i = 1;

    if (typeof updates.archived === "boolean") { setClauses.push(`archived = $${i++}`); values.push(updates.archived); }
    if (typeof updates.muted === "boolean") { setClauses.push(`muted = $${i++}`); values.push(updates.muted); }
    if (typeof updates.unread === "boolean") { setClauses.push(`manually_unread = $${i++}`); values.push(updates.unread); }

    if (setClauses.length === 0) return { updated: null, noValidFields: true };

    values.push(conversationId, userId);
    const result = await pool.query(
        `UPDATE conversation_participants SET ${setClauses.join(", ")}
         WHERE conversation_id = $${i} AND user_id = $${i + 1}
         RETURNING conversation_id, archived, muted, manually_unread`,
        values
    );

    if (result.rows.length === 0) return { updated: null, noValidFields: false };

    // "Mark as read" (unread: false) should also actually clear the
    // underlying unread messages, not just the manual flag.
    if (updates.unread === false) {
        await pool.query(
            `UPDATE messages SET is_read = true WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false`,
            [conversationId, userId]
        );
    }

    return { updated: result.rows[0], noValidFields: false };
}

// Soft-delete — removes the conversation from MY list only. The other
// participant's copy and the message history are untouched, and it
// reappears for me automatically if they send a new message.
async function softDeleteConversation(conversationId, userId) {
    const result = await pool.query(
        `UPDATE conversation_participants SET deleted_at = CURRENT_TIMESTAMP
         WHERE conversation_id = $1 AND user_id = $2
         RETURNING conversation_id`,
        [conversationId, userId]
    );
    return result.rows[0] || null;
}

async function getMessages(conversationId) {
    const result = await pool.query(
        `SELECT id, sender_id, content, created_at, is_read
         FROM messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC`,
        [conversationId]
    );
    return result.rows;
}

async function markMessagesRead(conversationId, senderId) {
    await pool.query(`
        UPDATE messages SET is_read = true
        WHERE conversation_id = $1 AND sender_id = $2 AND is_read = false
    `, [conversationId, senderId]);
}

async function insertMessage(conversationId, senderId, text) {
    const result = await pool.query(
        `INSERT INTO messages (conversation_id, sender_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, sender_id, content, created_at, is_read`,
        [conversationId, senderId, text]
    );
    return result.rows[0];
}

async function touchConversation(conversationId) {
    await pool.query(`UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [conversationId]);
}

// A new message un-deletes the conversation for the recipient if they'd
// soft-deleted it — otherwise it would keep sending messages into a
// conversation the recipient can no longer see.
async function undeleteForRecipient(conversationId, recipientId) {
    await pool.query(
        `UPDATE conversation_participants SET deleted_at = NULL
         WHERE conversation_id = $1 AND user_id = $2 AND deleted_at IS NOT NULL`,
        [conversationId, recipientId]
    );
}

async function getFirstName(userId) {
    const result = await pool.query("SELECT first_name FROM users WHERE id = $1", [userId]);
    return result.rows[0]?.first_name || null;
}

async function notifyNewMessage(recipientId, senderName) {
    await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, action_url)
        VALUES ($1, 'New Message', $2, 'message', '/messages')
    `, [recipientId, `${senderName} sent you a message.`]);
}

module.exports = {
    userExists, isBlockedEitherWay, findExistingConversation, getOrCreateConversation,
    getConversations, updateParticipantState, softDeleteConversation,
    getMessages, markMessagesRead, insertMessage, touchConversation,
    undeleteForRecipient, getFirstName, notifyNewMessage,
};
