const pool = require("../db");

// Every function below is scoped to the given userId — there is no way to
// read, mark-read, or delete another user's notifications by passing a
// different id, because no id is ever taken from anywhere but the caller.

async function getByUser(userId) {
    const result = await pool.query(
        "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
    );
    return result.rows;
}

async function markAsRead(id, userId) {
    const result = await pool.query(
        "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id",
        [id, userId]
    );
    return result.rows[0] || null;
}

async function markAllAsRead(userId) {
    await pool.query("UPDATE notifications SET is_read = true WHERE user_id = $1", [userId]);
}

async function deleteOne(id, userId) {
    const result = await pool.query(
        "DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id",
        [id, userId]
    );
    return result.rows[0] || null;
}

async function deleteAll(userId) {
    await pool.query("DELETE FROM notifications WHERE user_id = $1", [userId]);
}

module.exports = { getByUser, markAsRead, markAllAsRead, deleteOne, deleteAll };
