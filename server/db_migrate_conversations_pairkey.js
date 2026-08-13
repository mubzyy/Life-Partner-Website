// Safe additive migration — hardens 1:1 conversation dedup from an app-level
// check-then-insert race into a real DB-level guarantee, mirroring the
// canonical low/high pair pattern already used by the `matches` table.
//
// Adds conversations.pair_key ("<lowUserId>_<highUserId>"), backfills it for
// every existing 1:1 conversation from conversation_participants, then adds a
// partial UNIQUE index so two concurrent "start conversation" requests for
// the same pair can no longer both succeed. Never drops or truncates
// anything; safe to re-run (all steps are IF NOT EXISTS / idempotent).

const pool = require("./db");

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        console.log("Adding conversations.pair_key column (if missing)...");
        await client.query(`
            ALTER TABLE conversations ADD COLUMN IF NOT EXISTS pair_key VARCHAR(64)
        `);

        console.log("Backfilling pair_key for existing 1:1 conversations...");
        // MIN/MAX of the exactly-2 participant ids gives the same canonical
        // "<low>_<high>" key regardless of which participant row is read.
        const backfill = await client.query(`
            UPDATE conversations c
            SET pair_key = sub.pair_key
            FROM (
                SELECT conversation_id, MIN(user_id) || '_' || MAX(user_id) AS pair_key
                FROM conversation_participants
                GROUP BY conversation_id
                HAVING COUNT(*) = 2
            ) sub
            WHERE c.id = sub.conversation_id
              AND c.is_group = false
              AND c.pair_key IS NULL
            RETURNING c.id
        `);
        console.log(`Backfilled pair_key on ${backfill.rowCount} conversation(s).`);

        console.log("Creating partial unique index on pair_key (1:1 conversations only)...");
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_pair_key_unique
            ON conversations (pair_key)
            WHERE is_group = false AND pair_key IS NOT NULL
        `);

        await client.query("COMMIT");
        console.log("Migration complete.");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Migration failed, rolled back:", err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
