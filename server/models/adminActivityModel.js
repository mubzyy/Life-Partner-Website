const pool = require("../db");

// Real recent-activity feed for the CRM header bell — derived live from
// actual events (signups, payments, verification submissions, reports)
// rather than a separate stored "admin notifications" log. There's nothing
// to go stale or drift out of sync with reality: it's the same events the
// rest of the CRM already shows, just interleaved by recency.
async function getRecentActivity(limit = 10) {
    const query = `
        (
            SELECT 'user' AS type, u.id AS ref_id, u.first_name, u.last_name, NULL::text AS extra, u.created_at AS time
            FROM users u
        )
        UNION ALL
        (
            SELECT 'payment' AS type, t.id AS ref_id, u.first_name, u.last_name, t.amount_cents::text AS extra, t.created_at AS time
            FROM transactions t JOIN users u ON u.id = t.user_id WHERE t.status = 'completed'
        )
        UNION ALL
        (
            SELECT 'verif' AS type, vr.id AS ref_id, u.first_name, u.last_name, vr.type AS extra, vr.submitted_at AS time
            FROM verification_requests vr JOIN users u ON u.id = vr.user_id WHERE vr.status = 'pending'
        )
        UNION ALL
        (
            SELECT 'report' AS type, rp.id AS ref_id, u.first_name, u.last_name, rp.reason AS extra, rp.created_at AS time
            FROM reports rp JOIN users u ON u.id = rp.reporter_id
        )
        ORDER BY time DESC LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
}

module.exports = { getRecentActivity };
