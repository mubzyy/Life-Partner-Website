const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const notificationsController = require("../controllers/notificationsController");

router.get("/", authMiddleware, notificationsController.getNotifications);
router.patch("/read-all", authMiddleware, notificationsController.markAllNotificationsRead);
router.patch("/:id/read", authMiddleware, notificationsController.markNotificationRead);
router.delete("/:id", authMiddleware, notificationsController.deleteNotification);
router.delete("/", authMiddleware, notificationsController.deleteAllNotifications);

module.exports = router;
