// Safe additive migration — adds real "Sign in with Google" support.
// Nullable, unique google_id: NULL for every existing password-based account
// (untouched), populated only for accounts created or linked via Google.
// Never drops or truncates anything; safe to re-run (IF NOT EXISTS everywhere).
//
//   cd server && node migrations/db_migrate_google_auth.js

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
        console.log("Adding users.google_id column...");
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)`);

        console.log("Creating unique index on google_id (NULLs excluded, so every existing row is unaffected)...");
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id_unique
            ON users (google_id)
            WHERE google_id IS NOT NULL
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
