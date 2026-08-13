// Shared support-ticket helpers.

const STATUS_LABELS = {
    open: "Open",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
};

// Transitions a ticket's status and fires a real, persisted notification to
// its owner — the one place status changes and their notifications happen,
// so every caller (a future staff/admin tool, or the self-service paths in
// routes/support.js) produces the same correct, deduplicated result.
// Returns the updated ticket row, or null if the ticket doesn't exist.
async function updateTicketStatus(pool, ticketId, newStatus) {
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

module.exports = { updateTicketStatus, STATUS_LABELS };
