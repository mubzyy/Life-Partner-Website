// Replaces the previous users.role-based admin gating with a fully separate
// admin identity system — admins are NOT customer accounts, have no email,
// no profile, no ties to the `users` table at all. Two completely different
// modules, two completely different credential systems, as intended.
//
// This migration:
//  1. Creates the `admins` table (username + password_hash, nothing else).
//  2. Seeds the one admin account: username "superadmin".
//  3. Drops users.role and its CHECK constraint — no longer used by anything.
//
//   cd server && node migrations/db_migrate_admins_table.js

const { Pool } = require("pg");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local"), override: false });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    try {
        console.log("Creating admins table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                password_changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        `);

        console.log("Seeding the initial admin account (username: superadmin)...");
        const existing = await pool.query("SELECT id FROM admins WHERE username = 'superadmin'");
        if (existing.rows.length === 0) {
            const hashed = await bcrypt.hash("admin@123", 10);
            await pool.query(
                "INSERT INTO admins (username, password) VALUES ('superadmin', $1)",
                [hashed]
            );
            console.log("Created superadmin account.");
        } else {
            console.log("superadmin already exists — left untouched.");
        }

        console.log("Dropping users.role (replaced by the admins table)...");
        await pool.query(`ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check`);
        await pool.query(`ALTER TABLE users DROP COLUMN IF EXISTS role`);

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    } finally {
        await pool.end();
    }
}

migrate();
