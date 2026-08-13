// Shared report helpers.

const VALID_REASONS = ["Fake Profile", "Inappropriate Content", "Harassment", "Spam", "Scam / Fraud", "Other"];
const VALID_STATUSES = ["pending", "reviewed", "resolved", "dismissed"];

// Transitions a report's status and fires a real, persisted notification to
// the reporter — mirrors updateTicketStatus in lib/support.js. There is no
// staff/admin tool in this app to call this from yet; it exists so the
// pattern is real, tested, and ready for one.
async function updateReportStatus(pool, reportId, newStatus) {
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

module.exports = { updateReportStatus, VALID_REASONS };
