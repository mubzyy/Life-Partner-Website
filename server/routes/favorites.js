const express = require("express");
const router = express.Router();
const pool = require("../db");

// authMiddleware should ideally be imported, but we can verify token inline or assume it's attached via middleware before this route
// Let's create a simple auth middleware inline if we need to verify JWT
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// Get all favorites for the logged in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`SELECT target_profile_id, created_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching favorites:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Toggle a favorite profile
router.post("/toggle", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { target_profile_id } = req.body;
        
        if (!target_profile_id) {
            return res.status(400).json({ message: "target_profile_id is required" });
        }

        // Check if it exists
        const check = await pool.query(`SELECT id FROM favorites WHERE user_id = $1 AND target_profile_id = $2`, [userId, target_profile_id]);
        
        if (check.rows.length > 0) {
            // Remove it
            await pool.query(`DELETE FROM favorites WHERE user_id = $1 AND target_profile_id = $2`, [userId, target_profile_id]);
            return res.json({ action: "removed", target_profile_id });
        } else {
            // Add it
            await pool.query(`INSERT INTO favorites (user_id, target_profile_id) VALUES ($1, $2)`, [userId, target_profile_id]);
            return res.json({ action: "added", target_profile_id });
        }
    } catch (err) {
        console.error("Error toggling favorite:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
