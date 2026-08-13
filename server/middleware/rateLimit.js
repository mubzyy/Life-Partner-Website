const rateLimit = require("express-rate-limit");

// Shared response shape (JSON, no stack trace, no internal detail) for every
// limiter below — consistent with how the rest of this API reports errors.
const jsonHandler = (req, res) => {
    res.status(429).json({ message: "Too many requests. Please try again later." });
};

// Login: slows down password-guessing brute force. Generous enough that a
// real user mistyping their password a few times is never affected.
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
});

// OTP verification (signup + password reset): the real fix for brute-forcing
// a 6-digit code. 10 tries per 10-minute OTP window makes guessing the
// 1-in-1,000,000 code computationally infeasible instead of trivial.
const otpVerifyLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
});

// OTP sending (signup + forgot-password): stops email-bombing an address and
// slows down the email-enumeration signal on send-verification.
const otpSendLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
});

// Messaging: real users sending real messages one at a time never come close
// to this; scripted flooding does.
const messageSendLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
});

module.exports = { loginLimiter, otpVerifyLimiter, otpSendLimiter, messageSendLimiter };
