const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { messageSendLimiter } = require("../middleware/rateLimit");
const messagesController = require("../controllers/messagesController");

router.get("/conversations", authMiddleware, messagesController.getConversations);
router.patch("/conversations/:conversationId", authMiddleware, messagesController.updateConversation);
router.delete("/conversations/:conversationId", authMiddleware, messagesController.deleteConversation);
router.get("/:otherUserId", authMiddleware, messagesController.getMessagesWithUser);
router.post("/:otherUserId", authMiddleware, messageSendLimiter, messagesController.sendMessage);

module.exports = router;
