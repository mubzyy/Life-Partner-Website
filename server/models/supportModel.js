const pool = require("../db");

const STATUS_LABELS = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
};

async function getByUser(userId) {
    const result = await pool.query(
        `SELECT id, subject, message, status, created_at, updated_at
         FROM support_tickets WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
}

async function createTicket(userId, subject, message) {
    const result = await pool.query(
        `INSERT INTO support_tickets (user_id, subject, message, status)
         VALUES ($1, $2, $3, 'open')
         RETURNING id, subject, message, status, created_at, updated_at`,
        [userId, subject, message]
    );
    return result.rows[0];
}

async function findOwnedTicket(ticketId, userId) {
    const result = await pool.query(
        "SELECT id, status FROM support_tickets WHERE id = $1 AND user_id = $2",
        [ticketId, userId]
    );
    return result.rows[0] || null;
}

// Transitions a ticket's status and fires a real, persisted notification to
// its owner — the one place status changes and their notifications happen,
// so every caller (a future staff/admin tool, or the self-service path in
// supportController.js) produces the same correct, deduplicated result.
// Returns the updated ticket row, or null if the ticket doesn't exist.
async function updateTicketStatus(ticketId, newStatus) {
    const result = await pool.query(
        `UPDATE support_tickets SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
        [newStatus, ticketId]
    );
    if (result.rows.length === 0) return null;
    const ticket = result.rows[0];

    const title = newStatus === "resolved" ? "Support Ticket Resolved" : "Support Ticket Updated";
    const message = newStatus === "resolved"
        ? `Your support request "${ticket.subject}" has been marked resolved.`
        : `Your support request "${ticket.subject}" is now ${STATUS_LABELS[newStatus] || newStatus}.`;

    try {
        await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, action_url)
             VALUES ($1, $2, $3, 'system', '/settings')`,
            [ticket.user_id, title, message]
        );
    } catch (e) {
        console.error("Error creating ticket status notification", e);
    }

    return ticket;
}

module.exports = { getByUser, createTicket, findOwnedTicket, updateTicketStatus };
