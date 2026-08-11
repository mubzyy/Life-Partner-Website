const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");


// GET /api/matches
// Returns eligible profiles excluding the current user.
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch current user's preferences to calculate match score
        const currentUserProfileResult = await pool.query(
            "SELECT partner_age_range, partner_countries, partner_marital_status, partner_education, partner_occupation, partner_height_range FROM user_profiles WHERE user_id = $1",
            [userId]
        );
        const userPrefs = currentUserProfileResult.rows[0] || {};

        // Fetch all other users that the current user hasn't interacted with yet and hasn't blocked/been blocked by
        const query = `
            SELECT 
                u.id, u.first_name, u.last_name, 
                up.profile_photo_url as image, 
                up.gender, up.date_of_birth, up.marital_status, 
                up.city, up.state, up.nationality,
                up.occupation as profession, up.education, 
                up.religion, up.sect, up.about_me,
                u.created_at
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN interactions i ON i.actor_id = $1 AND i.target_id = u.id
            LEFT JOIN blocks b ON (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocked_id = $1 AND b.blocker_id = u.id)
            WHERE u.id != $1 AND u.is_active = true AND i.id IS NULL AND b.id IS NULL
            ORDER BY u.created_at DESC
        `;
        
        const result = await pool.query(query, [userId]);
        const candidates = result.rows;

        // Calculate age and pseudo-match score
        const processedMatches = candidates.map(candidate => {
            let age = null;
            if (candidate.date_of_birth) {
                const dob = new Date(candidate.date_of_birth);
                const diff = Date.now() - dob.getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }

            // Simple pseudo-matching logic (base 60%)
            let score = 60;
            const tags = [];
            
            if (userPrefs.partner_marital_status && candidate.marital_status && userPrefs.partner_marital_status.includes(candidate.marital_status)) {
                score += 15;
                tags.push("Similar Values");
            }
            if (userPrefs.partner_education && candidate.education && userPrefs.partner_education.includes(candidate.education)) {
                score += 10;
                tags.push("Education");
            }
            if (userPrefs.partner_occupation && candidate.profession && userPrefs.partner_occupation.includes(candidate.profession)) {
                score += 10;
                tags.push("Career");
            }
            if (candidate.city) {
                tags.push("Location");
            }

            // Cap at 98%
            score = Math.min(score, 98);

            return {
                id: candidate.id,
                name: candidate.first_name ? `${candidate.first_name} ${candidate.last_name || ''}`.trim() : "Unknown",
                age: age || "N/A",
                profession: candidate.profession || "Not specified",
                city: candidate.city || "Not specified",
                image: candidate.image || null, // We'll handle fallback on the frontend
                matchScore: score,
                match: `${score}% Match`,
                tags: tags.slice(0, 3), // Max 3 tags
                status: "Offline", // Mock status for now
                new: true
            };
        });

        // Sort by highest match score
        processedMatches.sort((a, b) => b.matchScore - a.matchScore);

        res.json(processedMatches);
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ message: "Server error fetching matches" });
    }
});

module.exports = router;
