const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Every route below is authenticated and scoped to req.user.id — there is no
// way to read, mark-read, or delete another user's notifications by passing
// a different id, because no id is ever taken from the client for ownership.

// GET /api/notifications — the authenticated user's own notifications.
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// PATCH /api/notifications/:id/read — mark one of MY notifications as read.
router.patch("/:id/read", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id",
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Notification not found." });
        }
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// PATCH /api/notifications/read-all — mark all of MY notifications as read.
router.patch("/read-all", authMiddleware, async (req, res) => {
    try {
        await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [req.user.id]);
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// DELETE /api/notifications/:id — delete one of MY notifications.
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id",
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Notification not found." });
        }
        res.json({ message: "Notification deleted" });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// DELETE /api/notifications — clear all of MY notifications.
router.delete("/", authMiddleware, async (req, res) => {
    try {
        await pool.query("DELETE FROM notifications WHERE user_id = $1", [req.user.id]);
        res.json({ message: "All notifications deleted" });
    } catch (err) {
        console.error("Error deleting all notifications:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
