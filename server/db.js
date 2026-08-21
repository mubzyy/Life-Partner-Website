const { Pool } = require("pg");
const path = require("path");
// Load .env.local first (local dev override), then fall back to .env.
// Anchored to this file's own folder (server/), not process.cwd() — so this
// resolves correctly no matter where the caller's working directory is (e.g.
// running a script from server/migrations/, or launching the app as
// `node server/index.js` from the repo root instead of `cd server && node index.js`).
require("dotenv").config({ path: path.join(__dirname, ".env.local"), override: false });
require("dotenv").config({ path: path.join(__dirname, ".env") });


const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = pool;