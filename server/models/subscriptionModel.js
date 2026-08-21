const pool = require("../db");

async function getActivePlans() {
    const result = await pool.query(
        `SELECT id, name, price_cents, currency, duration_months
         FROM subscription_plans WHERE is_active = true
         ORDER BY duration_months ASC, price_cents ASC`
    );
    return result.rows;
}

async function getPlanById(planId) {
    const result = await pool.query("SELECT name FROM subscription_plans WHERE id = $1", [planId]);
    return result.rows[0] || null;
}

async function getActivePlanForCheckout(planId) {
    const result = await pool.query(
        "SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true",
        [planId]
    );
    return result.rows[0] || null;
}

// Transitions any of this user's subscriptions whose ends_at has passed from
// 'active' to 'expired' and fires a real, persisted notification for each —
// lazily, on read, since there's no cron/job runner in this project. This is
// purely a bookkeeping/notification step: isUserPremium() below already
// requires ends_at > CURRENT_TIMESTAMP, so premium access is never granted
// past expiry even in the moment before this runs.
async function expireStaleSubscriptions(userId) {
    const expired = await pool.query(
        `UPDATE subscriptions s SET status = 'expired'
         WHERE s.user_id = $1 AND s.status = 'active' AND s.ends_at <= CURRENT_TIMESTAMP
         RETURNING s.id, s.plan_id`,
        [userId]
    );
    for (const sub of expired.rows) {
        try {
            const plan = await getPlanById(sub.plan_id);
            const planName = plan?.name || "Your plan";
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, action_url)
                 VALUES ($1, 'Subscription Expired', $2, 'system', '/packages')`,
                [userId, `${planName} has expired. Renew anytime to keep your premium features.`]
            );
        } catch (e) {
            console.error("Error creating expiration notification", e);
        }
    }
}

async function getCurrentSubscription(userId) {
    const result = await pool.query(
        `SELECT s.id, s.plan_id, s.status, s.starts_at, s.ends_at, p.name AS plan_name
         FROM subscriptions s
         JOIN subscription_plans p ON p.id = s.plan_id
         WHERE s.user_id = $1 AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
         ORDER BY s.ends_at DESC LIMIT 1`,
        [userId]
    );
    return result.rows[0] || null;
}

async function cancelActiveSubscription(userId) {
    const result = await pool.query(
        `UPDATE subscriptions SET status = 'canceled'
         WHERE user_id = $1 AND status = 'active' AND ends_at > CURRENT_TIMESTAMP
         RETURNING id, plan_id`,
        [userId]
    );
    return result.rows[0] || null;
}

async function notifyCancellation(userId, planName) {
    await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, action_url)
         VALUES ($1, 'Subscription Canceled', $2, 'system', '/packages')`,
        [userId, `${planName} has been canceled. You can resubscribe anytime.`]
    );
}

async function findTransactionByIdempotencyKey(idempotencyKey, userId) {
    const result = await pool.query(
        "SELECT * FROM transactions WHERE idempotency_key = $1 AND user_id = $2",
        [idempotencyKey, userId]
    );
    return result.rows[0] || null;
}

async function getSubscriptionById(subscriptionId) {
    const result = await pool.query("SELECT * FROM subscriptions WHERE id = $1", [subscriptionId]);
    return result.rows[0] || null;
}

async function getLatestTransactionForActiveSubscription(userId) {
    const result = await pool.query(
        `SELECT t.* FROM transactions t
         JOIN subscriptions s ON s.id = t.subscription_id
         WHERE s.user_id = $1 AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
         ORDER BY t.created_at DESC LIMIT 1`,
        [userId]
    );
    return result.rows[0] || null;
}

// Checkout write: cancels any existing active subscription, creates the new
// subscription + transaction + activation notification, all inside one
// transaction (committed together or not at all).
async function createSubscriptionAndTransaction({ userId, plan, providerName, charge, idempotencyKey }) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Prevent duplicate active subscriptions: a new purchase always
        // supersedes any existing active row for this user (whether still
        // time-valid or merely not yet lazily flagged expired) rather than
        // stacking a second concurrently-'active' row — required so the
        // partial unique index below (idx_subscriptions_one_active_per_user)
        // is never violated by the INSERT that follows.
        await client.query(
            `UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1 AND status = 'active'`,
            [userId]
        );

        const startsAt = new Date();
        const endsAt = new Date(startsAt);
        endsAt.setMonth(endsAt.getMonth() + plan.duration_months);

        const subResult = await client.query(
            `INSERT INTO subscriptions (user_id, plan_id, provider_subscription_id, status, starts_at, ends_at)
             VALUES ($1, $2, $3, 'active', $4, $5) RETURNING *`,
            [userId, plan.id, charge.providerTransactionId, startsAt, endsAt]
        );
        const subscription = subResult.rows[0];

        const txnResult = await client.query(
            `INSERT INTO transactions (user_id, subscription_id, amount_cents, currency, provider, provider_customer_id, provider_transaction_id, idempotency_key, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed') RETURNING *`,
            [userId, subscription.id, plan.price_cents, plan.currency, providerName, charge.providerCustomerId, charge.providerTransactionId, idempotencyKey || null]
        );

        await client.query(
            `INSERT INTO notifications (user_id, title, message, type, action_url)
             VALUES ($1, 'Subscription Activated', $2, 'system', '/settings')`,
            [userId, `Your ${plan.name} plan is now active. (Test mode — no real payment was processed.)`]
        );

        await client.query("COMMIT");
        return { subscription, transaction: txnResult.rows[0] };
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

// Shared "is this user premium right now" check — the same real-time
// definition GET /api/subscriptions/me uses (an active subscription row
// whose ends_at hasn't passed), reused wherever premium status needs to be
// known so there's exactly one definition of "premium" in the app.
async function isUserPremium(userId) {
    const result = await pool.query(
        `SELECT 1 FROM subscriptions
         WHERE user_id = $1 AND status = 'active' AND ends_at > CURRENT_TIMESTAMP
         LIMIT 1`,
        [userId]
    );
    return result.rows.length > 0;
}

// Batch version for list endpoints — one query instead of N, returns the
// subset of userIds that currently have an active subscription.
async function getPremiumUserIdSet(userIds) {
    if (!userIds || userIds.length === 0) return new Set();
    const result = await pool.query(
        `SELECT DISTINCT user_id FROM subscriptions
         WHERE user_id = ANY($1::int[]) AND status = 'active' AND ends_at > CURRENT_TIMESTAMP`,
        [userIds]
    );
    return new Set(result.rows.map(r => r.user_id));
}

// ── Admin: plan management (CRM Subscriptions page) ────────────────────────

async function getAllPlansAdmin() {
    // Real subscriber count + real revenue per plan, not just the bare row —
    // this is what the CRM's plan cards actually show.
    const result = await pool.query(`
        SELECT
            p.id, p.name, p.price_cents, p.currency, p.duration_months, p.is_active, p.features,
            (SELECT COUNT(*) FROM subscriptions s WHERE s.plan_id = p.id AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP) AS subscriber_count,
            (SELECT COALESCE(SUM(t.amount_cents), 0) FROM transactions t JOIN subscriptions s ON s.id = t.subscription_id WHERE s.plan_id = p.id AND t.status = 'completed') AS revenue_cents
        FROM subscription_plans p
        ORDER BY p.duration_months ASC, p.price_cents ASC
    `);
    return result.rows;
}

function slugify(name) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function createPlan({ name, price_cents, currency, duration_months, features }) {
    const baseId = `${slugify(name)}-${duration_months}m`;
    // Guarantees a unique id even if an admin creates two plans with the
    // same name/duration (appends -2, -3, ... rather than erroring or
    // silently colliding).
    let id = baseId;
    let suffix = 1;
    while ((await pool.query("SELECT 1 FROM subscription_plans WHERE id = $1", [id])).rows.length > 0) {
        suffix += 1;
        id = `${baseId}-${suffix}`;
    }

    const result = await pool.query(
        `INSERT INTO subscription_plans (id, name, price_cents, currency, duration_months, is_active, features)
         VALUES ($1, $2, $3, $4, $5, true, $6) RETURNING *`,
        [id, name, price_cents, currency || "PKR", duration_months, features && features.length ? features : null]
    );
    return result.rows[0];
}

async function updatePlan(planId, { name, price_cents, currency, duration_months, features, is_active }) {
    const setClauses = [];
    const values = [];
    let i = 1;
    const fields = { name, price_cents, currency, duration_months, features, is_active };
    for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
            setClauses.push(`${key} = $${i++}`);
            values.push(value);
        }
    }
    if (setClauses.length === 0) return getAllPlansAdmin().then(rows => rows.find(r => r.id === planId));
    values.push(planId);
    const result = await pool.query(
        `UPDATE subscription_plans SET ${setClauses.join(", ")} WHERE id = $${i} RETURNING *`,
        values
    );
    return result.rows[0] || null;
}

// ── Admin: per-user subscription list (CRM Subscriptions page table) ──────

async function listSubscriptions({ status, page, limit }) {
    const conditions = [];
    const params = [];
    let i = 1;
    if (status && status !== "All") {
        if (status === "Active") conditions.push(`s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP`);
        else if (status === "Expired") conditions.push(`(s.status = 'expired' OR (s.status = 'active' AND s.ends_at <= CURRENT_TIMESTAMP))`);
        else { conditions.push(`s.status = $${i++}`); params.push(status.toLowerCase()); }
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const baseQuery = `
        FROM subscriptions s
        JOIN users u ON u.id = s.user_id
        JOIN subscription_plans p ON p.id = s.plan_id
        ${whereClause}
    `;
    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const result = await pool.query(
        `SELECT s.id, s.status, s.starts_at, s.ends_at,
                u.id AS user_id, u.first_name, u.last_name,
                p.name AS plan_name, p.price_cents
         ${baseQuery}
         ORDER BY s.starts_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        dataParams
    );
    return { rows: result.rows, total };
}

// Admin manually grants/changes a user's plan — no payment provider call, no
// transactions row (this isn't revenue, it's a comped/manual assignment,
// and Reports must never count it as real money collected). Cancels any
// existing active subscription first, same as a real checkout would.
async function adminAssignPlan(userId, planId, assignedByAdminId) {
    const plan = await getPlanById2(planId);
    if (!plan) return null;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            `UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1 AND status = 'active'`,
            [userId]
        );
        const startsAt = new Date();
        const endsAt = new Date(startsAt);
        endsAt.setMonth(endsAt.getMonth() + plan.duration_months);
        const result = await client.query(
            `INSERT INTO subscriptions (user_id, plan_id, status, starts_at, ends_at)
             VALUES ($1, $2, 'active', $3, $4) RETURNING *`,
            [userId, planId, startsAt, endsAt]
        );
        await client.query(
            `INSERT INTO notifications (user_id, title, message, type, action_url)
             VALUES ($1, 'Plan Updated', $2, 'system', '/settings')`,
            [userId, `An administrator has assigned you the ${plan.name} plan.`]
        );
        await client.query("COMMIT");
        return result.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}

// Full plan row (getPlanById above only selects `name`) — kept separate so
// existing callers of getPlanById aren't affected.
async function getPlanById2(planId) {
    const result = await pool.query("SELECT * FROM subscription_plans WHERE id = $1", [planId]);
    return result.rows[0] || null;
}

// Removes a user's active plan entirely (back to Free) — used when an admin
// sets a user's plan to "Free" in the Users page editor.
async function removeActivePlan(userId) {
    await pool.query(
        `UPDATE subscriptions SET status = 'canceled' WHERE user_id = $1 AND status = 'active'`,
        [userId]
    );
}

module.exports = {
    getActivePlans, getPlanById, getActivePlanForCheckout, expireStaleSubscriptions,
    getCurrentSubscription, cancelActiveSubscription, notifyCancellation,
    findTransactionByIdempotencyKey, getSubscriptionById, getLatestTransactionForActiveSubscription,
    createSubscriptionAndTransaction, isUserPremium, getPremiumUserIdSet,
    getAllPlansAdmin, createPlan, updatePlan, listSubscriptions, adminAssignPlan, removeActivePlan,
};
