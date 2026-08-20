const reportModel = require("../models/reportModel");

const MAX_DETAILS_LENGTH = 1000;

// GET /api/reports — reports I have submitted (status can be tracked).
async function getReports(req, res) {
    try {
        const reports = await reportModel.getByReporter(req.user.id);
        res.json(reports);
    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// POST /api/reports — report another user. reporter_id is ALWAYS req.user.id
// (the verified JWT), never taken from the request body — there is no way to
// submit a report "as" someone else.
async function createReport(req, res) {
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
        if (!reportModel.VALID_REASONS.includes(reason)) {
            return res.status(400).json({ message: `Reason must be one of: ${reportModel.VALID_REASONS.join(", ")}.` });
        }
        if (details.length > MAX_DETAILS_LENGTH) {
            return res.status(400).json({ message: `Details must be ${MAX_DETAILS_LENGTH} characters or fewer.` });
        }

        if (!(await reportModel.userExists(reportedId))) {
            return res.status(404).json({ message: "User not found." });
        }

        // Duplicate-spam guard — see reportModel.hasOpenReport for the real
        // DB-level backstop this mirrors.
        if (await reportModel.hasOpenReport(reporterId, reportedId)) {
            return res.status(409).json({ message: "You already have an open report against this user." });
        }

        const report = await reportModel.createReport(reporterId, reportedId, reason, details);
        res.status(201).json({ message: "Report submitted.", report });
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
}

module.exports = { getReports, createReport };
