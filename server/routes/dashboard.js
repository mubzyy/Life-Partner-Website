const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Matches count (mutual likes)
        const matchesResult = await pool.query(`
            SELECT COUNT(*) FROM interactions i1
            JOIN interactions i2 ON i1.actor_id = i2.target_id AND i1.target_id = i2.actor_id
            WHERE i1.actor_id = $1 AND i1.interaction_type = 'like' AND i2.interaction_type = 'like'
        `, [userId]);
        const matchesCount = parseInt(matchesResult.rows[0].count);

        // 2. Unread messages count
        const msgResult = await pool.query(`
            SELECT COUNT(DISTINCT c.id) FROM conversations c
            JOIN messages m ON m.conversation_id = c.id
            WHERE (c.user1_id = $1 OR c.user2_id = $1)
              AND m.sender_id != $1
              AND m.read_status = false
        `, [userId]);
        const unreadMsgCount = parseInt(msgResult.rows[0].count);

        // 3. Profile views count
        const viewsResult = await pool.query(`
            SELECT COUNT(*) FROM profile_views WHERE viewed_id = $1
        `, [userId]);
        const viewsCount = parseInt(viewsResult.rows[0].count);

        // 4. Who likes me count
        const likesResult = await pool.query(`
            SELECT COUNT(*) FROM interactions WHERE target_id = $1 AND interaction_type = 'like'
        `, [userId]);
        const likesCount = parseInt(likesResult.rows[0].count);

        // Recent activity (combining views and likes)
        const activityQuery = `
            (
                SELECT u.id, u.first_name, u.last_name, up.profile_photo_url as image, 
                       'viewed your profile' as action, pv.created_at as time
                FROM profile_views pv
                JOIN users u ON pv.viewer_id = u.id
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE pv.viewed_id = $1
            )
            UNION ALL
            (
                SELECT u.id, u.first_name, u.last_name, up.profile_photo_url as image, 
                       'liked your profile' as action, i.created_at as time
                FROM interactions i
                JOIN users u ON i.actor_id = u.id
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE i.target_id = $1 AND i.interaction_type = 'like'
            )
            ORDER BY time DESC LIMIT 5
        `;
        const activityResult = await pool.query(activityQuery, [userId]);
        const recentActivity = activityResult.rows.map(row => ({
            name: `${row.first_name} ${row.last_name || ''}`.trim(),
            action: row.action,
            time: row.time,
            image: row.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
            online: false // Mock for now
        }));

        res.json({
            stats: {
                matches: matchesCount,
                messages: unreadMsgCount,
                views: viewsCount,
                likes: likesCount
            },
            recentActivity
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
