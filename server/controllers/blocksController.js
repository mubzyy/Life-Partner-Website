const blockModel = require("../models/blockModel");

// GET /api/blocks
async function getBlocks(req, res) {
    try {
        const rows = await blockModel.getBlockedUsers(req.user.id);
        const blockedUsers = rows.map(row => ({
            id: row.blocked_user_id,
            name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : "Unknown",
            image: row.image || null,
            location: row.city ? `${row.city}, ${row.state}` : "Not specified",
            date: row.blocked_date,
        }));
        res.json(blockedUsers);
    } catch (err) {
        console.error("Error fetching blocks:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// POST /api/blocks
async function createBlock(req, res) {
    try {
        const userId = req.user.id;
        const { blocked_id, reason } = req.body;

        if (!blocked_id) {
            return res.status(400).json({ message: "blocked_id is required" });
        }
        if (userId === blocked_id) {
            return res.status(400).json({ message: "Cannot block yourself" });
        }

        const block = await blockModel.blockUser(userId, blocked_id, reason);
        res.json({ success: true, block });
    } catch (err) {
        console.error("Error blocking user:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// DELETE /api/blocks/:blockedId
async function deleteBlock(req, res) {
    try {
        await blockModel.unblockUser(req.user.id, req.params.blockedId);
        res.json({ success: true });
    } catch (err) {
        console.error("Error unblocking user:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getBlocks, createBlock, deleteBlock };
