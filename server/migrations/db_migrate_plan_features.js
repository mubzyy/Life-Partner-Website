// Safe additive migration — lets the CRM's "Add Subscription Plan" actually
// store real feature bullet points against a plan, instead of the field
// being accepted and silently discarded.
//
//   cd server && node migrations/db_migrate_plan_features.js

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
        console.log("Adding subscription_plans.features column...");
        await pool.query(`
            ALTER TABLE subscription_plans
            ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT NULL
        `);
        console.log("Migration complete. NULL for every existing plan — PricingPage.jsx keeps using its own built-in feature list for those until a real value is set here.");
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    } finally {
        await pool.end();
    }
}

migrate();
