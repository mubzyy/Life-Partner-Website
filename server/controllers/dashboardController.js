const dashboardModel = require("../models/dashboardModel");
const { isOnline } = require("../lib/presence");

// GET /api/dashboard
async function getDashboard(req, res) {
    try {
        const userId = req.user.id;

        const [matchesCount, unreadMsgCount, viewsCount, likesCount, activityRows, weekly] = await Promise.all([
            dashboardModel.getMatchesCount(userId),
            dashboardModel.getUnreadMessagesCount(userId),
            dashboardModel.getViewsCount(userId),
            dashboardModel.getLikesCount(userId),
            dashboardModel.getRecentActivity(userId),
            dashboardModel.getWeeklySeries(userId),
        ]);

        const recentActivity = activityRows.map(row => ({
            name: `${row.first_name} ${row.last_name || ''}`.trim(),
            action: row.action,
            time: row.time,
            image: row.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback",
            online: isOnline(row.last_login, row.online_status_enabled),
        }));

        const dayLabel = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" });
        const { viewsSeries, matchesSeries, messagesSeries, likesSeries } = weekly;
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
                likes: likesCount,
            },
            recentActivity,
            weeklyActivity,
            weeklyTotals: {
                views: sum(weeklyActivity.views),
                matches: sum(weeklyActivity.matches),
                messagesSent: sum(weeklyActivity.messagesSent),
                likesReceived: sum(weeklyActivity.likesReceived),
            },
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Server Error" });
    }
}

module.exports = { getDashboard };
