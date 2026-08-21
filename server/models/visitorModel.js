const pool = require("../db");

async function getVisitors(userId) {
    const query = `
        SELECT
            u.id as visitor_id, u.first_name, u.last_name,
            up.profile_photo_url as image,
            up.city, up.state,
            pv.viewed_at as time
        FROM profile_views pv
        JOIN users u ON pv.viewer_id = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE pv.viewed_id = $1
        ORDER BY pv.viewed_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
}

async function isBlockedEitherWay(userAId, userBId) {
    const result = await pool.query(
        `SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
        [userAId, userBId]
    );
    return result.rows.length > 0;
}

// Dedup: don't record (or re-notify) a repeat view from the same viewer
// within a 24h window — refreshing/reopening a profile shouldn't spam the
// owner's notifications or inflate their view count.
async function hasRecentView(viewerId, viewedId) {
    const result = await pool.query(
        `SELECT id FROM profile_views
         WHERE viewer_id = $1 AND viewed_id = $2 AND viewed_at >= NOW() - INTERVAL '24 hours'`,
        [viewerId, viewedId]
    );
    return result.rows.length > 0;
}

async function recordView(viewerId, viewedId) {
    await pool.query(`INSERT INTO profile_views (viewer_id, viewed_id) VALUES ($1, $2)`, [viewerId, viewedId]);
}

async function getFirstName(userId) {
    const result = await pool.query("SELECT first_name FROM users WHERE id = $1", [userId]);
    return result.rows[0]?.first_name || null;
}

async function notifyProfileView(viewedId, viewerName) {
    await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, action_url)
        VALUES ($1, 'Profile View', $2, 'view', '/visitors')
    `, [viewedId, `${viewerName} viewed your profile.`]);
}

async function getStats(userId) {
    const totalResult = await pool.query(`SELECT COUNT(*) as count FROM profile_views WHERE viewed_id = $1`, [userId]);
    const uniqueResult = await pool.query(`SELECT COUNT(DISTINCT viewer_id) as count FROM profile_views WHERE viewed_id = $1`, [userId]);
    const weeklyResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM profile_views
        WHERE viewed_id = $1 AND viewed_at >= NOW() - INTERVAL '7 days'
    `, [userId]);
    const uniqueWeeklyResult = await pool.query(`
        SELECT COUNT(DISTINCT viewer_id) as count
        FROM profile_views
        WHERE viewed_id = $1 AND viewed_at >= NOW() - INTERVAL '7 days'
    `, [userId]);

    // Real per-day counts for the last 7 days (today inclusive). Days with
    // zero views still appear, via generate_series + LEFT JOIN, so the
    // chart's x-axis is always a complete week rather than only days that
    // happened to have activity.
    const dailyResult = await pool.query(`
        SELECT gs::date AS day, COUNT(pv.id) AS count
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS gs
        LEFT JOIN profile_views pv ON pv.viewed_id = $1 AND pv.viewed_at::date = gs::date
        GROUP BY gs::date
        ORDER BY gs::date
    `, [userId]);

    return {
        totalViews: parseInt(totalResult.rows[0].count),
        uniqueViews: parseInt(uniqueResult.rows[0].count),
        weeklyViews: parseInt(weeklyResult.rows[0].count),
        uniqueWeeklyViews: parseInt(uniqueWeeklyResult.rows[0].count),
        dailyRows: dailyResult.rows,
    };
}

module.exports = {
    getVisitors, isBlockedEitherWay, hasRecentView, recordView,
    getFirstName, notifyProfileView, getStats,
};
