/**
 * Safe migration for the full-application functionality audit remediation.
 * Every statement is additive and idempotent (IF NOT EXISTS) — it never
 * drops or truncates anything, and it's safe to re-run.
 *
 *   cd server && node migrations/db_migrate_audit.js
 */
const { Pool } = require("pg");
const path = require("path");
// Anchored to server/ (one level up from this migrations/ folder), not
// process.cwd() — resolves correctly no matter where this script is run from.
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local"), override: false });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function migrate() {
    console.log("Starting safe audit-remediation migration...");

    try {
        // Phase 4 — blocks.js already intended to store an optional reason;
        // the column just never existed.
        console.log("Adding blocks.reason...");
        await pool.query(`ALTER TABLE blocks ADD COLUMN IF NOT EXISTS reason VARCHAR(255)`);

        // Phase 5 — subscription_plans becomes the single source of truth for
        // plan IDs/pricing (previously duplicated, inconsistently, across this
        // table, subscriptions.js, PricingPage.jsx and CheckoutPage.jsx).
        // The old 4 USD-priced rows are deactivated (not dropped — safe even
        // though nothing currently references them; verified 0 existing
        // subscriptions/transactions before writing this).
        console.log("Deactivating legacy subscription_plans rows...");
        await pool.query(`UPDATE subscription_plans SET is_active = false WHERE id IN ('premium_1mo','premium_3mo','premium_6mo','premium_12mo')`);

        console.log("Seeding canonical PKR subscription plans (4 tiers × 4 durations)...");
        const TIERS = [
            { id: "basic", name: "Basic", basePrice: 999 },
            { id: "premium", name: "Premium", basePrice: 1999 },
            { id: "premium-plus", name: "Premium Plus", basePrice: 3499 },
            { id: "ultimate", name: "Ultimate", basePrice: 5999 },
        ];
        const DURATIONS = [
            { months: 1, discount: 0 },
            { months: 3, discount: 10 },
            { months: 6, discount: 20 },
            { months: 12, discount: 30 },
        ];
        for (const tier of TIERS) {
            for (const dur of DURATIONS) {
                const monthlyPrice = Math.round(tier.basePrice * (1 - dur.discount / 100));
                const totalPrice = monthlyPrice * dur.months; // whole PKR, not paisa — see price_cents note below
                const planId = `${tier.id}-${dur.months}mo`;
                const planName = `${tier.name} — ${dur.months} Month${dur.months > 1 ? "s" : ""}`;
                await pool.query(
                    `INSERT INTO subscription_plans (id, name, price_cents, currency, duration_months, is_active)
                     VALUES ($1, $2, $3, 'PKR', $4, true)
                     ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name, price_cents = EXCLUDED.price_cents,
                        currency = EXCLUDED.currency, duration_months = EXCLUDED.duration_months, is_active = true`,
                    [planId, planName, totalPrice, dur.months]
                );
            }
        }

        // Phase 7 — the Help & Support "Contact Support" form has no specific
        // target user (unlike reporting a user from their profile), so the
        // existing reports table's reported_id needs to become optional
        // rather than creating a whole new table for what's structurally
        // the same record (reporter, reason, details, status).
        console.log("Relaxing reports.reported_id to nullable...");
        await pool.query(`ALTER TABLE reports ALTER COLUMN reported_id DROP NOT NULL`);

        // Phase 9 — lets a password change/reset invalidate previously-issued
        // JWTs without needing a separate token-blacklist table: the JWT
        // embeds the password_changed_at value at login time, and
        // middleware/auth.js rejects any token whose embedded value doesn't
        // match the current one.
        console.log("Adding users.password_changed_at...");
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP`);

        // Phase 10 — archive/mute/delete/mark-unread are per-user-per-conversation
        // states (the two participants can each archive or mute independently),
        // so they belong on conversation_participants, which already models
        // exactly that relationship.
        console.log("Adding conversation_participants archive/mute/delete/unread columns...");
        await pool.query(`ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE`);
        await pool.query(`ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS muted BOOLEAN NOT NULL DEFAULT FALSE`);
        await pool.query(`ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL`);
        await pool.query(`ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS manually_unread BOOLEAN NOT NULL DEFAULT FALSE`);

        console.log("✅ Audit-remediation migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

migrate();
