const transactionModel = require("../models/transactionModel");
const adminDashboardModel = require("../models/adminDashboardModel");

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function pct(cents) { return cents / 100; }

// GET /api/admin/payments
async function getPayments(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
        const { status, method, search } = req.query;

        const { rows, total } = await transactionModel.listPayments({ status, method, search, page, limit });
        const results = rows.map(t => ({
            id: t.id,
            user: { id: t.user_id, name: `${t.first_name} ${t.last_name || ""}`.trim() },
            plan: t.plan_name || "N/A",
            amount: pct(t.amount_cents),
            currency: t.currency,
            method: t.provider,
            status: t.status.charAt(0).toUpperCase() + t.status.slice(1),
            date: t.created_at,
        }));

        res.json({ results, total, page, limit, hasNextPage: (page - 1) * limit + rows.length < total });
    } catch (err) {
        console.error("Error fetching admin payments:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/admin/payments/summary
async function getPaymentSummary(req, res) {
    try {
        const s = await transactionModel.getPaymentSummary();
        const allCount = parseInt(s.all_count, 10);
        const paidCount = parseInt(s.paid_count, 10);
        res.json({
            totalRevenue: pct(parseInt(s.total_revenue_cents, 10)),
            successRate: allCount > 0 ? Math.round((paidCount / allCount) * 1000) / 10 : 0,
            failed: parseInt(s.failed_count, 10),
            pending: parseInt(s.pending_count, 10),
        });
    } catch (err) {
        console.error("Error fetching payment summary:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/admin/reports
async function getReports(req, res) {
    try {
        const [monthly, byPlan, summary, totalUsers] = await Promise.all([
            transactionModel.getMonthlyRevenue(),
            transactionModel.getRevenueByPlan(),
            transactionModel.getPaymentSummary(),
            adminDashboardModel.getTotalUsersStat(),
        ]);

        const monthlyRevenue = monthly.map(m => ({
            month: m.month,
            revenue: pct(parseInt(m.revenue_cents, 10)),
            users: parseInt(m.new_users, 10),
        }));
        const revenueByPlan = byPlan.map(p => ({ name: p.name, value: pct(parseInt(p.revenue_cents, 10)) }));

        const totalRevenue = pct(parseInt(summary.total_revenue_cents, 10));
        const allCount = parseInt(summary.all_count, 10);
        const paidCount = parseInt(summary.paid_count, 10);
        const conversionRate = totalUsers.value > 0 ? Math.round((paidCount / totalUsers.value) * 1000) / 10 : 0;
        const avgRevenuePerUser = paidCount > 0 ? Math.round((totalRevenue / paidCount) * 100) / 100 : 0;

        res.json({
            monthlyRevenue,
            revenueByPlan,
            reportStats: {
                totalRevenue: { value: totalRevenue, change: null },
                newUsers: { value: totalUsers.value, change: totalUsers.change },
                conversionRate: { value: conversionRate, change: null },
                avgRevenuePerUser: { value: avgRevenuePerUser, change: null },
            },
        });
    } catch (err) {
        console.error("Error fetching admin reports:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { getPayments, getPaymentSummary, getReports };
