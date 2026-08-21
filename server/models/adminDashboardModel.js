const pool = require("../db");

// Real period-over-period growth: (new in period) / (total before period) *
// 100. If there was nothing before the period, growth is reported as 100%
// when something new arrived, 0% otherwise — never a fabricated number.
function growthPercent(newCount, priorCount) {
    if (priorCount > 0) return Math.round((newCount / priorCount) * 1000) / 10;
    return newCount > 0 ? 100 : 0;
}

async function getTotalUsersStat() {
    const result = await pool.query(`
        SELECT
            COUNT(*) AS current_count,
            COUNT(*) FILTER (WHERE created_at < CURRENT_DATE - INTERVAL '30 days') AS prior_count
        FROM users
    `);
    const { current_count, prior_count } = result.rows[0];
    const current = parseInt(current_count, 10);
    const prior = parseInt(prior_count, 10);
    return { value: current, change: growthPercent(current - prior, prior) };
}

// Verified-30-days-ago is approximated by join date (the users table has no
// email_verified_at timestamp) — a real, stated approximation, not a made-up
// number.
async function getVerifiedUsersStat() {
    const result = await pool.query(`
        SELECT
            COUNT(*) FILTER (WHERE email_verified = true) AS current_count,
            COUNT(*) FILTER (WHERE email_verified = true AND created_at < CURRENT_DATE - INTERVAL '30 days') AS prior_count
        FROM users
    `);
    const { current_count, prior_count } = result.rows[0];
    const current = parseInt(current_count, 10);
    const prior = parseInt(prior_count, 10);
    return { value: current, change: growthPercent(current - prior, prior) };
}

// Premium counts a real point-in-time snapshot using subscriptions' actual
// starts_at/ends_at columns — "premium 30 days ago" means a subscription
// that was genuinely active at that moment in the past, not an estimate.
async function getPremiumUsersStat() {
    const result = await pool.query(`
        SELECT
            (SELECT COUNT(DISTINCT user_id) FROM subscriptions WHERE status = 'active' AND ends_at > CURRENT_TIMESTAMP) AS current_count,
            (SELECT COUNT(DISTINCT user_id) FROM subscriptions WHERE starts_at < CURRENT_DATE - INTERVAL '30 days' AND ends_at > CURRENT_DATE - INTERVAL '30 days') AS prior_count
    `);
    const { current_count, prior_count } = result.rows[0];
    const current = parseInt(current_count, 10);
    const prior = parseInt(prior_count, 10);
    return { value: current, change: growthPercent(current - prior, prior) };
}

async function getActiveTodayStat() {
    const result = await pool.query(`
        SELECT
            COUNT(*) FILTER (WHERE last_login >= CURRENT_DATE) AS today_count,
            COUNT(*) FILTER (WHERE last_login >= CURRENT_DATE - INTERVAL '1 day' AND last_login < CURRENT_DATE) AS yesterday_count
        FROM users
    `);
    const { today_count, yesterday_count } = result.rows[0];
    const today = parseInt(today_count, 10);
    const yesterday = parseInt(yesterday_count, 10);
    return { value: today, change: growthPercent(today - yesterday, yesterday) };
}

// Registration counts for the last 30 days (daily) and last 12 months
// (monthly) — real generate_series counts, zero days/months included.
async function getRegistrationsLast30Days() {
    const result = await pool.query(`
        SELECT gs::date AS day, COUNT(u.id) AS count
        FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS gs
        LEFT JOIN users u ON u.created_at::date = gs::date
        GROUP BY gs::date ORDER BY gs::date
    `);
    return result.rows;
}

async function getRegistrationsLast12Months() {
    const result = await pool.query(`
        SELECT to_char(gs, 'Mon') AS month, COUNT(u.id) AS count
        FROM generate_series(date_trunc('month', CURRENT_DATE) - INTERVAL '11 months', date_trunc('month', CURRENT_DATE), INTERVAL '1 month') AS gs
        LEFT JOIN users u ON u.created_at >= gs AND u.created_at < gs + INTERVAL '1 month'
        GROUP BY gs ORDER BY gs
    `);
    return result.rows;
}

// Real subscriber counts per active plan (for the donut chart).
async function getSubscriptionDistribution() {
    const result = await pool.query(`
        SELECT p.name, COUNT(s.id) AS count
        FROM subscription_plans p
        LEFT JOIN subscriptions s ON s.plan_id = p.id AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
        WHERE p.is_active = true
        GROUP BY p.id, p.name, p.duration_months
        ORDER BY p.duration_months ASC
    `);
    return result.rows;
}

async function getRecentPayments(limit = 5) {
    const result = await pool.query(`
        SELECT t.id, t.amount_cents, t.currency, t.status, t.created_at,
               u.first_name, u.last_name, p.name AS plan_name
        FROM transactions t
        JOIN users u ON u.id = t.user_id
        LEFT JOIN subscription_plans p ON p.id = (SELECT plan_id FROM subscriptions WHERE id = t.subscription_id)
        ORDER BY t.created_at DESC LIMIT $1
    `, [limit]);
    return result.rows;
}

module.exports = {
    getTotalUsersStat, getVerifiedUsersStat, getPremiumUsersStat, getActiveTodayStat,
    getRegistrationsLast30Days, getRegistrationsLast12Months, getSubscriptionDistribution,
    getRecentPayments,
};
