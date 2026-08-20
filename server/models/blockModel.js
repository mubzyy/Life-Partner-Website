const pool = require("../db");

// Users I have blocked, most recently blocked first.
async function getBlockedUsers(userId) {
    const query = `
        SELECT
            b.id as block_id,
            u.id as blocked_user_id,
            u.first_name, u.last_name,
            up.profile_photo_url as image,
            up.city, up.state,
            b.created_at as blocked_date
        FROM blocks b
        JOIN users u ON b.blocked_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE b.blocker_id = $1
        ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
}

// Blocks a user. ON CONFLICT DO NOTHING — blocking an already-blocked user
// is a no-op, not an error.
async function blockUser(blockerId, blockedId, reason) {
    const result = await pool.query(
        `INSERT INTO blocks (blocker_id, blocked_id, reason)
         VALUES ($1, $2, $3)
         ON CONFLICT (blocker_id, blocked_id) DO NOTHING
         RETURNING *`,
        [blockerId, blockedId, reason]
    );
    return result.rows[0] || null;
}

async function unblockUser(blockerId, blockedId) {
    await pool.query(`DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2`, [blockerId, blockedId]);
}

module.exports = { getBlockedUsers, blockUser, unblockUser };
