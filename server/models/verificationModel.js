const pool = require("../db");

const TYPES = ["cnic", "selfie", "profile_photo"];

// ── User-facing ─────────────────────────────────────────────────────────

async function getMyRequests(userId) {
    const result = await pool.query(
        `SELECT id, type, status, submitted_at, reviewed_at, review_note
         FROM verification_requests WHERE user_id = $1 ORDER BY submitted_at DESC`,
        [userId]
    );
    return result.rows;
}

async function hasPendingOfType(userId, type) {
    const result = await pool.query(
        `SELECT id FROM verification_requests WHERE user_id = $1 AND type = $2 AND status = 'pending'`,
        [userId, type]
    );
    return result.rows.length > 0;
}

// autoApprove: platform_settings.auto_approve_verifications — if on, the
// request is created already 'approved' (self-reviewed by the system, no
// admin queue entry needed). Real either way — never fakes a pending state
// that silently does nothing.
async function createRequest({ userId, type, documentPath, autoApprove }) {
    const result = await pool.query(
        `INSERT INTO verification_requests (user_id, type, document_path, status, reviewed_at, review_note)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, type, status, submitted_at`,
        [
            userId, type, documentPath || null,
            autoApprove ? "approved" : "pending",
            autoApprove ? new Date() : null,
            autoApprove ? "Auto-approved by platform settings." : null,
        ]
    );
    return result.rows[0];
}

async function findOwnedRequest(requestId, userId) {
    const result = await pool.query(
        `SELECT id, user_id, document_path FROM verification_requests WHERE id = $1 AND user_id = $2`,
        [requestId, userId]
    );
    return result.rows[0] || null;
}

// ── Admin-facing ────────────────────────────────────────────────────────

async function listRequests({ type, status, search, page, limit }) {
    const conditions = [];
    const params = [];
    let i = 1;

    if (type && type !== "All") { conditions.push(`vr.type = $${i++}`); params.push(type); }
    if (status && status !== "All") { conditions.push(`vr.status = $${i++}`); params.push(status); }
    if (search) {
        conditions.push(`(u.first_name || ' ' || COALESCE(u.last_name, '')) ILIKE $${i++}`);
        params.push(`%${search}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const baseQuery = `
        FROM verification_requests vr
        JOIN users u ON u.id = vr.user_id
        LEFT JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN users r ON r.id = vr.reviewed_by
        ${whereClause}
    `;

    const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const offset = (page - 1) * limit;
    const dataParams = [...params, limit, offset];
    const result = await pool.query(
        `SELECT
            vr.id, vr.type, vr.status, vr.submitted_at, vr.reviewed_at, vr.review_note,
            vr.document_path,
            u.id AS user_id, u.first_name, u.last_name, u.email,
            up.profile_photo_url AS image, up.city,
            r.first_name AS reviewer_first_name, r.last_name AS reviewer_last_name
         ${baseQuery}
         ORDER BY vr.submitted_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        dataParams
    );
    return { rows: result.rows, total };
}

async function getSummaryCounts() {
    const result = await pool.query(`
        SELECT type, status, COUNT(*) AS count
        FROM verification_requests GROUP BY type, status
    `);
    return result.rows;
}

async function findRequestById(requestId) {
    const result = await pool.query(
        `SELECT id, user_id, type, status, document_path FROM verification_requests WHERE id = $1`,
        [requestId]
    );
    return result.rows[0] || null;
}

async function reviewRequest(requestId, { status, reviewedBy, reviewNote }) {
    const result = await pool.query(
        `UPDATE verification_requests
         SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2, review_note = $3
         WHERE id = $4 RETURNING id, user_id, type, status`,
        [status, reviewedBy, reviewNote || null, requestId]
    );
    return result.rows[0] || null;
}

async function notifyReviewResult(userId, type, status) {
    const label = { cnic: "CNIC", selfie: "Selfie", profile_photo: "Profile Photo" }[type] || type;
    const verb = status === "approved" ? "approved" : "rejected";
    await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, action_url)
         VALUES ($1, $2, $3, 'system', '/settings')`,
        [userId, `${label} Verification ${status === "approved" ? "Approved" : "Rejected"}`, `Your ${label} verification request has been ${verb}.`]
    );
}

module.exports = {
    TYPES, getMyRequests, hasPendingOfType, createRequest, findOwnedRequest,
    listRequests, getSummaryCounts, findRequestById, reviewRequest, notifyReviewResult,
};
