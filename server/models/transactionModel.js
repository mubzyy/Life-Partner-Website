const pool = require("../db");

// Real transaction history for the CRM Payments page — this table has
// existed since the subscriptions checkout flow was built, but nothing has
// ever read it back as a list before now.
async function listPayments({ status, method, search, page, limit }) {
    const conditions = [];
    const params = [];
    let i = 1;

    if (status && status !== "All") { conditions.push(`t.status = $${i++}`); params.push(status.toLowerCase()); }
    if (method && method !== "All") { conditions.push(`t.provider = $${i++}`); params.push(method); }
    if (search) {
        conditions.push(`(u.first_name || ' ' || COALESCE(u.last_name, '')) ILIKE $${i++}`);
        params.push(`%${search}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const baseQuery = `
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN subscription_plans p ON p.id = (SELECT plan_id FROM subscriptions WHERE id = t.subscription_id)
        ${whereClause}
    `;

    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const result = await pool.query(
        `SELECT
            t.id, t.amount_cents, t.currency, t.provider, t.status, t.created_at,
            u.id AS user_id, u.first_name, u.last_name,
            p.name AS plan_name
         ${baseQuery}
         ORDER BY t.created_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        dataParams
    );
    return { rows: result.rows, total };
}

async function getPaymentSummary() {
    const totals = await pool.query(`
        SELECT
            COALESCE(SUM(amount_cents) FILTER (WHERE status = 'completed'), 0) AS total_revenue_cents,
            COUNT(*) FILTER (WHERE status = 'completed') AS paid_count,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
            COUNT(*) AS all_count
        FROM transactions
    `);
    return totals.rows[0];
}

// Real month-over-month revenue for the last 12 months, and revenue grouped
// by plan — backs the Reports page. No fixture numbers.
async function getMonthlyRevenue() {
    // Revenue and new-user counts are aggregated in separate correlated
    // subqueries per month, not a single joined query — joining transactions
    // and users on the same month directly would cross-multiply the two
    // (every transaction row duplicated once per matching user row) and
    // massively inflate the revenue sum.
    const result = await pool.query(`
        SELECT
            to_char(gs, 'Mon') AS month,
            (
                SELECT COALESCE(SUM(amount_cents), 0) FROM transactions
                WHERE status = 'completed' AND created_at >= gs AND created_at < gs + INTERVAL '1 month'
            ) AS revenue_cents,
            (
                SELECT COUNT(*) FROM users
                WHERE created_at >= gs AND created_at < gs + INTERVAL '1 month'
            ) AS new_users
        FROM generate_series(date_trunc('month', CURRENT_DATE) - INTERVAL '11 months', date_trunc('month', CURRENT_DATE), INTERVAL '1 month') AS gs
        ORDER BY gs
    `);
    return result.rows;
}

async function getRevenueByPlan() {
    const result = await pool.query(`
        SELECT p.name, COALESCE(SUM(t.amount_cents) FILTER (WHERE t.status = 'completed'), 0) AS revenue_cents
        FROM subscription_plans p
        LEFT JOIN subscriptions s ON s.plan_id = p.id
        LEFT JOIN transactions t ON t.subscription_id = s.id
        GROUP BY p.id, p.name
        ORDER BY p.duration_months ASC
    `);
    return result.rows;
}

module.exports = { listPayments, getPaymentSummary, getMonthlyRevenue, getRevenueByPlan };
