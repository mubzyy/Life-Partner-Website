const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

/**
 * Auth middleware — reads JWT from the Authorization: Bearer <token> header.
 * The frontend stores the JWT in localStorage and must send it as a header.
 *
 * Also enforces:
 *  - account deactivation: a syntactically valid, unexpired JWT for a
 *    deactivated account (users.is_active = false) is rejected. Without this,
 *    deactivation would only block *new* logins — anyone still holding an
 *    older token could keep using every authenticated endpoint.
 *  - password-change session invalidation: the JWT embeds the
 *    password_changed_at value from the moment it was issued. If the
 *    account's password has been changed since (a different value now sits
 *    in the database), the token is stale and rejected — this is what makes
 *    "change password" actually sign out other sessions, without needing a
 *    separate token-blacklist table.
 */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token =
        authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : null;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        const authStatus = await userModel.getAuthStatus(decoded.id);
        if (!authStatus || !authStatus.is_active) {
            return res.status(401).json({ message: "This account is deactivated." });
        }
        const currentPwdChangedAt = authStatus.password_changed_at?.getTime();
        if (decoded.pwdChangedAt !== undefined && currentPwdChangedAt !== decoded.pwdChangedAt) {
            return res.status(401).json({ message: "Your session has expired. Please log in again." });
        }
    } catch (err) {
        console.error("Auth middleware active-check error:", err);
        return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
};

module.exports = authMiddleware;
