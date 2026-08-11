const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const PLANS = [
    {
        id: "premium_1_month",
        name: "Premium - 1 Month",
        duration_months: 1,
        price_pkr: 2500,
        features: ["See who likes you", "Advanced matching", "Unlimited messages"]
    },
    {
        id: "premium_3_months",
        name: "Premium - 3 Months",
        duration_months: 3,
        price_pkr: 6000,
        features: ["See who likes you", "Advanced matching", "Unlimited messages", "Priority profile"]
    },
    {
        id: "premium_6_months",
        name: "Premium - 6 Months",
        duration_months: 6,
        price_pkr: 10000,
        features: ["See who likes you", "Advanced matching", "Unlimited messages", "Priority profile", "Dedicated account manager"]
    }
];

// GET /api/subscriptions/plans
router.get("/plans", (req, res) => {
    res.json(PLANS);
});

// GET /api/subscriptions/me
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT id, plan_id, status, start_date, end_date
            FROM subscriptions
            WHERE user_id = $1 AND status = 'active' AND end_date > CURRENT_TIMESTAMP
            ORDER BY end_date DESC LIMIT 1
        `;
        const result = await pool.query(query, [userId]);
        
        if (result.rows.length === 0) {
            return res.json({ status: "free" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching subscription:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/subscriptions
// Mock checkout processing
router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { plan_id, payment_method } = req.body; // payment_method is mock

        const plan = PLANS.find(p => p.id === plan_id);
        if (!plan) {
            return res.status(400).json({ message: "Invalid plan" });
        }

        // Mock payment processing success
        // In real app, we'd integrate Stripe, JazzCash, EasyPaisa, etc.

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + plan.duration_months);

        const query = `
            INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
            VALUES ($1, $2, 'active', $3, $4)
            RETURNING *;
        `;
        const result = await pool.query(query, [userId, plan_id, startDate, endDate]);

        // Insert notification
        await pool.query(`
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ($1, 'Subscription Upgraded', 'Welcome to Premium!', 'system')
        `, [userId]);

        res.json({ success: true, subscription: result.rows[0] });
    } catch (err) {
        console.error("Error creating subscription:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
