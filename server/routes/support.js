const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { updateTicketStatus } = require("../lib/support");

const SUBJECTS = ["billing", "technical", "report", "other"];
const MAX_MESSAGE_LENGTH = 2000;

// GET /api/support — MY own support tickets, most recent first, so a
// submitted request's status can actually be tracked (Contact Support's
// "My Requests" list reads from here).
router.get("/", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, subject, message, status, created_at, updated_at
             FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching support tickets:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// POST /api/support — submit a Help & Support / Contact Support request.
// Persists a real support_tickets row; status always starts 'open'.
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { subject, message } = req.body;

        const errors = [];
        if (!SUBJECTS.includes(subject)) {
            errors.push(`Subject must be one of: ${SUBJECTS.join(", ")}.`);
        }
        const trimmedMessage = typeof message === "string" ? message.trim() : "";
        if (!trimmedMessage) {
            errors.push("Message is required.");
        } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            errors.push(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`);
        }
        if (errors.length > 0) {
            return res.status(400).json({ message: "Validation failed.", errors });
        }

        const result = await pool.query(
            `INSERT INTO support_tickets (user_id, subject, message, status)
             VALUES ($1, $2, $3, 'open')
             RETURNING id, subject, message, status, created_at, updated_at`,
            [req.user.id, subject, trimmedMessage]
        );

        res.status(201).json({ message: "Your request has been submitted.", ticket: result.rows[0] });
    } catch (err) {
        console.error("Error submitting support request:", err);
        res.status(500).json({ message: "Server error." });
    }
});

// PATCH /api/support/:id — self-service close/reopen of MY OWN ticket.
// Ownership is enforced by the WHERE clause (id + user_id = req.user.id) —
// there is no way to touch another user's ticket. Only 'closed' and 'open'
// are reachable here (a customer can close or reopen their own request);
// 'in_progress'/'resolved' are reserved for a future staff/admin tool that
// doesn't exist in this app yet — see updateTicketStatus in lib/support.js,
// which both paths share so the same real notification always fires.
router.patch("/:id", authMiddleware, async (req, res) => {
    try {
        const ticketId = Number(req.params.id);
        const { status } = req.body;
        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({ message: "Invalid ticket id." });
        }
        if (!["closed", "open"].includes(status)) {
            return res.status(400).json({ message: "status must be 'closed' or 'open'." });
        }

        const owned = await pool.query(
            "SELECT id, status FROM support_tickets WHERE id = $1 AND user_id = $2",
            [ticketId, req.user.id]
        );
        if (owned.rows.length === 0) {
            return res.status(404).json({ message: "Ticket not found." });
        }
        if (owned.rows[0].status === "resolved") {
            return res.status(400).json({ message: "A resolved ticket can't be modified." });
        }

        const ticket = await updateTicketStatus(pool, ticketId, status);
        res.json({ ticket });
    } catch (err) {
        console.error("Error updating support ticket:", err);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
