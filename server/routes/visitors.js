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

        // We only insert if they haven't viewed in the last 24 hours to prevent spam, 
        // or we just insert every time. Let's just insert for now.
        const query = `
            INSERT INTO profile_views (viewer_id, viewed_id)
            VALUES ($1, $2)
        `;
        await pool.query(query, [viewerId, viewed_id]);

        res.json({ success: true });
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

        // Mock chart data for now, ideally we group by day
        const chartData = [
            { day: "Mon", value: 0 }, { day: "Tue", value: 0 }, { day: "Wed", value: 0 },
            { day: "Thu", value: 0 }, { day: "Fri", value: 0 }, { day: "Sat", value: 0 }, { day: "Sun", value: 0 }
        ];

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
