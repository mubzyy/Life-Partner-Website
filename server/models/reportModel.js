const pool = require("../db");

const VALID_REASONS = ["Fake Profile", "Inappropriate Content", "Harassment", "Spam", "Scam / Fraud", "Other"];
const VALID_STATUSES = ["pending", "reviewed", "resolved", "dismissed"];

async function getByReporter(reporterId) {
    const result = await pool.query(
        `SELECT id, reported_id, reason, details, status, created_at
         FROM reports WHERE reporter_id = $1 ORDER BY created_at DESC`,
        [reporterId]
    );
    return result.rows;
}

async function userExists(userId) {
    const result = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
    return result.rows.length > 0;
}

// A reporter can only have one open (pending/reviewed) report against the
// same target at a time — also backed by a real DB partial unique index
// (idx_reports_one_open_per_pair), so this is a friendly early check, not
// the only defense.
async function hasOpenReport(reporterId, reportedId) {
    const result = await pool.query(
        `SELECT id FROM reports WHERE reporter_id = $1 AND reported_id = $2 AND status IN ('pending', 'reviewed')`,
        [reporterId, reportedId]
    );
    return result.rows.length > 0;
}

async function createReport(reporterId, reportedId, reason, details) {
    const result = await pool.query(
        `INSERT INTO reports (reporter_id, reported_id, reason, details, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING id, reported_id, reason, details, status, created_at`,
        [reporterId, reportedId, reason, details || null]
    );
    return result.rows[0];
}

// Transitions a report's status and fires a real, persisted notification to
// the reporter — mirrors updateTicketStatus in models/supportModel.js. There
// is no staff/admin tool in this app to call this from yet; it exists so the
// pattern is real, tested, and ready for one.
async function updateReportStatus(reportId, newStatus) {
    if (!VALID_STATUSES.includes(newStatus)) return null;
    const result = await pool.query(
        `UPDATE reports SET status = $1 WHERE id = $2 RETURNING *`,
        [newStatus, reportId]
    );
    if (result.rows.length === 0) return null;
    const report = result.rows[0];
    if (!report.reporter_id) return report; // reporter account no longer exists

    try {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, action_url)
             VALUES ($1, 'Report Update', $2, 'system', '/settings')`,
            [report.reporter_id, `Your report has been marked as ${newStatus}.`]
        );
    } catch (e) {
        console.error("Error creating report status notification", e);
    }

    return report;
}

module.exports = { VALID_REASONS, getByReporter, userExists, hasOpenReport, createReport, updateReportStatus };
