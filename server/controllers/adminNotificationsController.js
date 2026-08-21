const notificationModel = require("../models/notificationModel");
const adminActivityModel = require("../models/adminActivityModel");

const AUDIENCES = ["all", "premium", "free", "inactive"];

// POST /api/admin/notifications/broadcast — sends a real notifications row
// to every currently-matching real user. Live query at send time, not a
// stored "segment" that could silently drift from reality.
async function broadcast(req, res) {
    try {
        const { title, message, audience } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ message: "Title is required." });
        if (!message || !message.trim()) return res.status(400).json({ message: "Message is required." });
        if (!AUDIENCES.includes(audience)) return res.status(400).json({ message: `audience must be one of: ${AUDIENCES.join(", ")}.` });

        const userIds = await notificationModel.getAudienceUserIds(audience);
        const sentCount = await notificationModel.broadcastToUsers(userIds, { title: title.trim(), message: message.trim() });

        res.status(201).json({ message: `Notification sent to ${sentCount} user${sentCount !== 1 ? "s" : ""}.`, sentCount });
    } catch (err) {
        console.error("Error broadcasting notification:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/admin/activity — the CRM header bell's real recent-activity feed.
async function getActivity(req, res) {
    try {
        const activity = await adminActivityModel.getRecentActivity(15);
        const shaped = activity.map(a => ({
            type: a.type,
            label: `${a.first_name} ${a.last_name || ""}`.trim(),
            extra: a.extra,
            time: a.time,
        }));
        res.json(shaped);
    } catch (err) {
        console.error("Error fetching admin activity:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { broadcast, getActivity };
