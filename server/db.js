const { Pool } = require("pg");
// Load .env.local first (local dev override), then fall back to .env
require("dotenv").config({ path: ".env.local", override: false });
require("dotenv").config();


const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;