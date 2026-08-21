/**
 * Safe migration for the "Complete Your Profile" flow.
 *
 * Adds the columns/tables the onboarding wizard needs that don't exist yet.
 * Every statement is additive and idempotent (IF NOT EXISTS) — it never
 * drops or truncates anything, and it's safe to re-run.
 *
 *   cd server && node migrations/db_migrate_profile.js
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
    console.log("Starting safe profile-flow migration...");

    try {
        // 1. Country of residence — the "Country of Residence" step-1 field was
        //    captured in React state but never persisted. Give it a real column,
        //    sourced from the existing countries table.
        console.log("Adding user_profiles.country_id...");
        await pool.query(`
            ALTER TABLE user_profiles
            ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id)
        `);

        // 2. Nationality as a proper FK into the existing nationalities table,
        //    in addition to the legacy free-text `nationality` column (kept
        //    so existing rows/readers don't break).
        console.log("Adding user_profiles.nationality_id...");
        await pool.query(`
            ALTER TABLE user_profiles
            ADD COLUMN IF NOT EXISTS nationality_id INTEGER REFERENCES nationalities(id)
        `);

        // 3. Onboarding progress tracking — real source of truth for completion,
        //    replacing any hardcoded percentages on the frontend.
        console.log("Adding user_profiles.onboarding_completed / last_completed_step...");
        await pool.query(`
            ALTER TABLE user_profiles
            ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE
        `);
        await pool.query(`
            ALTER TABLE user_profiles
            ADD COLUMN IF NOT EXISTS last_completed_step INTEGER NOT NULL DEFAULT 0
        `);

        // 4. Preferred (partner) countries — proper many-to-many relation instead
        //    of serializing an array into the partner_countries text column.
        console.log("Creating user_preferred_countries table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_preferred_countries (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, country_id)
            )
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_user_preferred_countries_user
            ON user_preferred_countries(user_id)
        `);

        // 5. Enforce "only one primary photo per user" at the database level.
        console.log("Adding unique index for a single primary photo per user...");
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_user_photos_one_primary
            ON user_photos(user_id)
            WHERE is_primary = true
        `);

        // 6. Helpful indexes for profile/search lookups on the new FK columns.
        console.log("Adding lookup indexes...");
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_profiles_country_id ON user_profiles(country_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_profiles_nationality_id ON user_profiles(nationality_id)`);

        console.log("✅ Profile-flow migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
