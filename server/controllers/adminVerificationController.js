const path = require("path");
const verificationModel = require("../models/verificationModel");
const { VERIFICATIONS_DIR } = require("../middleware/upload");

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function shapeRequest(row) {
    return {
        id: row.id,
        type: row.type,
        status: row.status,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at,
        reviewNote: row.review_note,
        hasDocument: !!row.document_path,
        user: {
            id: row.user_id,
            name: `${row.first_name} ${row.last_name || ""}`.trim(),
            email: row.email,
            city: row.city || "Not specified",
            image: row.image || null,
        },
        reviewedBy: row.reviewer_first_name ? `${row.reviewer_first_name} ${row.reviewer_last_name || ""}`.trim() : null,
    };
}

// GET /api/admin/verifications
async function getVerifications(req, res) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
        const { type, status, search } = req.query;

        const { rows, total } = await verificationModel.listRequests({ type, status, search, page, limit });
        const summaryRows = await verificationModel.getSummaryCounts();

        const summary = { pending: 0, approved: 0, rejected: 0 };
        for (const row of summaryRows) summary[row.status] = (summary[row.status] || 0) + parseInt(row.count, 10);

        res.json({
            results: rows.map(shapeRequest), total, page, limit,
            hasNextPage: (page - 1) * limit + rows.length < total,
            summary,
        });
    } catch (err) {
        console.error("Error fetching verifications:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/admin/verifications/:id/document — streams the private document.
// adminAuth already gates this whole route group; ID documents are never
// reachable through the public /uploads static mount.
async function getDocument(req, res) {
    try {
        const request = await verificationModel.findRequestById(Number(req.params.id));
        if (!request || !request.document_path) {
            return res.status(404).json({ message: "Document not found." });
        }
        const filePath = path.join(VERIFICATIONS_DIR, path.basename(request.document_path));
        res.sendFile(filePath, (err) => {
            if (err && !res.headersSent) res.status(404).json({ message: "Document not found." });
        });
    } catch (err) {
        console.error("Error fetching verification document:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// PATCH /api/admin/verifications/:id — approve or reject.
async function reviewVerification(req, res) {
    try {
        const requestId = Number(req.params.id);
        const { status, note } = req.body;
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "status must be 'approved' or 'rejected'." });
        }

        const existing = await verificationModel.findRequestById(requestId);
        if (!existing) return res.status(404).json({ message: "Verification request not found." });
        if (existing.status !== "pending") {
            return res.status(400).json({ message: "This request has already been reviewed." });
        }

        const updated = await verificationModel.reviewRequest(requestId, {
            status, reviewedBy: req.admin.id, reviewNote: note,
        });

        try {
            await verificationModel.notifyReviewResult(updated.user_id, updated.type, updated.status);
        } catch (e) {
            console.error("Error creating verification-review notification", e);
        }

        res.json({ message: `Verification ${status}.`, request: updated });
    } catch (err) {
        console.error("Error reviewing verification:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { getVerifications, getDocument, reviewVerification };
