const pool = require("../db");

async function findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
}

// Matched on (phone_code, phone_number) together — the local digits alone
// aren't a real identifier since two different countries can share the
// same ones.
async function findByPhone(phoneCode, phoneNumber) {
    const result = await pool.query(
        "SELECT id FROM users WHERE phone_code = $1 AND phone_number = $2",
        [phoneCode, phoneNumber]
    );
    return result.rows[0] || null;
}

async function createUser({ first_name, middle_name, last_name, email, country_id, phone_code, phone_number, hashedPassword }) {
    await pool.query(
        `INSERT INTO users
        (first_name, middle_name, last_name, email, country_id, phone_code, phone_number, password, email_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)`,
        [first_name, middle_name, last_name, email, country_id, phone_code, phone_number, hashedPassword]
    );
}

async function updatePasswordByEmail(email, hashedPassword) {
    // Bumping password_changed_at invalidates any tokens issued before this
    // reset (see middleware/auth.js) — a real device that had this account
    // open stops being able to use it as soon as the password changes.
    await pool.query(
        "UPDATE users SET password = $1, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE email = $2",
        [hashedPassword, email]
    );
}

async function updateLastLogin(userId) {
    await pool.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [userId]);
}

async function findByGoogleId(googleId) {
    const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
    return result.rows[0] || null;
}

async function linkGoogleId(userId, googleId) {
    const result = await pool.query(
        "UPDATE users SET google_id = $1 WHERE id = $2 RETURNING *",
        [googleId, userId]
    );
    return result.rows[0];
}

async function createGoogleUser({ firstName, lastName, email, hashedPassword, googleId }) {
    const result = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password, email_verified, google_id)
       VALUES ($1, $2, $3, $4, true, $5) RETURNING *`,
        [firstName, lastName, email, hashedPassword, googleId]
    );
    return result.rows[0];
}

async function getPasswordById(userId) {
    const result = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
    return result.rows[0]?.password || null;
}

// Used by middleware/auth.js on every authenticated request to enforce:
//  - account deactivation (is_active)
//  - password-change session invalidation (password_changed_at)
// Returns null if the user no longer exists.
async function getAuthStatus(userId) {
    const result = await pool.query(
        "SELECT is_active, password_changed_at FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0] || null;
}

async function updatePasswordById(userId, hashedPassword) {
    // password_changed_at invalidates every token issued before now (see
    // middleware/auth.js) — including the one used for this very request, so
    // the frontend must treat this as a forced re-login, not just a toast.
    const result = await pool.query(
        `UPDATE users SET password = $1, password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING password_changed_at`,
        [hashedPassword, userId]
    );
    return result.rows[0];
}

module.exports = {
    findByEmail, findByPhone, createUser, updatePasswordByEmail, updateLastLogin,
    findByGoogleId, linkGoogleId, createGoogleUser, getPasswordById, updatePasswordById,
    getAuthStatus,
};
