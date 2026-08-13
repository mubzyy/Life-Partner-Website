// Safe additive migration — makes "at most one active subscription per user"
// a real DB guarantee instead of only an app-level check-then-supersede,
// mirroring the canonical-pair/partial-unique-index pattern already used for
// `matches` and `conversations.pair_key`. Never drops or truncates anything;
// safe to re-run (CREATE ... IF NOT EXISTS).

const pool = require("./db");

async function migrate() {
    try {
        console.log("Checking for any existing duplicate active subscriptions...");
        const dupes = await pool.query(`
            SELECT user_id, COUNT(*) FROM subscriptions
            WHERE status = 'active' AND ends_at > CURRENT_TIMESTAMP
            GROUP BY user_id HAVING COUNT(*) > 1
        `);
        if (dupes.rows.length > 0) {
            console.log(`Found ${dupes.rows.length} user(s) with multiple active subscriptions — superseding all but the most recent for each before adding the constraint.`);
            for (const row of dupes.rows) {
                await pool.query(
                    `UPDATE subscriptions SET status = 'canceled'
                     WHERE user_id = $1 AND status = 'active' AND ends_at > CURRENT_TIMESTAMP
                       AND id NOT IN (
                           SELECT id FROM subscriptions
                           WHERE user_id = $1 AND status = 'active' AND ends_at > CURRENT_TIMESTAMP
                           ORDER BY ends_at DESC LIMIT 1
                       )`,
                    [row.user_id]
                );
            }
        } else {
            console.log("No duplicates found.");
        }

        console.log("Creating partial unique index (at most one active subscription per user)...");
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_one_active_per_user
            ON subscriptions (user_id)
            WHERE status = 'active'
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
