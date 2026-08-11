const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// GET /api/settings
// Fetch user settings
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query("SELECT * FROM user_settings WHERE user_id = $1", [userId]);
        
        if (result.rows.length === 0) {
            // Return defaults if none exist
            return res.json({
                new_message: true,
                new_match: true,
                profile_view: true,
                marketing: false,
                who_can_see_profile: 'Everyone',
                show_online_status: true,
                read_receipts: true,
                two_factor: false,
                email_notifications: true,
                push_notifications: true
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/settings
// Update user settings
router.put("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            new_message, new_match, profile_view, marketing,
            who_can_see_profile, show_online_status, read_receipts,
            two_factor, email_notifications, push_notifications
        } = req.body;

        const query = `
            INSERT INTO user_settings (
                user_id, new_message, new_match, profile_view, marketing,
                who_can_see_profile, show_online_status, read_receipts,
                two_factor, email_notifications, push_notifications
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                new_message = EXCLUDED.new_message,
                new_match = EXCLUDED.new_match,
                profile_view = EXCLUDED.profile_view,
                marketing = EXCLUDED.marketing,
                who_can_see_profile = EXCLUDED.who_can_see_profile,
                show_online_status = EXCLUDED.show_online_status,
                read_receipts = EXCLUDED.read_receipts,
                two_factor = EXCLUDED.two_factor,
                email_notifications = EXCLUDED.email_notifications,
                push_notifications = EXCLUDED.push_notifications,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        
        const values = [
            userId,
            new_message ?? true,
            new_match ?? true,
            profile_view ?? true,
            marketing ?? false,
            who_can_see_profile ?? 'Everyone',
            show_online_status ?? true,
            read_receipts ?? true,
            two_factor ?? false,
            email_notifications ?? true,
            push_notifications ?? true
        ];

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error saving settings:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
