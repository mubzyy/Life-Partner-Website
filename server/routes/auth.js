const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { sendOtpEmail } = require("../emailService");

const router = express.Router();

// ─── In-memory OTP store ──────────────────────────────────────────────────────
// Structure: { email: { otp, expiresAt, data } }
const otpStore = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes


// ─── POST /api/auth/send-verification ─────────────────────────────────────────
// Step 1 of signup: validate data, check email uniqueness, send OTP
router.post("/send-verification", async (req, res) => {
  try {
    const {
      first_name, middle_name, last_name,
      email, country_id, phone_code, phone_number, password,
    } = req.body;

    if (!first_name || !last_name || !email || !password || !country_id || !phone_number) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // Check if email already registered
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store OTP + user data temporarily
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
      data: { first_name, middle_name, last_name, email, country_id, phone_code, phone_number, hashedPassword },
    };

    await sendOtpEmail(email, otp, "verification");

    res.status(200).json({ message: "Verification code sent to your email." });
  } catch (err) {
    console.error("send-verification error:", err);
    res.status(500).json({ message: "Failed to send verification email. Please try again." });
  }
});


// ─── POST /api/auth/verify-and-signup ─────────────────────────────────────────
// Step 2 of signup: verify OTP then create account
router.post("/verify-and-signup", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "No verification code found for this email. Please request a new one." });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: "Incorrect verification code. Please try again." });
    }

    // OTP correct — create account
    const { first_name, middle_name, last_name, country_id, phone_code, phone_number, hashedPassword } = record.data;

    await pool.query(
      `INSERT INTO users
        (first_name, middle_name, last_name, email, country_id, phone_code, phone_number, password, email_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)`,
      [first_name, middle_name, last_name, email, country_id, phone_code, phone_number, hashedPassword]
    );

    delete otpStore[email];

    res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error("verify-and-signup error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});


// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
// Step 1 of password reset: check email exists, send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      // Return success anyway to prevent email enumeration attacks
      return res.status(200).json({ message: "If this email is registered, a reset code has been sent." });
    }

    const otp = generateOtp();
    otpStore[`reset_${email}`] = {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
    };

    await sendOtpEmail(email, otp, "reset");

    res.status(200).json({ message: "Password reset code sent to your email." });
  } catch (err) {
    console.error("forgot-password error:", err);
    res.status(500).json({ message: "Failed to send reset email. Please try again." });
  }
});


// ─── POST /api/auth/reset-password ────────────────────────────────────────────
// Step 2 of password reset: verify OTP then update password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const record = otpStore[`reset_${email}`];

    if (!record) {
      return res.status(400).json({ message: "No reset code found. Please request a new one." });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[`reset_${email}`];
      return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: "Incorrect reset code. Please try again." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2",
      [hashedPassword, email]
    );

    delete otpStore[`reset_${email}`];

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("reset-password error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});


// ─── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await pool.query(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      country_id: user.country_id,
      phone_code: user.phone_code,
      phone_number: user.phone_number,
      email_verified: user.email_verified,
      is_active: user.is_active,
    });

  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;