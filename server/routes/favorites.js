const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");


// Get all favorites for the logged in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT 
                u.id as target_profile_id, u.first_name, u.last_name, 
                up.profile_photo_url as image, 
                up.gender, up.date_of_birth, up.marital_status, 
                up.city, up.state, up.nationality,
                up.occupation as profession, up.education, 
                up.religion, up.sect, up.about_me,
                f.created_at
            FROM favorites f
            JOIN users u ON f.target_profile_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            WHERE f.user_id = $1
            ORDER BY f.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        
        const favorites = result.rows.map(profile => {
            let age = null;
            if (profile.date_of_birth) {
                const dob = new Date(profile.date_of_birth);
                const diff = Date.now() - dob.getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }
            
            return {
                id: profile.target_profile_id,
                target_profile_id: profile.target_profile_id,
                name: profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : "Unknown",
                age: age || "N/A",
                gender: profile.gender,
                maritalStatus: profile.marital_status,
                religion: profile.religion,
                sect: profile.sect,
                profession: profile.profession || "Not specified",
                city: profile.city || "Not specified",
                edu: profile.education || "Not specified",
                image: profile.image || null,
                online: false
            };
        });

        res.json(favorites);
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
