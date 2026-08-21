// Safe additive migration — adds the admin-role column that powers the CRM.
//
// `role` defaults to 'user' for every existing and future row, so this is a
// no-op for behavior until a row is explicitly flipped to 'admin' by hand
// (there is no self-service way to become an admin — see README note below).
//
//   cd server && node migrations/db_migrate_admin_role.js

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
        console.log("Adding users.role column...");
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'
        `);

        console.log("Adding CHECK constraint (role must be 'user' or 'admin')...");
        await pool.query(`
            ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check
        `);
        await pool.query(`
            ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'))
        `);

        console.log("Migration complete. To make an account an admin, run by hand:");
        console.log("  UPDATE users SET role = 'admin' WHERE email = '<the account's email>';");
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    } finally {
        await pool.end();
    }
}

migrate();
