// Safe additive migration — creates a dedicated support_tickets table.
// Contact Support previously piggybacked on the `reports` table (reported_id
// left NULL), which conflated "I have an issue" with "I'm reporting someone"
// and used the wrong status vocabulary (pending/reviewed/resolved/dismissed
// instead of open/in_progress/resolved/closed). This migration creates the
// real, separate table; it does not touch or migrate any existing `reports`
// rows (reports.reported_id IS NULL rows, if any, are a separate, pre-existing
// concern left untouched — none exist in this database today).
// Never drops or truncates anything; safe to re-run (CREATE ... IF NOT EXISTS).

const pool = require("../db");

async function migrate() {
    try {
        console.log("Creating support_tickets table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS support_tickets (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                subject VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Justified by GET /api/support (list-my-own-tickets, ordered by recency).
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id_created_at ON support_tickets(user_id, created_at DESC)`);

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    } finally {
        await pool.end();
    }
}

migrate();
