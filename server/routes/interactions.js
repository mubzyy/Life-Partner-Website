const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// POST /api/interactions
// Record a like or pass
router.post("/", authMiddleware, async (req, res) => {
    try {
        const actorId = req.user.id;
        const { target_id, action } = req.body; // action: 'like' | 'pass'

        if (!target_id || !action || !['like', 'pass'].includes(action)) {
            return res.status(400).json({ message: "Valid target_id and action ('like' or 'pass') required" });
        }

        if (actorId === target_id) {
            return res.status(400).json({ message: "Cannot interact with yourself" });
        }

        // Insert or update interaction
        const query = `
            INSERT INTO interactions (actor_id, target_id, action)
            VALUES ($1, $2, $3)
            ON CONFLICT (actor_id, target_id) 
            DO UPDATE SET action = EXCLUDED.action, updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const result = await pool.query(query, [actorId, target_id, action]);

        // Check for mutual match if action is 'like'
        let isMatch = false;
        if (action === 'like') {
            const checkMatch = await pool.query(`
                SELECT id FROM interactions 
                WHERE actor_id = $1 AND target_id = $2 AND action = 'like'
            `, [target_id, actorId]);
            
            if (checkMatch.rows.length > 0) {
                isMatch = true;
                // We could also fire a notification event here
                try {
                    await pool.query(`
                        INSERT INTO notifications (user_id, title, message, type, action_url)
                        VALUES 
                        ($1, 'New Match!', 'You and a new user liked each other.', 'match', '/matches'),
                        ($2, 'New Match!', 'You and a new user liked each other.', 'match', '/matches')
                    `, [actorId, target_id]);
                } catch(e) {
                    console.error("Error creating match notification", e);
                }
            }
        }

        res.json({ success: true, interaction: result.rows[0], isMatch });
    } catch (err) {
        console.error("Error saving interaction:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
