const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// Helper to ensure a conversation exists between two users
async function getOrCreateConversation(user1, user2) {
    // Check if a direct conversation already exists
    const query = `
        SELECT c.id 
        FROM conversations c
        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
        WHERE c.is_group = false 
        AND cp1.user_id = $1 AND cp2.user_id = $2
    `;
    const check = await pool.query(query, [user1, user2]);
    
    if (check.rows.length > 0) {
        return check.rows[0].id;
    }

    // Create new conversation
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const insertConvo = await client.query(`INSERT INTO conversations (is_group) VALUES (false) RETURNING id`);
        const convoId = insertConvo.rows[0].id;
        
        await client.query(`
            INSERT INTO conversation_participants (conversation_id, user_id)
            VALUES ($1, $2), ($1, $3)
        `, [convoId, user1, user2]);
        
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
// List recent chats
router.get("/conversations", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const query = `
            SELECT 
                c.id as conversation_id,
                u.id as other_user_id,
                u.first_name, u.last_name,
                up.profile_photo_url as image,
                m.content as last_message,
                m.created_at as last_message_time,
                m.sender_id as last_sender_id,
                (SELECT COUNT(*) FROM messages m2 WHERE m2.conversation_id = c.id AND m2.sender_id != $1 AND m2.is_read = false) as unread_count
            FROM conversations c
            JOIN conversation_participants cp_me ON c.id = cp_me.conversation_id AND cp_me.user_id = $1
            JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != $1
            JOIN users u ON cp_other.user_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN LATERAL (
                SELECT content, created_at, sender_id 
                FROM messages 
                WHERE conversation_id = c.id 
                ORDER BY created_at DESC LIMIT 1
            ) m ON true
            ORDER BY COALESCE(m.created_at, c.updated_at) DESC
        `;
        const result = await pool.query(query, [userId]);
        
        const conversations = result.rows.map(row => ({
            id: row.conversation_id,
            userId: row.other_user_id,
            name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : "Unknown",
            image: row.image || null,
            lastMessage: row.last_message || "",
            time: row.last_message_time || null,
            unread: parseInt(row.unread_count) || 0,
            online: false // Mock
        }));

        res.json(conversations);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/messages/:userId
// Fetch messages with a specific user
router.get("/:otherUserId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.otherUserId;

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
router.post("/:otherUserId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.otherUserId;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
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

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
