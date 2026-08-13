const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { ensureMatch, orderPair } = require("../lib/matching");

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

        // A blocked relationship (either direction) must not be able to
        // produce a new like/pass, a match, or a notification — mirrors the
        // block enforcement already applied in profile.js and visitors.js.
        const blockCheck = await pool.query(
            `SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
            [actorId, target_id]
        );
        if (blockCheck.rows.length > 0) {
            return res.status(403).json({ message: "This action is not available." });
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
                // Persist the real match record — never just "matched: true"
                // in the response. ensureMatch is idempotent (UNIQUE-backed),
                // so re-liking after already matching can't create a duplicate.
                const newlyMatched = await ensureMatch(pool, actorId, target_id);
                isMatch = true;
                if (newlyMatched) {
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
            } else {
                // Not (yet) mutual — still let the target know someone liked them.
                try {
                    const actor = await pool.query("SELECT first_name FROM users WHERE id = $1", [actorId]);
                    const actorName = actor.rows[0]?.first_name || "Someone";
                    await pool.query(`
                        INSERT INTO notifications (user_id, title, message, type, action_url)
                        VALUES ($1, 'New Like', $2, 'like', '/visitors')
                    `, [target_id, `${actorName} liked your profile.`]);
                } catch (e) {
                    console.error("Error creating like notification", e);
                }
            }
        } else if (action === 'pass') {
            // If a pass reverses a previous like that had formed a match,
            // the match is no longer real — don't leave a stale 'active' row.
            const [low, high] = orderPair(actorId, target_id);
            await pool.query(
                `UPDATE matches SET status = 'unmatched' WHERE user_low_id = $1 AND user_high_id = $2 AND status = 'active'`,
                [low, high]
            );
        }

        res.json({ success: true, interaction: result.rows[0], isMatch });
    } catch (err) {
        console.error("Error saving interaction:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
