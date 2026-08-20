const visitorModel = require("../models/visitorModel");

// GET /api/visitors — users who viewed my profile
async function getVisitors(req, res) {
    try {
        const rows = await visitorModel.getVisitors(req.user.id);
        const visitors = rows.map(v => ({
            id: v.visitor_id,
            name: v.first_name ? `${v.first_name} ${v.last_name || ''}`.trim() : "Unknown",
            city: v.city || "Not specified",
            time: v.time,
            image: v.image || null,
        }));
        res.json(visitors);
    } catch (err) {
        console.error("Error fetching visitors:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// POST /api/visitors — record a profile view
async function recordVisit(req, res) {
    try {
        const viewerId = req.user.id;
        const { viewed_id } = req.body;

        if (!viewed_id) {
            return res.status(400).json({ message: "viewed_id is required" });
        }
        if (viewerId === viewed_id) {
            return res.status(200).json({ message: "Viewed self, ignored" });
        }

        if (await visitorModel.isBlockedEitherWay(viewerId, viewed_id)) {
            return res.status(200).json({ message: "Blocked relationship, not recorded." });
        }

        if (await visitorModel.hasRecentView(viewerId, viewed_id)) {
            return res.json({ success: true, deduped: true });
        }

        await visitorModel.recordView(viewerId, viewed_id);

        // Notify the profile owner — best-effort, never blocks the view itself.
        try {
            const viewerName = (await visitorModel.getFirstName(viewerId)) || "Someone";
            await visitorModel.notifyProfileView(viewed_id, viewerName);
        } catch (e) {
            console.error("Error creating profile view notification", e);
        }

        res.json({ success: true, deduped: false });
    } catch (err) {
        console.error("Error recording visitor:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// GET /api/visitors/stats
async function getVisitorStats(req, res) {
    try {
        const { totalViews, uniqueViews, weeklyViews, uniqueWeeklyViews, dailyRows } =
            await visitorModel.getStats(req.user.id);

        const chartData = dailyRows.map(row => ({
            day: new Date(row.day).toLocaleDateString("en-US", { weekday: "short" }),
            value: parseInt(row.count, 10),
        }));

        res.json({
            stats: [
                { label: "Profile Views", value: totalViews.toString(), sub: `${weeklyViews} this week`, subColor: "text-green-600", iconBg: "bg-pink-50" },
                { label: "Unique Visitors", value: uniqueViews.toString(), sub: `${uniqueWeeklyViews} this week`, subColor: "text-green-600", iconBg: "bg-pink-50" },
            ],
            chartData,
        });
    } catch (err) {
        console.error("Error fetching visitor stats:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getVisitors, recordVisit, getVisitorStats };
