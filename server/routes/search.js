const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// POST /api/search
// Body expects optional filters:
// { minAge, maxAge, gender, religion, sect, maritalStatus, city }
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { minAge, maxAge, gender, religion, sect, maritalStatus, city } = req.body;

        let query = `
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
            LEFT JOIN blocks b ON (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocked_id = $1 AND b.blocker_id = u.id)
            WHERE u.id != $1 AND u.is_active = true AND b.id IS NULL
        `;
        
        const params = [userId];
        let paramIndex = 2;

        if (gender && gender !== 'Any') {
            query += ` AND up.gender = $${paramIndex}`;
            params.push(gender);
            paramIndex++;
        }

        if (religion && religion !== 'Any') {
            query += ` AND up.religion = $${paramIndex}`;
            params.push(religion);
            paramIndex++;
        }

        if (sect && sect !== 'Any') {
            query += ` AND up.sect = $${paramIndex}`;
            params.push(sect);
            paramIndex++;
        }

        if (maritalStatus && maritalStatus !== 'Any') {
            query += ` AND up.marital_status = $${paramIndex}`;
            params.push(maritalStatus);
            paramIndex++;
        }

        if (city && city !== 'Any') {
            query += ` AND up.city ILIKE $${paramIndex}`;
            params.push(`%${city}%`);
            paramIndex++;
        }
        
        // Age is calculated dynamically since it's based on date_of_birth.
        // Better to filter it in memory if table is small, but for prod we should do it in SQL:
        if (minAge) {
            query += ` AND EXTRACT(YEAR FROM age(CURRENT_DATE, up.date_of_birth)) >= $${paramIndex}`;
            params.push(minAge);
            paramIndex++;
        }
        
        if (maxAge) {
            query += ` AND EXTRACT(YEAR FROM age(CURRENT_DATE, up.date_of_birth)) <= $${paramIndex}`;
            params.push(maxAge);
            paramIndex++;
        }

        query += ` ORDER BY u.created_at DESC LIMIT 50`;

        const result = await pool.query(query, params);
        const profiles = result.rows.map(profile => {
            let age = null;
            if (profile.date_of_birth) {
                const dob = new Date(profile.date_of_birth);
                const diff = Date.now() - dob.getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }
            
            return {
                id: profile.id,
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
                online: false // Mock status for now
            };
        });

        res.json(profiles);
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).json({ message: "Server error fetching search results" });
    }
});

module.exports = router;
