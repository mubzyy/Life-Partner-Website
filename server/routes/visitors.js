const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// GET /api/visitors
// Fetch users who viewed my profile
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
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
        
        const visitors = result.rows.map(v => ({
            id: v.visitor_id,
            name: v.first_name ? `${v.first_name} ${v.last_name || ''}`.trim() : "Unknown",
            city: v.city || "Not specified",
            time: v.time,
            image: v.image || null
        }));

        res.json(visitors);
    } catch (err) {
        console.error("Error fetching visitors:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/visitors
// Record a profile view
router.post("/", authMiddleware, async (req, res) => {
    try {
        const viewerId = req.user.id;
        const { viewed_id } = req.body;

        if (!viewed_id) {
            return res.status(400).json({ message: "viewed_id is required" });
        }

        if (viewerId === viewed_id) {
            return res.status(200).json({ message: "Viewed self, ignored" });
        }

        const blockCheck = await pool.query(
            `SELECT id FROM blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)`,
            [viewerId, viewed_id]
        );
        if (blockCheck.rows.length > 0) {
            return res.status(200).json({ message: "Blocked relationship, not recorded." });
        }

        // Dedup: don't record (or re-notify) a repeat view from the same
        // viewer within a 24h window — refreshing/reopening a profile
        // shouldn't spam the owner's notifications or inflate their view count.
        const recent = await pool.query(
            `SELECT id FROM profile_views
             WHERE viewer_id = $1 AND viewed_id = $2 AND viewed_at >= NOW() - INTERVAL '24 hours'`,
            [viewerId, viewed_id]
        );
        if (recent.rows.length > 0) {
            return res.json({ success: true, deduped: true });
        }

        await pool.query(
            `INSERT INTO profile_views (viewer_id, viewed_id) VALUES ($1, $2)`,
            [viewerId, viewed_id]
        );

        // Notify the profile owner — best-effort, never blocks the view itself.
        try {
            const viewer = await pool.query("SELECT first_name FROM users WHERE id = $1", [viewerId]);
            const viewerName = viewer.rows[0]?.first_name || "Someone";
            await pool.query(`
                INSERT INTO notifications (user_id, title, message, type, action_url)
                VALUES ($1, 'Profile View', $2, 'view', '/visitors')
            `, [viewed_id, `${viewerName} viewed your profile.`]);
        } catch (e) {
            console.error("Error creating profile view notification", e);
        }

        res.json({ success: true, deduped: false });
    } catch (err) {
        console.error("Error recording visitor:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// GET /api/visitors/stats
router.get("/stats", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Total views
        const totalResult = await pool.query(`SELECT COUNT(*) as count FROM profile_views WHERE viewed_id = $1`, [userId]);
        const totalViews = parseInt(totalResult.rows[0].count);

        // Unique viewers
        const uniqueResult = await pool.query(`SELECT COUNT(DISTINCT viewer_id) as count FROM profile_views WHERE viewed_id = $1`, [userId]);
        const uniqueViews = parseInt(uniqueResult.rows[0].count);

        // Views this week (last 7 days)
        const weeklyResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM profile_views 
            WHERE viewed_id = $1 AND viewed_at >= NOW() - INTERVAL '7 days'
        `, [userId]);
        const weeklyViews = parseInt(weeklyResult.rows[0].count);
        
        const uniqueWeeklyResult = await pool.query(`
            SELECT COUNT(DISTINCT viewer_id) as count 
            FROM profile_views 
            WHERE viewed_id = $1 AND viewed_at >= NOW() - INTERVAL '7 days'
        `, [userId]);
        const uniqueWeeklyViews = parseInt(uniqueWeeklyResult.rows[0].count);

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
        const chartData = dailyResult.rows.map(row => ({
            day: new Date(row.day).toLocaleDateString("en-US", { weekday: "short" }),
            value: parseInt(row.count, 10),
        }));

        res.json({
            stats: [
                { label: "Profile Views", value: totalViews.toString(), sub: `${weeklyViews} this week`, subColor: "text-green-600", iconBg: "bg-pink-50" },
                { label: "Unique Visitors", value: uniqueViews.toString(), sub: `${uniqueWeeklyViews} this week`, subColor: "text-green-600", iconBg: "bg-pink-50" }
            ],
            chartData
        });
    } catch (err) {
        console.error("Error fetching visitor stats:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
