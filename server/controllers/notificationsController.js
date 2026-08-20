const notificationModel = require("../models/notificationModel");

// GET /api/notifications
async function getNotifications(req, res) {
    try {
        const notifications = await notificationModel.getByUser(req.user.id);
        res.json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server Error" });
    }
}

// PATCH /api/notifications/:id/read
async function markNotificationRead(req, res) {
    try {
        const notification = await notificationModel.markAsRead(req.params.id, req.user.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({ message: "Server Error" });
    }
}

// PATCH /api/notifications/read-all
async function markAllNotificationsRead(req, res) {
    try {
        await notificationModel.markAllAsRead(req.user.id);
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        res.status(500).json({ message: "Server Error" });
    }
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res) {
    try {
        const notification = await notificationModel.deleteOne(req.params.id, req.user.id);
        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }
        res.json({ message: "Notification deleted" });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({ message: "Server Error" });
    }
}

// DELETE /api/notifications
async function deleteAllNotifications(req, res) {
    try {
        await notificationModel.deleteAll(req.user.id);
        res.json({ message: "All notifications deleted" });
    } catch (err) {
        console.error("Error deleting all notifications:", err);
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications,
};
