const pool = require("../db");

// Full profile rows for everyone the user has favorited, most recently
// favorited first.
async function getFavoritesByUser(userId) {
    const query = `
        SELECT
            u.id as target_profile_id, u.first_name, u.last_name,
            up.profile_photo_url as image,
            up.gender, up.date_of_birth, up.marital_status,
            up.city, up.state, up.nationality,
            up.occupation as profession, up.education,
            up.religion, up.sect, up.about_me,
            u.last_login, COALESCE(us.online_status, true) AS online_status_enabled,
            f.created_at
        FROM favorites f
        JOIN users u ON f.target_profile_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN user_settings us ON us.user_id = u.id
        WHERE f.user_id = $1
        ORDER BY f.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
}

async function findFavorite(userId, targetProfileId) {
    const result = await pool.query(
        `SELECT id FROM favorites WHERE user_id = $1 AND target_profile_id = $2`,
        [userId, targetProfileId]
    );
    return result.rows[0] || null;
}

async function removeFavorite(userId, targetProfileId) {
    await pool.query(`DELETE FROM favorites WHERE user_id = $1 AND target_profile_id = $2`, [userId, targetProfileId]);
}

async function addFavorite(userId, targetProfileId) {
    await pool.query(`INSERT INTO favorites (user_id, target_profile_id) VALUES ($1, $2)`, [userId, targetProfileId]);
}

async function getFirstName(userId) {
    const result = await pool.query("SELECT first_name FROM users WHERE id = $1", [userId]);
    return result.rows[0]?.first_name || null;
}

async function notifyNewFavorite(targetProfileId, actorName) {
    await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, action_url)
        VALUES ($1, 'New Favorite', $2, 'favorite', '/visitors')
    `, [targetProfileId, `${actorName} added you to their favorites.`]);
}

module.exports = { getFavoritesByUser, findFavorite, removeFavorite, addFavorite, getFirstName, notifyNewFavorite };
