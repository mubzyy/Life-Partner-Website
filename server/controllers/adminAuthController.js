const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminAccountModel = require("../models/adminAccountModel");

const signAdminToken = (admin) => jwt.sign(
    { id: admin.id, username: admin.username, pwdChangedAt: admin.password_changed_at.getTime() },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "7d" }
);

// POST /api/admin-auth/login — username + password, NOT email. Completely
// separate from the customer /api/auth/login: different table, different
// JWT secret, different session. There is no self-service way to become an
// admin — accounts are created directly in the database.
async function login(req, res) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        const admin = await adminAccountModel.findByUsername(username);
        if (!admin) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        await adminAccountModel.updateLastLogin(admin.id);

        res.status(200).json({
            token: signAdminToken(admin),
            id: admin.id,
            username: admin.username,
        });
    } catch (err) {
        console.error("admin login error:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// PUT /api/admin-auth/change-password — authenticated (adminSessionAuth).
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

        const admin = await adminAccountModel.findByUsername(req.admin.username);
        if (!admin) return res.status(404).json({ message: "Admin account not found." });

        const currentMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!currentMatch) {
            return res.status(401).json({ message: "Current password is incorrect." });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await adminAccountModel.updatePassword(req.admin.id, hashedPassword);

        res.json({
            message: "Password changed successfully. Please log in again.",
            passwordChangedAt: updated.password_changed_at,
        });
    } catch (err) {
        console.error("admin change-password error:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { login, changePassword };
