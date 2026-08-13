const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { VALID_REASONS } = require("../lib/reports");

const MAX_DETAILS_LENGTH = 1000;

// GET /api/reports — reports I have submitted (status can be tracked).
// Scoped to reporter_id = req.user.id, never any other id.
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, reported_id, reason, details, status, created_at
             FROM reports WHERE reporter_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/reports — report another user. reporter_id is ALWAYS req.user.id
// (the verified JWT), never taken from the request body — there is no way to
// submit a report "as" someone else.
router.post("/", authMiddleware, async (req, res) => {
    try {
        const reporterId = req.user.id;
        const reportedId = Number(req.body.reported_id);
        const { reason } = req.body;
        const details = typeof req.body.details === "string" ? req.body.details.trim() : "";

        if (!Number.isInteger(reportedId) || reportedId <= 0) {
            return res.status(400).json({ message: "Invalid reported_id." });
        }
        if (reportedId === reporterId) {
            return res.status(400).json({ message: "You can't report yourself." });
        }
        if (!VALID_REASONS.includes(reason)) {
            return res.status(400).json({ message: `Reason must be one of: ${VALID_REASONS.join(", ")}.` });
        }
        if (details.length > MAX_DETAILS_LENGTH) {
            return res.status(400).json({ message: `Details must be ${MAX_DETAILS_LENGTH} characters or fewer.` });
        }

        const target = await pool.query("SELECT id FROM users WHERE id = $1", [reportedId]);
        if (target.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        // Duplicate-spam guard: a reporter can only have one open (pending/
        // reviewed) report against the same target at a time — also backed by
        // a real DB partial unique index (idx_reports_one_open_per_pair), so
        // this check is a friendly early error, not the only defense.
        const existing = await pool.query(
            `SELECT id FROM reports WHERE reporter_id = $1 AND reported_id = $2 AND status IN ('pending', 'reviewed')`,
            [reporterId, reportedId]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "You already have an open report against this user." });
        }

        const result = await pool.query(
            `INSERT INTO reports (reporter_id, reported_id, reason, details, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING id, reported_id, reason, details, status, created_at`,
            [reporterId, reportedId, reason, details || null]
        );

        res.status(201).json({ message: "Report submitted.", report: result.rows[0] });
    } catch (err) {
        // The partial unique index is the real backstop for the race the
        // check above can't fully close (two rapid submissions from the same
        // reporter against the same target).
        if (err.code === "23505" && err.constraint === "idx_reports_one_open_per_pair") {
            return res.status(409).json({ message: "You already have an open report against this user." });
        }
        console.error("Error submitting report:", err);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
