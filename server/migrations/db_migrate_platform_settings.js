// Safe additive migration — real, enforced platform-wide settings for the CRM.
//
// Singleton table: exactly one row, id = 1, seeded with the same defaults
// the app already behaves like today (open registration, no maintenance
// mode, 18+ minimum age — matching the existing signup validation — 10
// photos max, messaging not gated behind premium). Nothing changes behavior
// until an admin actually edits a value.
//
//   cd server && node migrations/db_migrate_platform_settings.js

const { Pool } = require("pg");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local"), override: false });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    try {
        console.log("Creating platform_settings table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS platform_settings (
                id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton row
                maintenance_mode BOOLEAN NOT NULL DEFAULT false,
                registration_open BOOLEAN NOT NULL DEFAULT true,
                auto_approve_verifications BOOLEAN NOT NULL DEFAULT false,
                min_age INTEGER NOT NULL DEFAULT 18,
                max_photos INTEGER NOT NULL DEFAULT 10,
                premium_required_to_message BOOLEAN NOT NULL DEFAULT false,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_by INTEGER REFERENCES users(id)
            )
        `);

        console.log("Seeding the singleton row (no-op if it already exists)...");
        await pool.query(`
            INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING
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
