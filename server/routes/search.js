const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { isOnline } = require("../lib/presence");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// POST /api/search
// Body expects optional filters:
// { query, minAge, maxAge, gender, religion, sect, maritalStatus, city,
//   education, profession, page, limit }
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            query: searchText, minAge, maxAge, gender, religion, sect,
            maritalStatus, city, education, profession,
        } = req.body;

        const page = Math.max(1, parseInt(req.body.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.body.limit, 10) || DEFAULT_LIMIT));
        const offset = (page - 1) * limit;

        // Every filter below is a parameterized condition appended to this
        // array — never string-concatenated user input — and the exact same
        // WHERE clause backs both the COUNT and the paginated SELECT, so the
        // reported total always matches what's actually being paged through.
        const conditions = [
            "u.id != $1",
            "u.is_active = true",
            "b.id IS NULL",
            `(
                COALESCE(us.profile_visibility, 'everyone') = 'everyone'
                OR (
                    COALESCE(us.profile_visibility, 'everyone') = 'matches'
                    AND EXISTS (
                        SELECT 1 FROM interactions i1
                        JOIN interactions i2 ON i1.actor_id = i2.target_id AND i1.target_id = i2.actor_id
                        WHERE i1.actor_id = $1 AND i1.target_id = u.id AND i1.action = 'like' AND i2.action = 'like'
                    )
                )
            )`,
        ];
        const params = [userId];
        let i = 2;

        if (gender && gender !== "Any") {
            conditions.push(`up.gender = $${i++}`);
            params.push(gender);
        }
        if (religion && religion !== "Any") {
            conditions.push(`up.religion = $${i++}`);
            params.push(religion);
        }
        if (sect && sect !== "Any") {
            conditions.push(`up.sect = $${i++}`);
            params.push(sect);
        }
        if (maritalStatus && maritalStatus !== "Any") {
            conditions.push(`up.marital_status = $${i++}`);
            params.push(maritalStatus);
        }
        if (education && education !== "Any") {
            conditions.push(`up.education = $${i++}`);
            params.push(education);
        }
        if (city) {
            conditions.push(`up.city ILIKE $${i++}`);
            params.push(`%${city}%`);
        }
        if (profession) {
            conditions.push(`up.occupation ILIKE $${i++}`);
            params.push(`%${profession}%`);
        }
        if (minAge) {
            conditions.push(`EXTRACT(YEAR FROM age(CURRENT_DATE, up.date_of_birth)) >= $${i++}`);
            params.push(minAge);
        }
        if (maxAge) {
            conditions.push(`EXTRACT(YEAR FROM age(CURRENT_DATE, up.date_of_birth)) <= $${i++}`);
            params.push(maxAge);
        }
        if (searchText && searchText.trim()) {
            conditions.push(`(
                (u.first_name || ' ' || COALESCE(u.last_name, '')) ILIKE $${i}
                OR up.occupation ILIKE $${i}
            )`);
            params.push(`%${searchText.trim()}%`);
            i++;
        }

        const fromClause = `
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN blocks b ON (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocked_id = $1 AND b.blocker_id = u.id)
            LEFT JOIN user_settings us ON us.user_id = u.id
            WHERE ${conditions.join(" AND ")}
        `;

        const countResult = await pool.query(`SELECT COUNT(*) ${fromClause}`, params);
        const total = parseInt(countResult.rows[0].count, 10);

        const dataParams = [...params, limit, offset];
        const result = await pool.query(
            `SELECT
                u.id, u.first_name, u.last_name,
                up.profile_photo_url as image,
                up.gender, up.date_of_birth, up.marital_status,
                up.city, up.state, up.nationality,
                up.occupation as profession, up.education,
                up.religion, up.sect, up.about_me,
                u.created_at, u.last_login, COALESCE(us.online_status, true) AS online_status_enabled,
                EXISTS (
                    SELECT 1 FROM subscriptions s
                    WHERE s.user_id = u.id AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
                ) AS is_premium
             ${fromClause}
             ORDER BY is_premium DESC, u.created_at DESC
             LIMIT $${i} OFFSET $${i + 1}`,
            dataParams
        );

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
                online: isOnline(profile.last_login, profile.online_status_enabled),
                isPremium: profile.is_premium,
            };
        });

        res.json({
            results: profiles,
            total,
            page,
            limit,
            hasNextPage: offset + profiles.length < total,
        });
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).json({ message: "Server error fetching search results" });
    }
});

module.exports = router;
