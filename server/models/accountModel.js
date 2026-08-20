const pool = require("../db");

// Soft-deactivates a user (users.is_active = false). Nothing is deleted —
// every row this user owns is untouched, so the account can be restored by
// an admin flipping is_active back on.
async function deactivate(userId) {
    const result = await pool.query(
        "UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, is_active",
        [userId]
    );
    return result.rows[0] || null;
}

module.exports = { deactivate };
