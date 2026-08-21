// Safe additive migration — prevents duplicate accounts by phone number.
//
// Uniqueness is on (phone_code, phone_number) together, not phone_number
// alone: two real people in different countries can legitimately share the
// same local digits (e.g. +92 3001234567 vs +1 3001234567), so only the
// full combination identifies one real phone number.
//
// Postgres treats NULLs as never equal to each other under a UNIQUE
// constraint, so every existing account with no phone on file (NULL/NULL)
// is completely unaffected — this only blocks a second REAL, matching
// (phone_code, phone_number) pair.
//
//   cd server && node migrations/db_migrate_phone_unique.js

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
        console.log("Checking for existing duplicate (phone_code, phone_number) pairs...");
        const dupes = await pool.query(`
            SELECT phone_code, phone_number, COUNT(*) FROM users
            WHERE phone_code IS NOT NULL AND phone_number IS NOT NULL
            GROUP BY phone_code, phone_number HAVING COUNT(*) > 1
        `);
        if (dupes.rows.length > 0) {
            console.log(`Found ${dupes.rows.length} duplicate pair(s) — NOT modifying any of them. Resolve manually before this constraint can be added; migration stopping here.`);
            console.table(dupes.rows);
            return;
        }
        console.log("No duplicates found.");

        console.log("Adding UNIQUE (phone_code, phone_number) constraint...");
        await pool.query(`
            ALTER TABLE users ADD CONSTRAINT users_phone_code_phone_number_key
            UNIQUE (phone_code, phone_number)
        `);

        console.log("Migration complete.");
    } catch (err) {
        if (err.code === "42710") {
            console.log("Constraint already exists — nothing to do.");
            return;
        }
        console.error("Migration failed:", err);
        throw err;
    } finally {
        await pool.end();
    }
}

migrate();
