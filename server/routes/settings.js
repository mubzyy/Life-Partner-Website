const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// Canonical field list — matches the real user_settings columns exactly
// (see server/db_migrate.js). GET and PUT always speak this same shape,
// whether or not a row exists yet for the user.
const BOOLEAN_FIELDS = ["email_notifications", "push_notifications", "online_status", "read_receipts"];
const PROFILE_VISIBILITY_VALUES = ["everyone", "matches", "private"];
const LAST_SEEN_VISIBILITY_VALUES = ["everyone", "matches", "nobody"];

const DEFAULT_SETTINGS = {
    email_notifications: true,
    push_notifications: true,
    profile_visibility: "everyone",
    last_seen_visibility: "matches",
    online_status: true,
    read_receipts: true,
};

const SELECT_COLUMNS = "user_id, email_notifications, push_notifications, profile_visibility, last_seen_visibility, online_status, read_receipts, updated_at";

// GET /api/settings — the authenticated user's own settings, real DB columns only.
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`SELECT ${SELECT_COLUMNS} FROM user_settings WHERE user_id = $1`, [userId]);

        if (result.rows.length === 0) {
            // No row yet — return the same shape a saved row would have, with defaults.
            return res.json({ user_id: userId, ...DEFAULT_SETTINGS, updated_at: null });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/settings — partial update; only whitelisted, validated fields are written.
router.put("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const errors = [];
        const updates = {};

        for (const field of BOOLEAN_FIELDS) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                if (typeof req.body[field] !== "boolean") {
                    errors.push(`${field} must be true or false.`);
                } else {
                    updates[field] = req.body[field];
                }
            }
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "profile_visibility")) {
            if (!PROFILE_VISIBILITY_VALUES.includes(req.body.profile_visibility)) {
                errors.push(`profile_visibility must be one of: ${PROFILE_VISIBILITY_VALUES.join(", ")}.`);
            } else {
                updates.profile_visibility = req.body.profile_visibility;
            }
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "last_seen_visibility")) {
            if (!LAST_SEEN_VISIBILITY_VALUES.includes(req.body.last_seen_visibility)) {
                errors.push(`last_seen_visibility must be one of: ${LAST_SEEN_VISIBILITY_VALUES.join(", ")}.`);
            } else {
                updates.last_seen_visibility = req.body.last_seen_visibility;
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: "Validation failed.", errors });
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid settings fields were provided." });
        }

        await pool.query(
            `INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
            [userId]
        );

        const setClauses = [];
        const values = [];
        let i = 1;
        for (const [key, value] of Object.entries(updates)) {
            setClauses.push(`${key} = $${i}`);
            values.push(value);
            i += 1;
        }
        setClauses.push("updated_at = CURRENT_TIMESTAMP");
        values.push(userId);

        const result = await pool.query(
            `UPDATE user_settings SET ${setClauses.join(", ")} WHERE user_id = $${i} RETURNING ${SELECT_COLUMNS}`,
            values
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error saving settings:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
