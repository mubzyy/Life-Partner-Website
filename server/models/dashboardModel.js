const pool = require("../db");

async function getMatchesCount(userId) {
    const result = await pool.query(
        `SELECT COUNT(*) FROM matches WHERE (user_low_id = $1 OR user_high_id = $1) AND status = 'active'`,
        [userId]
    );
    return parseInt(result.rows[0].count);
}

// Unread messages count — conversations has no user1_id/user2_id; membership
// is via conversation_participants, and the "unread" flag is
// messages.is_read (not read_status).
async function getUnreadMessagesCount(userId) {
    const result = await pool.query(`
        SELECT COUNT(DISTINCT c.id) FROM conversations c
        JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
        JOIN messages m ON m.conversation_id = c.id
        WHERE m.sender_id != $1
          AND m.is_read = false
    `, [userId]);
    return parseInt(result.rows[0].count);
}

async function getViewsCount(userId) {
    const result = await pool.query(`SELECT COUNT(*) FROM profile_views WHERE viewed_id = $1`, [userId]);
    return parseInt(result.rows[0].count);
}

async function getLikesCount(userId) {
    const result = await pool.query(`SELECT COUNT(*) FROM interactions WHERE target_id = $1 AND action = 'like'`, [userId]);
    return parseInt(result.rows[0].count);
}

// Recent activity (combining views and likes) — profile_views has no
// created_at, its timestamp column is viewed_at.
async function getRecentActivity(userId) {
    const activityQuery = `
        (
            SELECT u.id, u.first_name, u.last_name, up.profile_photo_url as image,
                   u.last_login, COALESCE(us.online_status, true) AS online_status_enabled,
                   'viewed your profile' as action, pv.viewed_at as time
            FROM profile_views pv
            JOIN users u ON pv.viewer_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_settings us ON us.user_id = u.id
            WHERE pv.viewed_id = $1
        )
        UNION ALL
        (
            SELECT u.id, u.first_name, u.last_name, up.profile_photo_url as image,
                   u.last_login, COALESCE(us.online_status, true) AS online_status_enabled,
                   'liked your profile' as action, i.created_at as time
            FROM interactions i
            JOIN users u ON i.actor_id = u.id
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_settings us ON us.user_id = u.id
            WHERE i.target_id = $1 AND i.action = 'like'
        )
        ORDER BY time DESC LIMIT 5
    `;
    const result = await pool.query(activityQuery, [userId]);
    return result.rows;
}

// Weekly activity trend — real per-day counts for the last 7 days (today
// inclusive). One query per metric (rather than one fan-out join) so counts
// can't inflate each other.
async function getWeeklySeries(userId) {
    const dayRange = `generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS gs`;
    const [viewsSeries, matchesSeries, messagesSeries, likesSeries] = await Promise.all([
        pool.query(`
            SELECT gs::date AS day, COUNT(pv.id) AS count
            FROM ${dayRange}
            LEFT JOIN profile_views pv ON pv.viewed_id = $1 AND pv.viewed_at::date = gs::date
            GROUP BY gs::date ORDER BY gs::date
        `, [userId]),
        pool.query(`
            SELECT gs::date AS day, COUNT(m.id) AS count
            FROM ${dayRange}
            LEFT JOIN matches m ON (m.user_low_id = $1 OR m.user_high_id = $1)
                AND m.status = 'active' AND m.matched_at::date = gs::date
            GROUP BY gs::date ORDER BY gs::date
        `, [userId]),
        pool.query(`
            SELECT gs::date AS day, COUNT(m.id) AS count
            FROM ${dayRange}
            LEFT JOIN messages m ON m.sender_id = $1 AND m.created_at::date = gs::date
            GROUP BY gs::date ORDER BY gs::date
        `, [userId]),
        pool.query(`
            SELECT gs::date AS day, COUNT(i.id) AS count
            FROM ${dayRange}
            LEFT JOIN interactions i ON i.target_id = $1 AND i.action = 'like' AND i.created_at::date = gs::date
            GROUP BY gs::date ORDER BY gs::date
        `, [userId]),
    ]);
    return { viewsSeries, matchesSeries, messagesSeries, likesSeries };
}

module.exports = {
    getMatchesCount, getUnreadMessagesCount, getViewsCount, getLikesCount,
    getRecentActivity, getWeeklySeries,
};
