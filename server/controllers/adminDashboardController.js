const adminDashboardModel = require("../models/adminDashboardModel");
const adminUserModel = require("../models/adminUserModel");
const verificationModel = require("../models/verificationModel");

// GET /api/admin/dashboard
async function getDashboard(req, res) {
    try {
        const [totalUsers, verifiedUsers, premiumUsers, activeToday, registrations30d, registrations12mo,
            subscriptionDistribution, recentUsersResult, recentPaymentsRows, verifSummaryRows] = await Promise.all([
            adminDashboardModel.getTotalUsersStat(),
            adminDashboardModel.getVerifiedUsersStat(),
            adminDashboardModel.getPremiumUsersStat(),
            adminDashboardModel.getActiveTodayStat(),
            adminDashboardModel.getRegistrationsLast30Days(),
            adminDashboardModel.getRegistrationsLast12Months(),
            adminDashboardModel.getSubscriptionDistribution(),
            // Reuses the same richer user model the Users page runs on, so the
            // dashboard's Recent Users list can show verification + plan
            // without a bespoke query.
            adminUserModel.listUsers({ page: 1, limit: 5 }),
            adminDashboardModel.getRecentPayments(5),
            verificationModel.getSummaryCounts(),
        ]);
        const recentUsersRows = recentUsersResult.rows;

        const totalSubs = subscriptionDistribution.reduce((sum, p) => sum + parseInt(p.count, 10), 0);
        const subscriptionData = subscriptionDistribution.map(p => ({
            name: p.name,
            value: parseInt(p.count, 10),
            percent: totalSubs > 0 ? `${((parseInt(p.count, 10) / totalSubs) * 100).toFixed(1)}%` : "0.0%",
        }));

        const pendingByType = { cnic: 0, selfie: 0, profile_photo: 0 };
        for (const row of verifSummaryRows) {
            if (row.status === "pending" && pendingByType[row.type] !== undefined) {
                pendingByType[row.type] = parseInt(row.count, 10);
            }
        }

        const recentUsers = recentUsersRows.map(u => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name || ""}`.trim(),
            city: u.city || "Not specified",
            image: u.image || null,
            time: u.created_at,
            verified: u.email_verified,
            plan: u.plan || "Free",
        }));

        const recentPayments = recentPaymentsRows.map(p => ({
            id: p.id,
            name: `${p.first_name} ${p.last_name || ""}`.trim(),
            plan: p.plan_name || "N/A",
            amount: `${p.currency} ${(p.amount_cents / 100).toLocaleString()}`,
            status: p.status,
            time: p.created_at,
        }));

        res.json({
            stats: { totalUsers, verifiedUsers, premiumUsers, activeToday },
            registrations30d: registrations30d.map(r => ({ date: new Date(r.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }), users: parseInt(r.count, 10) })),
            registrations12mo: registrations12mo.map(r => ({ date: r.month, users: parseInt(r.count, 10) })),
            subscriptionData,
            recentUsers,
            recentPayments,
            pendingVerifications: [
                { label: "CNIC Verifications", count: pendingByType.cnic },
                { label: "Selfie Verifications", count: pendingByType.selfie },
                { label: "Profile Photo Verifications", count: pendingByType.profile_photo },
            ],
        });
    } catch (err) {
        console.error("Error fetching admin dashboard:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { getDashboard };
