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

// ── Admin broadcast (CRM "Create Notification") ────────────────────────────
// Resolves an audience keyword to real, currently-matching user ids — this
// is a live query, not a stored "segment": someone who upgrades to premium
// five minutes from now was never a lie, they just weren't in this list yet.
async function getAudienceUserIds(audience) {
    if (audience === "premium") {
        const r = await pool.query(
            `SELECT DISTINCT user_id FROM subscriptions WHERE status = 'active' AND ends_at > CURRENT_TIMESTAMP`
        );
        return r.rows.map(row => row.user_id);
    }
    if (audience === "free") {
        const r = await pool.query(`
            SELECT id FROM users u
            WHERE is_active = true AND NOT EXISTS (
                SELECT 1 FROM subscriptions s WHERE s.user_id = u.id AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
            )
        `);
        return r.rows.map(row => row.id);
    }
    if (audience === "inactive") {
        const r = await pool.query(`SELECT id FROM users WHERE is_active = false`);
        return r.rows.map(row => row.id);
    }
    // "all"
    const r = await pool.query(`SELECT id FROM users WHERE is_active = true`);
    return r.rows.map(row => row.id);
}

// One real notifications row per recipient — same table, same shape every
// other feature in this app already writes to and the existing bell/
// Notifications page already reads from.
async function broadcastToUsers(userIds, { title, message }) {
    if (!userIds.length) return 0;
    const values = [];
    const params = [];
    let i = 1;
    for (const userId of userIds) {
        values.push(`($${i++}, $${i++}, $${i++}, 'admin_broadcast', '/notifications')`);
        params.push(userId, title, message);
    }
    await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, action_url) VALUES ${values.join(", ")}`,
        params
    );
    return userIds.length;
}

module.exports = {
    getByUser, markAsRead, markAllAsRead, deleteOne, deleteAll,
    getAudienceUserIds, broadcastToUsers,
};
