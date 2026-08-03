const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/notifications/:userId - Fetch all notifications for a user
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// PATCH /api/notifications/:id/read - Mark a single notification as read
router.patch("/:id/read", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE id = $1",
            [id]
        );
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// PATCH /api/notifications/user/:userId/read-all - Mark all notifications as read for a user
router.patch("/user/:userId/read-all", async (req, res) => {
    try {
        const { userId } = req.params;
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE user_id = $1",
            [userId]
        );
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// DELETE /api/notifications/:id - Delete a single notification
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            "DELETE FROM notifications WHERE id = $1",
            [id]
        );
        res.json({ message: "Notification deleted" });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// DELETE /api/notifications/user/:userId - Delete all notifications for a user
router.delete("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        await pool.query(
            "DELETE FROM notifications WHERE user_id = $1",
            [userId]
        );
        res.json({ message: "All notifications deleted" });
    } catch (err) {
        console.error("Error deleting all notifications:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
