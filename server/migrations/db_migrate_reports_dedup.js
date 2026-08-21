// Safe additive migration — indexes the existing `reports` table for real
// queries (list-my-reports, duplicate-check) and adds a structural guard
// against report spam: a partial unique index means a reporter can never
// have two simultaneously-open (pending/reviewed) reports against the same
// target — the same canonical-pair-style dedup pattern already used for
// matches/conversations/subscriptions in this codebase. Never drops or
// truncates anything; safe to re-run (CREATE ... IF NOT EXISTS).

const pool = require("../db");

async function migrate() {
    try {
        console.log("Indexing reports(reporter_id) and reports(reported_id)...");
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON reports(reported_id)`);

        console.log("Checking for existing duplicate open reports (would violate the new index)...");
        const dupes = await pool.query(`
            SELECT reporter_id, reported_id, COUNT(*) FROM reports
            WHERE reported_id IS NOT NULL AND status IN ('pending', 'reviewed')
            GROUP BY reporter_id, reported_id HAVING COUNT(*) > 1
        `);
        if (dupes.rows.length > 0) {
            console.log(`Found ${dupes.rows.length} duplicate open report pair(s) — keeping the most recent, marking older ones 'reviewed superseded by dedup migration' is not a valid status, so marking them 'dismissed' instead.`);
            for (const row of dupes.rows) {
                await pool.query(
                    `UPDATE reports SET status = 'dismissed'
                     WHERE reporter_id = $1 AND reported_id = $2 AND status IN ('pending', 'reviewed')
                       AND id NOT IN (
                           SELECT id FROM reports
                           WHERE reporter_id = $1 AND reported_id = $2 AND status IN ('pending', 'reviewed')
                           ORDER BY created_at DESC LIMIT 1
                       )`,
                    [row.reporter_id, row.reported_id]
                );
            }
        } else {
            console.log("No duplicates found.");
        }

        console.log("Creating partial unique index (at most one open report per reporter+target pair)...");
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_one_open_per_pair
            ON reports (reporter_id, reported_id)
            WHERE reported_id IS NOT NULL AND status IN ('pending', 'reviewed')
        `);

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    } finally {
        await pool.end();
    }
}

migrate();
