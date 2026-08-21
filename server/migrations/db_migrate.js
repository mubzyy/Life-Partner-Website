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
    console.log("Starting safe database migration...");
    
    try {
        // 1. user_photos
        console.log("Creating user_photos table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_photos (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                photo_url VARCHAR(255) NOT NULL,
                is_primary BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id)`);

        // 2. user_settings
        console.log("Creating user_settings table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                email_notifications BOOLEAN DEFAULT TRUE,
                push_notifications BOOLEAN DEFAULT TRUE,
                profile_visibility VARCHAR(20) DEFAULT 'everyone' CHECK (profile_visibility IN ('everyone', 'matches', 'private')),
                last_seen_visibility VARCHAR(20) DEFAULT 'matches' CHECK (last_seen_visibility IN ('everyone', 'matches', 'nobody')),
                online_status BOOLEAN DEFAULT TRUE,
                read_receipts BOOLEAN DEFAULT TRUE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. interactions
        console.log("Creating interactions table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS interactions (
                id SERIAL PRIMARY KEY,
                actor_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                target_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'pass')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(actor_id, target_id)
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_interactions_actor_id ON interactions(actor_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_interactions_target_id ON interactions(target_id)`);

        // 4. profile_views
        console.log("Creating profile_views table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS profile_views (
                id SERIAL PRIMARY KEY,
                viewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                viewed_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CHECK (viewer_id != viewed_id)
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id ON profile_views(viewed_id)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_viewed ON profile_views(viewer_id, viewed_id)`);

        // 5. conversations
        console.log("Creating conversations table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                is_group BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC)`);

        // 6. conversation_participants
        console.log("Creating conversation_participants table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS conversation_participants (
                conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (conversation_id, user_id)
            )
        `);

        // 7. messages
        console.log("Creating messages table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                sender_id INT REFERENCES users(id) ON DELETE SET NULL,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL
            )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id_created_at ON messages(conversation_id, created_at DESC)`);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read)`);

        // 8. subscription_plans
        console.log("Creating subscription_plans table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                price_cents INT NOT NULL,
                currency VARCHAR(3) DEFAULT 'USD',
                duration_months INT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE
            )
        `);

        // Seed default plans if not exists
        console.log("Seeding subscription plans...");
        const seedPlans = `
            INSERT INTO subscription_plans (id, name, price_cents, duration_months)
            VALUES 
            ('premium_1mo', '1 Month', 999, 1),
            ('premium_3mo', '3 Months', 2697, 3),
            ('premium_6mo', '6 Months', 4794, 6),
            ('premium_12mo', '12 Months', 7188, 12)
            ON CONFLICT (id) DO NOTHING;
        `;
        await pool.query(seedPlans);

        // 9. subscriptions
        console.log("Creating subscriptions table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
                provider_subscription_id VARCHAR(255),
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'expired')),
                starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ends_at TIMESTAMP NOT NULL
            )
        `);

        // 10. transactions
        console.log("Creating transactions table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                subscription_id INT REFERENCES subscriptions(id) ON DELETE SET NULL,
                amount_cents INT NOT NULL,
                currency VARCHAR(3) DEFAULT 'USD',
                provider VARCHAR(50),
                provider_customer_id VARCHAR(255),
                provider_transaction_id VARCHAR(255),
                idempotency_key VARCHAR(255) UNIQUE,
                status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 11. blocks
        console.log("Creating blocks table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS blocks (
                id SERIAL PRIMARY KEY,
                blocker_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                blocked_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(blocker_id, blocked_id)
            )
        `);

        // 12. reports
        console.log("Creating reports table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id SERIAL PRIMARY KEY,
                reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
                reported_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                reason VARCHAR(255) NOT NULL,
                details TEXT,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ Database migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        await pool.end();
    }
}

migrate();
