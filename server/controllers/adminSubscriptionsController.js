const subscriptionModel = require("../models/subscriptionModel");

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function shapePlan(p) {
    return {
        id: p.id,
        name: p.name,
        price: p.price_cents / 100,
        currency: p.currency,
        durationMonths: p.duration_months,
        isActive: p.is_active,
        features: p.features || [],
        subscribers: parseInt(p.subscriber_count, 10),
        revenue: `${p.currency} ${(p.revenue_cents / 100).toLocaleString()}`,
    };
}

// GET /api/admin/subscriptions/plans — ALL plans (including inactive ones),
// unlike the public GET /api/subscriptions/plans which only shows active
// ones to real customers.
async function getPlans(req, res) {
    try {
        const plans = await subscriptionModel.getAllPlansAdmin();
        res.json(plans.map(shapePlan));
    } catch (err) {
        console.error("Error fetching admin plans:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// POST /api/admin/subscriptions/plans
async function createPlan(req, res) {
    try {
        const { name, price, duration_months, currency, features } = req.body;
        if (!name || !name.trim()) return res.status(400).json({ message: "Plan name is required." });
        const priceNum = Number(price);
        if (!Number.isFinite(priceNum) || priceNum <= 0) return res.status(400).json({ message: "A valid price is required." });
        const duration = Number(duration_months);
        if (![1, 3, 6, 12].includes(duration)) return res.status(400).json({ message: "duration_months must be 1, 3, 6, or 12." });

        const cleanFeatures = Array.isArray(features)
            ? features.map(f => String(f).trim()).filter(Boolean)
            : (typeof features === "string" ? features.split("\n").map(f => f.trim()).filter(Boolean) : []);

        const plan = await subscriptionModel.createPlan({
            name: name.trim(), price_cents: Math.round(priceNum * 100),
            currency: currency || "PKR", duration_months: duration, features: cleanFeatures,
        });
        res.status(201).json(shapePlan({ ...plan, subscriber_count: 0, revenue_cents: 0 }));
    } catch (err) {
        console.error("Error creating plan:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// PUT /api/admin/subscriptions/plans/:id
async function updatePlan(req, res) {
    try {
        const { name, price, duration_months, currency, features, is_active } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (price !== undefined) updates.price_cents = Math.round(Number(price) * 100);
        if (duration_months !== undefined) updates.duration_months = Number(duration_months);
        if (currency !== undefined) updates.currency = currency;
        if (features !== undefined) {
            updates.features = Array.isArray(features) ? features.map(f => String(f).trim()).filter(Boolean) : features;
        }
        if (is_active !== undefined) updates.is_active = !!is_active;

        const updated = await subscriptionModel.updatePlan(req.params.id, updates);
        if (!updated) return res.status(404).json({ message: "Plan not found." });

        const plans = await subscriptionModel.getAllPlansAdmin();
        const full = plans.find(p => p.id === updated.id);
        res.json(shapePlan(full));
    } catch (err) {
        console.error("Error updating plan:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/admin/subscriptions — per-user subscription list.
async function getSubscriptions(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
        const { status } = req.query;

        const { rows, total } = await subscriptionModel.listSubscriptions({ status, page, limit });
        const results = rows.map(s => ({
            id: s.id,
            user: { id: s.user_id, name: `${s.first_name} ${s.last_name || ""}`.trim() },
            plan: s.plan_name,
            startDate: s.starts_at,
            endDate: s.ends_at,
            amount: s.price_cents / 100,
            status: s.status === "active" && new Date(s.ends_at) > new Date() ? "Active"
                : s.status === "active" ? "Expired" // lazily-expired, not yet flagged
                : s.status.charAt(0).toUpperCase() + s.status.slice(1),
        }));

        res.json({ results, total, page, limit, hasNextPage: (page - 1) * limit + rows.length < total });
    } catch (err) {
        console.error("Error fetching admin subscriptions:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { getPlans, createPlan, updatePlan, getSubscriptions };
