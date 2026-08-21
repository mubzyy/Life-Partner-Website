// Safe additive migration — real identity-verification workflow for the CRM.
//
// Types are deliberately CNIC / Selfie / Profile Photo only:
//  - "Email" verification already exists for real (users.email_verified,
//    the existing OTP flow) — it is NOT duplicated into this table. The CRM
//    surfaces it by reading that column directly.
//  - "Mobile" verification is NOT included: doing that for real needs an
//    SMS OTP provider, which is a brand-new paid third-party integration
//    (like Core-Gate is for email) that nobody has set up yet. Rather than
//    fake it, it's left out until that's actually wanted.
//
//   cd server && node migrations/db_migrate_verifications.js

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
        console.log("Creating verification_requests table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS verification_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                type VARCHAR(20) NOT NULL CHECK (type IN ('cnic', 'selfie', 'profile_photo')),
                status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                -- Relative path under the PRIVATE (non-public) uploads dir —
                -- never served by the public /uploads static mount, since ID
                -- documents are sensitive PII. NULL for 'profile_photo' type,
                -- which reviews the user's already-uploaded public profile photo.
                document_path TEXT,
                submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP,
                reviewed_by INTEGER REFERENCES users(id),
                review_note TEXT
            )
        `);

        // A user can only have one PENDING request per type at a time — mirrors
        // the reports one-open-per-pair pattern (idx_reports_one_open_per_pair).
        // Past approved/rejected rows are kept as real history, not overwritten.
        console.log("Adding one-pending-per-(user,type) partial unique index...");
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_verification_one_pending_per_type
            ON verification_requests(user_id, type) WHERE status = 'pending'
        `);

        console.log("Indexing status for the admin queue...");
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status)
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
