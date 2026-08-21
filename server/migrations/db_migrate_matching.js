/**
 * Safe migration for the real Search + Matching feature.
 * Additive only (IF NOT EXISTS everywhere) — never drops or truncates
 * anything, safe to re-run.
 *
 *   cd server && node migrations/db_migrate_matching.js
 */
const { Pool } = require("pg");
const path = require("path");
// Anchored to server/ (one level up from this migrations/ folder), not
// process.cwd() — resolves correctly no matter where this script is run from.
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local"), override: false });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    console.log("Starting safe matching-feature migration...");

    try {
        // A real, persisted match record — mutual likes were previously only
        // ever *derived* on the fly via a self-join over `interactions`, with
        // no durable record of "these two people are matched". This table is
        // the authoritative one. The pair is stored in a canonical order
        // (user_low_id < user_high_id) so (A,B) and (B,A) can never both
        // exist — the CHECK + UNIQUE constraint together make a duplicate or
        // self-match structurally impossible, not just application-checked.
        console.log("Creating matches table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS matches (
                id SERIAL PRIMARY KEY,
                user_low_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                user_high_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unmatched')),
                matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CHECK (user_low_id < user_high_id),
                UNIQUE (user_low_id, user_high_id)
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_matches_user_low ON matches(user_low_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_matches_user_high ON matches(user_high_id)`);

        // Backfill: any pair that is already mutually liked under the old
        // derived-on-the-fly logic gets a real row now, so nothing already
        // matched before this migration "loses" its match.
        console.log("Backfilling matches from existing mutual likes...");
        const backfilled = await pool.query(`
            INSERT INTO matches (user_low_id, user_high_id)
            SELECT LEAST(i1.actor_id, i1.target_id), GREATEST(i1.actor_id, i1.target_id)
            FROM interactions i1
            JOIN interactions i2 ON i1.actor_id = i2.target_id AND i1.target_id = i2.actor_id
            WHERE i1.action = 'like' AND i2.action = 'like'
            ON CONFLICT (user_low_id, user_high_id) DO NOTHING
            RETURNING id
        `);
        console.log(`Backfilled ${backfilled.rowCount} existing match(es).`);

        // Age-range filtering (Search) reads date_of_birth via a range
        // predicate (EXTRACT(YEAR FROM age(...)) >= / <=) — a real index-
        // friendly access pattern, unlike the low-cardinality enum columns
        // (gender/religion/sect/marital_status) which Postgres's planner
        // will happily sequential-scan at this data volume regardless of
        // whether an index exists, so those are deliberately left alone.
        console.log("Adding user_profiles.date_of_birth index...");
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_profiles_date_of_birth ON user_profiles(date_of_birth)`);

        console.log("✅ Matching-feature migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
