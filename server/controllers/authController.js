const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const userModel = require("../models/userModel");
const { sendOtpEmail } = require("../emailService");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Builds the same login-response shape POST /login returns, so the frontend
// can handle a Google sign-in exactly like a password sign-in.
const signToken = (user) => jwt.sign(
    { id: user.id, email: user.email, pwdChangedAt: user.password_changed_at.getTime() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);
const userResponse = (user, token) => ({
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

// ─── In-memory OTP store ──────────────────────────────────────────────────────
// Structure: { email: { otp, expiresAt, data } }
const otpStore = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── POST /api/auth/send-verification ─────────────────────────────────────────
// Step 1 of signup: validate data, check email/phone uniqueness, send OTP
async function sendVerification(req, res) {
    try {
        const {
            first_name, middle_name, last_name,
            email, country_id, phone_code, phone_number, password,
        } = req.body;

        if (!first_name || !last_name || !email || !password || !country_id || !phone_number) {
            return res.status(400).json({ message: "All required fields must be filled." });
        }

        if (await userModel.findByEmail(email)) {
            return res.status(400).json({ message: "An account with this email already exists." });
        }

        if (await userModel.findByPhone(phone_code, phone_number)) {
            return res.status(400).json({ message: "An account with this phone number already exists." });
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
        res.status(500).json({ message: "Failed to send verification email.", error: err.message });
    }
}

// ─── POST /api/auth/verify-and-signup ─────────────────────────────────────────
// Step 2 of signup: verify OTP then create account
async function verifyAndSignup(req, res) {
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
        await userModel.createUser(record.data);

        delete otpStore[email];

        res.status(201).json({ message: "Account created successfully." });
    } catch (err) {
        // A concurrent signup (two requests racing between the pre-checks in
        // sendVerification and this insert) can still slip past those checks
        // — the real DB constraints (users_email_key,
        // users_phone_code_phone_number_key) are the actual authority and
        // catch it here instead.
        if (err.code === "23505") {
            delete otpStore[req.body.email];
            if (err.constraint === "users_phone_code_phone_number_key") {
                return res.status(400).json({ message: "An account with this phone number already exists." });
            }
            return res.status(400).json({ message: "An account with this email already exists." });
        }
        console.error("verify-and-signup error:", err);
        res.status(500).json({ message: "Server error. Please try again." });
    }
}

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
// Step 1 of password reset: check email exists, send OTP
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }

        const user = await userModel.findByEmail(email);
        if (!user) {
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
}

// ─── POST /api/auth/reset-password ────────────────────────────────────────────
// Step 2 of password reset: verify OTP then update password
async function resetPassword(req, res) {
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
        await userModel.updatePasswordByEmail(email, hashedPassword);

        delete otpStore[`reset_${email}`];

        res.status(200).json({ message: "Password reset successfully. You can now log in." });
    } catch (err) {
        console.error("reset-password error:", err);
        res.status(500).json({ message: "Server error. Please try again." });
    }
}

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: "This account has been deactivated." });
        }

        await userModel.updateLastLogin(user.id);

        res.status(200).json(userResponse(user, signToken(user)));
    } catch (err) {
        console.error("login error:", err);
        res.status(500).json({ message: "Server Error" });
    }
}

// ─── POST /api/auth/google ─────────────────────────────────────────────────────
// Real "Sign in with Google": verifies the ID token Google's own Identity
// Services button hands back, then either logs into a matching account,
// links Google to an existing password account with the same email, or
// creates a brand new one. No OTP step — Google has already verified the
// email address itself.
async function googleSignIn(req, res) {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: "Google sign-in is not configured on this server." });
        }

        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: "Missing Google credential." });
        }

        let payload;
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (err) {
            return res.status(401).json({ message: "Invalid Google credential." });
        }

        if (!payload.email_verified) {
            return res.status(401).json({ message: "This Google account's email is not verified." });
        }

        // 1) Already linked to this exact Google account.
        let user = await userModel.findByGoogleId(payload.sub);

        if (!user) {
            // 2) An existing password-based account with the same email — link
            //    Google to it instead of creating a duplicate account for the
            //    same person.
            user = await userModel.findByEmail(payload.email);

            if (user) {
                user = await userModel.linkGoogleId(user.id, payload.sub);
            } else {
                // 3) Brand new account. The password column is NOT NULL, but this
                //    account can only ever be signed into via Google (or by using
                //    "Forgot password" to set a real one later) — the random value
                //    here is never shown to anyone and never usable as a typed
                //    password since it's hashed the same as any real one.
                const randomPassword = crypto.randomBytes(32).toString("hex");
                const hashedPassword = await bcrypt.hash(randomPassword, 10);
                user = await userModel.createGoogleUser({
                    firstName: payload.given_name || "Member",
                    lastName: payload.family_name || "",
                    email: payload.email,
                    hashedPassword,
                    googleId: payload.sub,
                });
            }
        }

        if (!user.is_active) {
            return res.status(403).json({ message: "This account has been deactivated." });
        }

        await userModel.updateLastLogin(user.id);

        res.status(200).json(userResponse(user, signToken(user)));
    } catch (err) {
        console.error("google sign-in error:", err);
        res.status(500).json({ message: "Server error. Please try again." });
    }
}

// ─── PUT /api/auth/change-password ────────────────────────────────────────────
// Authenticated. Requires the current password, never trusts the client's
// claim of who they are beyond the verified JWT (req.user.id).
async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters." });
        }
        if (newPassword === currentPassword) {
            return res.status(400).json({ message: "New password must be different from your current password." });
        }

        const currentHashed = await userModel.getPasswordById(req.user.id);
        if (!currentHashed) {
            return res.status(404).json({ message: "User not found." });
        }

        const currentMatch = await bcrypt.compare(currentPassword, currentHashed);
        if (!currentMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await userModel.updatePasswordById(req.user.id, hashedPassword);

        res.json({
            message: "Password changed successfully. Please log in again.",
            passwordChangedAt: updated.password_changed_at,
        });
    } catch (err) {
        console.error("change-password error:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = {
    sendVerification, verifyAndSignup, forgotPassword, resetPassword,
    login, googleSignIn, changePassword,
};
