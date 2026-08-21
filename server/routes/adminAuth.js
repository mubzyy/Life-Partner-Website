const express = require("express");
const router = express.Router();
const adminSessionAuth = require("../middleware/adminSessionAuth");
const { loginLimiter } = require("../middleware/rateLimit");
const adminAuthController = require("../controllers/adminAuthController");

// Public — this is the admin login itself, so it can't require a token yet.
router.post("/login", loginLimiter, adminAuthController.login);

// Authenticated admin session required.
router.put("/change-password", adminSessionAuth, adminAuthController.changePassword);

module.exports = router;
