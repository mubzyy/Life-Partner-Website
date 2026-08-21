const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { loginLimiter, otpVerifyLimiter, otpSendLimiter } = require("../middleware/rateLimit");
const authController = require("../controllers/authController");

router.post("/send-verification", otpSendLimiter, authController.sendVerification);
router.post("/verify-and-signup", otpVerifyLimiter, authController.verifyAndSignup);
router.post("/forgot-password", otpSendLimiter, authController.forgotPassword);
router.post("/reset-password", otpVerifyLimiter, authController.resetPassword);
router.post("/login", loginLimiter, authController.login);
router.post("/google", loginLimiter, authController.googleSignIn);
router.put("/change-password", authMiddleware, authController.changePassword);

module.exports = router;
