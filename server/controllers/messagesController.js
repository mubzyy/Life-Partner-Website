const messageModel = require("../models/messageModel");
const { isOnline } = require("../lib/presence");

// There was previously no cap at all — `messages.content` is an unbounded
// TEXT column, so nothing stopped an arbitrarily large message from being
// stored and re-rendered. Mirrored on the frontend (MessagesPage.jsx).
const MAX_MESSAGE_LENGTH = 2000;

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
    if (!(await messageModel.userExists(otherUserId))) {
        res.status(404).json({ message: "User not found." });
        return null;
    }
    return otherUserId;
}

// GET /api/messages/conversations
async function getConversations(req, res) {
    try {
        const userId = req.user.id;
        const rows = await messageModel.getConversations(userId);

        const conversations = rows.map(row => {
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
}

// PATCH /api/messages/conversations/:conversationId
async function updateConversation(req, res) {
    try {
        const userId = req.user.id;
        const conversationId = req.params.conversationId;
        const { archived, muted, unread } = req.body;

        const { updated, noValidFields } = await messageModel.updateParticipantState(conversationId, userId, { archived, muted, unread });

        if (noValidFields) {
            return res.status(400).json({ message: "No valid fields provided (archived, muted, unread)." });
        }
        if (!updated) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        res.json(updated);
    } catch (err) {
        console.error("Error updating conversation:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// DELETE /api/messages/conversations/:conversationId
async function deleteConversation(req, res) {
    try {
        const userId = req.user.id;
        const conversationId = req.params.conversationId;

        const deleted = await messageModel.softDeleteConversation(conversationId, userId);
        if (!deleted) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        res.json({ message: "Conversation deleted." });
    } catch (err) {
        console.error("Error deleting conversation:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// GET /api/messages/:otherUserId
async function getMessagesWithUser(req, res) {
    try {
        const userId = req.user.id;
        const otherUserId = await resolveOtherUserId(req, res, userId);
        if (otherUserId === null) return;

        if (await messageModel.isBlockedEitherWay(userId, otherUserId)) {
            // Don't auto-create a new conversation with a blocked user, but
            // still let existing history (from before the block) be viewed
            // read-only.
            const existingConvoId = await messageModel.findExistingConversation(userId, otherUserId);
            if (!existingConvoId) {
                return res.json({ conversationId: null, messages: [] });
            }
        }

        const convoId = await messageModel.getOrCreateConversation(userId, otherUserId);
        const rows = await messageModel.getMessages(convoId);

        await messageModel.markMessagesRead(convoId, otherUserId);

        const messages = rows.map(m => ({
            id: m.id,
            senderId: m.sender_id,
            isMe: m.sender_id === userId,
            text: m.content,
            time: m.created_at,
            read: m.is_read,
        }));

        res.json({ conversationId: convoId, messages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// POST /api/messages/:otherUserId
async function sendMessage(req, res) {
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

        if (await messageModel.isBlockedEitherWay(userId, otherUserId)) {
            return res.status(403).json({ message: "You can't message this user." });
        }

        const convoId = await messageModel.getOrCreateConversation(userId, otherUserId);
        const message = await messageModel.insertMessage(convoId, userId, text.trim());

        await messageModel.touchConversation(convoId);
        await messageModel.undeleteForRecipient(convoId, otherUserId);

        // Notify the recipient — best-effort, never blocks the send itself.
        try {
            const senderName = (await messageModel.getFirstName(userId)) || "Someone";
            await messageModel.notifyNewMessage(otherUserId, senderName);
        } catch (e) {
            console.error("Error creating message notification", e);
        }

        res.json(message);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getConversations, updateConversation, deleteConversation, getMessagesWithUser, sendMessage };
