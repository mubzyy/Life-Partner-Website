const pool = require("../db");

// The `admins` table — completely separate identity system from `users`.
// Admins have no email, no profile, no ties to any customer-facing table.

async function findByUsername(username) {
    const result = await pool.query("SELECT * FROM admins WHERE username = $1", [username]);
    return result.rows[0] || null;
}

async function findById(id) {
    const result = await pool.query("SELECT id, username, password_changed_at FROM admins WHERE id = $1", [id]);
    return result.rows[0] || null;
}

async function updateLastLogin(adminId) {
    await pool.query("UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [adminId]);
}

async function updatePassword(adminId, hashedPassword) {
    // Bumping password_changed_at invalidates any admin session token issued
    // before this change — same session-invalidation pattern as the regular
    // customer auth (middleware/auth.js).
    const result = await pool.query(
        `UPDATE admins SET password = $1, password_changed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING password_changed_at`,
        [hashedPassword, adminId]
    );
    return result.rows[0];
}

module.exports = { findByUsername, findById, updateLastLogin, updatePassword };
