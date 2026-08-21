const pool = require("../db");

const SELECT_COLUMNS = "user_id, email_notifications, push_notifications, profile_visibility, last_seen_visibility, online_status, read_receipts, updated_at";

async function getByUser(userId) {
    const result = await pool.query(`SELECT ${SELECT_COLUMNS} FROM user_settings WHERE user_id = $1`, [userId]);
    return result.rows[0] || null;
}

// Ensures a row exists, then applies only the whitelisted `updates` the
// controller has already validated. Returns the updated row.
async function upsertSettings(userId, updates) {
    await pool.query(
        `INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [userId]
    );

    const setClauses = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(updates)) {
        setClauses.push(`${key} = $${i}`);
        values.push(value);
        i += 1;
    }
    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    values.push(userId);

    const result = await pool.query(
        `UPDATE user_settings SET ${setClauses.join(", ")} WHERE user_id = $${i} RETURNING ${SELECT_COLUMNS}`,
        values
    );
    return result.rows[0];
}

module.exports = { getByUser, upsertSettings };
