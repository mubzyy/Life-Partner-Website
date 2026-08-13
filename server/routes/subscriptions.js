const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { getPaymentProvider } = require("../lib/paymentProvider");

// GET /api/subscriptions/plans — the single source of truth for plan IDs and
// pricing. PricingPage/CheckoutPage fetch this instead of keeping their own
// hardcoded (and previously inconsistent) copies.
router.get("/plans", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, price_cents, currency, duration_months
             FROM subscription_plans WHERE is_active = true
             ORDER BY duration_months ASC, price_cents ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching plans:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Transitions any of this user's subscriptions whose ends_at has passed from
// 'active' to 'expired' and fires a real, persisted notification for each —
// lazily, on read, since there's no cron/job runner in this project. This is
// purely a bookkeeping/notification step: isUserPremium() (server/lib/premium.js)
// already requires ends_at > CURRENT_TIMESTAMP, so premium access is never
// granted past expiry even in the moment before this runs.
async function expireStaleSubscriptions(userId) {
    const expired = await pool.query(
        `UPDATE subscriptions s SET status = 'expired'
         WHERE s.user_id = $1 AND s.status = 'active' AND s.ends_at <= CURRENT_TIMESTAMP
         RETURNING s.id, s.plan_id`,
        [userId]
    );
    for (const sub of expired.rows) {
        try {
            const plan = await pool.query("SELECT name FROM subscription_plans WHERE id = $1", [sub.plan_id]);
            const planName = plan.rows[0]?.name || "Your plan";
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

// GET /api/subscriptions/me — the authenticated user's current subscription.
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        await expireStaleSubscriptions(userId);

        const result = await pool.query(
            `SELECT s.id, s.plan_id, s.status, s.starts_at, s.ends_at, p.name AS plan_name
             FROM subscriptions s
             JOIN subscription_plans p ON p.id = s.plan_id
             WHERE s.user_id = $1 AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
             ORDER BY s.ends_at DESC LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ isPremium: false, status: "free" });
        }
        res.json({ isPremium: true, ...result.rows[0] });
    } catch (err) {
        console.error("Error fetching subscription:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/subscriptions/cancel — cancel MY currently active subscription.
// This mock/test-mode system has no recurring billing to stop, so
// cancellation is immediate: status flips to 'canceled' and premium access
// ends now (isUserPremium only ever counts status = 'active').
router.post("/cancel", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `UPDATE subscriptions SET status = 'canceled'
             WHERE user_id = $1 AND status = 'active' AND ends_at > CURRENT_TIMESTAMP
             RETURNING id, plan_id`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No active subscription to cancel." });
        }

        const plan = await pool.query("SELECT name FROM subscription_plans WHERE id = $1", [result.rows[0].plan_id]);
        const planName = plan.rows[0]?.name || "Your plan";
        try {
            await pool.query(
                `INSERT INTO notifications (user_id, title, message, type, action_url)
                 VALUES ($1, 'Subscription Canceled', $2, 'system', '/packages')`,
                [userId, `${planName} has been canceled. You can resubscribe anytime.`]
            );
        } catch (e) {
            console.error("Error creating cancellation notification", e);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Error canceling subscription:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/subscriptions — checkout.
//
// IMPORTANT: no real payment provider is configured (see lib/paymentProvider.js).
// This runs in explicit test/mock mode — it never claims a real charge
// occurred, but it does perform real, correct database writes: a
// subscriptions row and a transactions row, created together or not at all.
router.post("/", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { plan_id, payment_method, idempotency_key } = req.body;

    if (!plan_id) {
        return res.status(400).json({ message: "plan_id is required." });
    }

    try {
        // Idempotent replay: a retried/double-submitted checkout with the same
        // client-generated key returns the original result instead of
        // charging (and creating a subscription) twice. transactions.idempotency_key
        // already had a UNIQUE constraint reserved for exactly this.
        if (idempotency_key) {
            const existingTxn = await pool.query(
                "SELECT * FROM transactions WHERE idempotency_key = $1 AND user_id = $2",
                [idempotency_key, userId]
            );
            if (existingTxn.rows.length > 0) {
                const txn = existingTxn.rows[0];
                const existingSub = await pool.query("SELECT * FROM subscriptions WHERE id = $1", [txn.subscription_id]);
                return res.json({
                    success: true,
                    testMode: getPaymentProvider().testMode,
                    subscription: existingSub.rows[0],
                    transaction: txn,
                    replayed: true,
                });
            }
        }

        const planResult = await pool.query(
            "SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true",
            [plan_id]
        );
        if (planResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or inactive plan." });
        }
        const plan = planResult.rows[0];

        const provider = getPaymentProvider();
        const charge = await provider.charge({
            amountCents: plan.price_cents,
            currency: plan.currency,
            method: payment_method || "card",
        });

        if (!charge.success) {
            return res.status(402).json({ message: "Payment failed.", testMode: provider.testMode });
        }

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Prevent duplicate active subscriptions: a new purchase always
            // supersedes any existing active row for this user (whether still
            // time-valid or merely not yet lazily flagged expired) rather
            // than stacking a second concurrently-'active' row — required so
            // the partial unique index below (idx_subscriptions_one_active_per_user)
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
                [userId, subscription.id, plan.price_cents, plan.currency, provider.name, charge.providerCustomerId, charge.providerTransactionId, idempotency_key || null]
            );

            await client.query(
                `INSERT INTO notifications (user_id, title, message, type, action_url)
                 VALUES ($1, 'Subscription Activated', $2, 'system', '/settings')`,
                [userId, `Your ${plan.name} plan is now active. (Test mode — no real payment was processed.)`]
            );

            await client.query("COMMIT");

            res.json({
                success: true,
                testMode: provider.testMode,
                subscription,
                transaction: txnResult.rows[0],
            });
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        // A genuine concurrent double-submit can lose a race on either of two
        // UNIQUE constraints: transactions.idempotency_key (same key sent
        // twice) or idx_subscriptions_one_active_per_user (two different
        // requests both trying to activate a subscription for this user at
        // once). Either way the loser should replay the winner's real result
        // instead of surfacing a raw 500 for something that did succeed.
        if (err.code === "23505") {
            try {
                let existingTxn = null;
                if (idempotency_key) {
                    const byKey = await pool.query(
                        "SELECT * FROM transactions WHERE idempotency_key = $1 AND user_id = $2",
                        [idempotency_key, userId]
                    );
                    existingTxn = byKey.rows[0] || null;
                }
                if (!existingTxn) {
                    // Fall back to whatever transaction backs this user's
                    // current active subscription — the other request in the
                    // race just created it.
                    const byActiveSub = await pool.query(
                        `SELECT t.* FROM transactions t
                         JOIN subscriptions s ON s.id = t.subscription_id
                         WHERE s.user_id = $1 AND s.status = 'active' AND s.ends_at > CURRENT_TIMESTAMP
                         ORDER BY t.created_at DESC LIMIT 1`,
                        [userId]
                    );
                    existingTxn = byActiveSub.rows[0] || null;
                }
                if (existingTxn) {
                    const existingSub = await pool.query("SELECT * FROM subscriptions WHERE id = $1", [existingTxn.subscription_id]);
                    return res.json({
                        success: true,
                        testMode: getPaymentProvider().testMode,
                        subscription: existingSub.rows[0],
                        transaction: existingTxn,
                        replayed: true,
                    });
                }
            } catch (raceErr) {
                console.error("Error resolving checkout race:", raceErr);
            }
        }
        console.error("Error creating subscription:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
