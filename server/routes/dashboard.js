const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { isOnline } = require("../lib/presence");

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Matches count — real persisted matches, not a derived self-join.
        const matchesResult = await pool.query(
            `SELECT COUNT(*) FROM matches WHERE (user_low_id = $1 OR user_high_id = $1) AND status = 'active'`,
            [userId]
        );
        const matchesCount = parseInt(matchesResult.rows[0].count);

        // 2. Unread messages count — conversations has no user1_id/user2_id; membership is via
        //    conversation_participants, and the "unread" flag is messages.is_read (not read_status).
        const msgResult = await pool.query(`
            SELECT COUNT(DISTINCT c.id) FROM conversations c
            JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = $1
            JOIN messages m ON m.conversation_id = c.id
            WHERE m.sender_id != $1
              AND m.is_read = false
        `, [userId]);
        const unreadMsgCount = parseInt(msgResult.rows[0].count);

        // 3. Profile views count
        const viewsResult = await pool.query(`
            SELECT COUNT(*) FROM profile_views WHERE viewed_id = $1
        `, [userId]);
        const viewsCount = parseInt(viewsResult.rows[0].count);

        // 4. Who likes me count
        const likesResult = await pool.query(`
            SELECT COUNT(*) FROM interactions WHERE target_id = $1 AND action = 'like'
        `, [userId]);
        const likesCount = parseInt(likesResult.rows[0].count);

        // Recent activity (combining views and likes) — profile_views has no created_at,
        // its timestamp column is viewed_at.
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
        const activityResult = await pool.query(activityQuery, [userId]);
        const recentActivity = activityResult.rows.map(row => ({
            name: `${row.first_name} ${row.last_name || ''}`.trim(),
            action: row.action,
            time: row.time,
            image: row.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
            online: isOnline(row.last_login, row.online_status_enabled)
        }));

        // Weekly activity trend — real per-day counts for the last 7 days (today inclusive),
        // replacing the previously hardcoded sparkline + legend numbers. One query per metric
        // (rather than one fan-out join) so counts can't inflate each other.
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

        const dayLabel = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" });
        const weeklyActivity = {
            days: viewsSeries.rows.map((r) => dayLabel(r.day)),
            views: viewsSeries.rows.map((r) => parseInt(r.count, 10)),
            matches: matchesSeries.rows.map((r) => parseInt(r.count, 10)),
            messagesSent: messagesSeries.rows.map((r) => parseInt(r.count, 10)),
            likesReceived: likesSeries.rows.map((r) => parseInt(r.count, 10)),
        };
        const sum = (arr) => arr.reduce((a, b) => a + b, 0);

        res.json({
            stats: {
                matches: matchesCount,
                messages: unreadMsgCount,
                views: viewsCount,
                likes: likesCount
            },
            recentActivity,
            weeklyActivity,
            weeklyTotals: {
                views: sum(weeklyActivity.views),
                matches: sum(weeklyActivity.matches),
                messagesSent: sum(weeklyActivity.messagesSent),
                likesReceived: sum(weeklyActivity.likesReceived),
            }
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
