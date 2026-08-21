// Fixes a real bug introduced by the previous role-based-admin design:
// verification_requests.reviewed_by and platform_settings.updated_by were
// both defined as FOREIGN KEY REFERENCES users(id) — but now that admins
// live in a completely separate `admins` table, an admin's id (e.g. 1)
// could silently collide with an unrelated real customer's id (e.g. 1 is
// muhammad@test.com). Repointing both FKs at admins(id) instead, where they
// actually belong.
//
//   cd server && node migrations/db_migrate_admin_fk_fix.js

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
        console.log("Clearing any existing reviewed_by/updated_by values (they pointed at the wrong table)...");
        await pool.query(`UPDATE verification_requests SET reviewed_by = NULL WHERE reviewed_by IS NOT NULL`);
        await pool.query(`UPDATE platform_settings SET updated_by = NULL WHERE updated_by IS NOT NULL`);

        console.log("Repointing verification_requests.reviewed_by -> admins(id)...");
        await pool.query(`ALTER TABLE verification_requests DROP CONSTRAINT IF EXISTS verification_requests_reviewed_by_fkey`);
        await pool.query(`ALTER TABLE verification_requests ADD CONSTRAINT verification_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES admins(id)`);

        console.log("Repointing platform_settings.updated_by -> admins(id)...");
        await pool.query(`ALTER TABLE platform_settings DROP CONSTRAINT IF EXISTS platform_settings_updated_by_fkey`);
        await pool.query(`ALTER TABLE platform_settings ADD CONSTRAINT platform_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES admins(id)`);

        console.log("Migration complete.");
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    } finally {
        await pool.end();
    }
}

migrate();
