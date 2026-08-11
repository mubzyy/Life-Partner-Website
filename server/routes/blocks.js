const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// GET /api/blocks
// Fetch blocked users
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const query = `
            SELECT 
                b.id as block_id,
                u.id as blocked_user_id,
                u.first_name, u.last_name,
                up.profile_photo_url as image,
                up.city, up.state,
                b.created_at as blocked_date
            FROM blocks b
            JOIN users u ON b.blocked_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE b.blocker_id = $1
            ORDER BY b.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        
        const blockedUsers = result.rows.map(row => ({
            id: row.blocked_user_id,
            name: row.first_name ? `${row.first_name} ${row.last_name || ''}`.trim() : "Unknown",
            image: row.image || null,
            location: row.city ? `${row.city}, ${row.state}` : "Not specified",
            date: row.blocked_date
        }));

        res.json(blockedUsers);
    } catch (err) {
        console.error("Error fetching blocks:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/blocks
// Block a user
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { blocked_id, reason } = req.body;

        if (!blocked_id) {
            return res.status(400).json({ message: "blocked_id is required" });
        }

        if (userId === blocked_id) {
            return res.status(400).json({ message: "Cannot block yourself" });
        }

        const query = `
            INSERT INTO blocks (blocker_id, blocked_id, reason)
            VALUES ($1, $2, $3)
            ON CONFLICT (blocker_id, blocked_id) DO NOTHING
            RETURNING *;
        `;
        const result = await pool.query(query, [userId, blocked_id, reason]);
        
        res.json({ success: true, block: result.rows[0] });
    } catch (err) {
        console.error("Error blocking user:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /api/blocks/:blockedId
// Unblock a user
router.delete("/:blockedId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const blockedId = req.params.blockedId;

        await pool.query(`DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2`, [userId, blockedId]);
        
        res.json({ success: true });
    } catch (err) {
        console.error("Error unblocking user:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
