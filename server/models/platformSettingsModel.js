const pool = require("../db");

// Singleton row (id = 1, seeded by the migration) — every real enforcement
// point in the app (login, signup, photo upload, messaging) reads through
// this same function, so there is exactly one source of truth for these
// values, never a second cached/hardcoded copy.
async function getSettings() {
    const result = await pool.query("SELECT * FROM platform_settings WHERE id = 1");
    return result.rows[0];
}

async function updateSettings(updates, updatedBy) {
    const setClauses = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(updates)) {
        setClauses.push(`${key} = $${i++}`);
        values.push(value);
    }
    setClauses.push(`updated_at = CURRENT_TIMESTAMP`, `updated_by = $${i++}`);
    values.push(updatedBy);

    const result = await pool.query(
        `UPDATE platform_settings SET ${setClauses.join(", ")} WHERE id = 1 RETURNING *`,
        values
    );
    return result.rows[0];
}

module.exports = { getSettings, updateSettings };
