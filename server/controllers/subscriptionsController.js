const subscriptionModel = require("../models/subscriptionModel");
const { getPaymentProvider } = require("../lib/paymentProvider");

// GET /api/subscriptions/plans — the single source of truth for plan IDs and
// pricing. PricingPage/CheckoutPage fetch this instead of keeping their own
// hardcoded (and previously inconsistent) copies.
async function getPlans(req, res) {
    try {
        const plans = await subscriptionModel.getActivePlans();
        res.json(plans);
    } catch (err) {
        console.error("Error fetching plans:", err);
        res.status(500).json({ message: "Server error" });
    }
}

// GET /api/subscriptions/me — the authenticated user's current subscription.
async function getMySubscription(req, res) {
    try {
        const userId = req.user.id;
        await subscriptionModel.expireStaleSubscriptions(userId);

        const subscription = await subscriptionModel.getCurrentSubscription(userId);
        if (!subscription) {
            return res.json({ isPremium: false, status: "free" });
        }
        res.json({ isPremium: true, ...subscription });
    } catch (err) {
        console.error("Error fetching subscription:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// POST /api/subscriptions/cancel — cancel MY currently active subscription.
// This mock/test-mode system has no recurring billing to stop, so
// cancellation is immediate: status flips to 'canceled' and premium access
// ends now (isUserPremium only ever counts status = 'active').
async function cancelSubscription(req, res) {
    try {
        const userId = req.user.id;
        const canceled = await subscriptionModel.cancelActiveSubscription(userId);

        if (!canceled) {
            return res.status(404).json({ message: "No active subscription to cancel." });
        }

        const plan = await subscriptionModel.getPlanById(canceled.plan_id);
        const planName = plan?.name || "Your plan";
        try {
            await subscriptionModel.notifyCancellation(userId, planName);
        } catch (e) {
            console.error("Error creating cancellation notification", e);
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Error canceling subscription:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// POST /api/subscriptions — checkout.
//
// IMPORTANT: no real payment provider is configured (see lib/paymentProvider.js).
// This runs in explicit test/mock mode — it never claims a real charge
// occurred, but it does perform real, correct database writes: a
// subscriptions row and a transactions row, created together or not at all.
async function checkout(req, res) {
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
            const existingTxn = await subscriptionModel.findTransactionByIdempotencyKey(idempotency_key, userId);
            if (existingTxn) {
                const existingSub = await subscriptionModel.getSubscriptionById(existingTxn.subscription_id);
                return res.json({
                    success: true,
                    testMode: getPaymentProvider().testMode,
                    subscription: existingSub,
                    transaction: existingTxn,
                    replayed: true,
                });
            }
        }

        const plan = await subscriptionModel.getActivePlanForCheckout(plan_id);
        if (!plan) {
            return res.status(400).json({ message: "Invalid or inactive plan." });
        }

        const provider = getPaymentProvider();
        const charge = await provider.charge({
            amountCents: plan.price_cents,
            currency: plan.currency,
            method: payment_method || "card",
        });

        if (!charge.success) {
            return res.status(402).json({ message: "Payment failed.", testMode: provider.testMode });
        }

        const { subscription, transaction } = await subscriptionModel.createSubscriptionAndTransaction({
            userId, plan, providerName: provider.name, charge, idempotencyKey: idempotency_key,
        });

        res.json({
            success: true,
            testMode: provider.testMode,
            subscription,
            transaction,
        });
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
                    existingTxn = await subscriptionModel.findTransactionByIdempotencyKey(idempotency_key, userId);
                }
                if (!existingTxn) {
                    // Fall back to whatever transaction backs this user's
                    // current active subscription — the other request in the
                    // race just created it.
                    existingTxn = await subscriptionModel.getLatestTransactionForActiveSubscription(userId);
                }
                if (existingTxn) {
                    const existingSub = await subscriptionModel.getSubscriptionById(existingTxn.subscription_id);
                    return res.json({
                        success: true,
                        testMode: getPaymentProvider().testMode,
                        subscription: existingSub,
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
}

module.exports = { getPlans, getMySubscription, cancelSubscription, checkout };
