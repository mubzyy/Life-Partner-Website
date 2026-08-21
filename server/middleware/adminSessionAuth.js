const jwt = require("jsonwebtoken");
const adminAccountModel = require("../models/adminAccountModel");

/**
 * Admin session middleware — completely separate from middleware/auth.js.
 * Verifies an admin JWT (signed with ADMIN_JWT_SECRET, never JWT_SECRET) and
 * re-checks the admins table fresh on every request, same
 * session-invalidation pattern as the customer auth: changing the admin
 * password invalidates every token issued before that change.
 *
 * This is THE real security boundary for the whole CRM — every /api/admin/*
 * route sits behind this. A customer JWT can never pass here: it's signed
 * with a different secret, so verification fails outright regardless of any
 * application-level bug elsewhere.
 */
const adminSessionAuth = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        const admin = await adminAccountModel.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: "Admin account not found." });
        }
        const currentPwdChangedAt = admin.password_changed_at?.getTime();
        if (decoded.pwdChangedAt !== undefined && currentPwdChangedAt !== decoded.pwdChangedAt) {
            return res.status(401).json({ message: "Your session has expired. Please log in again." });
        }
        req.admin = { id: admin.id, username: admin.username };
    } catch (err) {
        console.error("Admin session middleware error:", err);
        return res.status(401).json({ message: "Unauthorized" });
    }

    next();
};

module.exports = adminSessionAuth;
