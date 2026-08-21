const pool = require("../db");

/**
 * Discovery/recommendation feed for GET /api/matches — real candidates the
 * current user hasn't interacted with yet. Distinct from models/matchModel.js,
 * which owns the `matches` table (mutual-match records).
 */

async function getSelfPreferences(userId) {
    const result = await pool.query(
        `SELECT gender, partner_age_range, partner_marital_status, partner_education
         FROM user_profiles WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0] || {};
}

async function getPreferredCountryIds(userId) {
    const result = await pool.query(
        `SELECT country_id FROM user_preferred_countries WHERE user_id = $1`,
        [userId]
    );
    return new Set(result.rows.map(r => r.country_id));
}

// Candidates: not me, active, no existing interaction, not blocked either
// way, visible to everyone, opposite gender (only applied if the viewer's
// own gender is known — an incomplete profile gets unfiltered results
// rather than an empty list).
async function getCandidates(userId, selfGender) {
    const params = [userId];
    let genderClause = "";
    if (selfGender === "Male" || selfGender === "Female") {
        genderClause = `AND up.gender = $2`;
        params.push(selfGender === "Male" ? "Female" : "Male");
    }

    const query = `
        SELECT
            u.id, u.first_name, u.last_name,
            up.profile_photo_url as image,
            up.gender, up.date_of_birth, up.marital_status, up.country_id,
            up.city, up.state, up.nationality,
            up.occupation as profession, up.education,
            up.religion, up.sect, up.about_me,
            u.created_at, u.last_login, COALESCE(us.online_status, true) AS online_status_enabled,
            EXISTS (
                SELECT 1 FROM subscriptions s
                WHERE s.user_id = u.id AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
            ) AS is_premium
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN interactions i ON i.actor_id = $1 AND i.target_id = u.id
        LEFT JOIN blocks b ON (b.blocker_id = $1 AND b.blocked_id = u.id) OR (b.blocked_id = $1 AND b.blocker_id = u.id)
        LEFT JOIN user_settings us ON us.user_id = u.id
        WHERE u.id != $1 AND u.is_active = true AND i.id IS NULL AND b.id IS NULL
          -- A user with 'matches'-only visibility can never legitimately appear
          -- here: this list is precisely people you have NOT matched with yet.
          AND COALESCE(us.profile_visibility, 'everyone') = 'everyone'
          ${genderClause}
        ORDER BY u.created_at DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
}

module.exports = { getSelfPreferences, getPreferredCountryIds, getCandidates };
