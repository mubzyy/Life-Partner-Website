const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const countriesData = [
    { name: "United States", iso_code: "US", phone_code: "+1", flag_emoji: "🇺🇸" },
    { name: "United Kingdom", iso_code: "GB", phone_code: "+44", flag_emoji: "🇬🇧" },
    { name: "Canada", iso_code: "CA", phone_code: "+1", flag_emoji: "🇨🇦" },
    { name: "Australia", iso_code: "AU", phone_code: "+61", flag_emoji: "🇦🇺" },
    { name: "United Arab Emirates", iso_code: "AE", phone_code: "+971", flag_emoji: "🇦🇪" },
    { name: "Saudi Arabia", iso_code: "SA", phone_code: "+966", flag_emoji: "🇸🇦" },
    { name: "Pakistan", iso_code: "PK", phone_code: "+92", flag_emoji: "🇵🇰" },
    { name: "India", iso_code: "IN", phone_code: "+91", flag_emoji: "🇮🇳" },
    { name: "Bangladesh", iso_code: "BD", phone_code: "+880", flag_emoji: "🇧🇩" },
    { name: "Malaysia", iso_code: "MY", phone_code: "+60", flag_emoji: "🇲🇾" },
    { name: "Indonesia", iso_code: "ID", phone_code: "+62", flag_emoji: "🇮🇩" },
    { name: "Turkey", iso_code: "TR", phone_code: "+90", flag_emoji: "🇹🇷" },
    { name: "South Africa", iso_code: "ZA", phone_code: "+27", flag_emoji: "🇿🇦" },
    { name: "Egypt", iso_code: "EG", phone_code: "+20", flag_emoji: "🇪🇬" },
    { name: "Nigeria", iso_code: "NG", phone_code: "+234", flag_emoji: "🇳🇬" },
    { name: "France", iso_code: "FR", phone_code: "+33", flag_emoji: "🇫🇷" },
    { name: "Germany", iso_code: "DE", phone_code: "+49", flag_emoji: "🇩🇪" }
];

async function init() {
    try {
        console.log("Creating countries table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS countries (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                iso_code VARCHAR(2) NOT NULL,
                phone_code VARCHAR(10) NOT NULL,
                flag_emoji VARCHAR(10) NOT NULL
            );
        `);

        console.log("Seeding countries...");
        const res = await pool.query(`SELECT COUNT(*) FROM countries`);
        if (parseInt(res.rows[0].count) === 0) {
            for (let c of countriesData) {
                await pool.query(
                    `INSERT INTO countries (name, iso_code, phone_code, flag_emoji) VALUES ($1, $2, $3, $4)`,
                    [c.name, c.iso_code, c.phone_code, c.flag_emoji]
                );
            }
        }

        console.log("Updating users table...");
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS country_id INTEGER REFERENCES countries(id),
            ADD COLUMN IF NOT EXISTS phone_code VARCHAR(10),
            ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
        `);

        await pool.query(`
            ALTER TABLE users DROP COLUMN IF EXISTS country;
        `);

        console.log("Creating user_profiles table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL,
                profile_photo_url VARCHAR(255),
                gender VARCHAR(20),
                date_of_birth DATE,
                marital_status VARCHAR(50),
                height VARCHAR(20),
                weight VARCHAR(20),
                religion VARCHAR(50),
                sect VARCHAR(50),
                mother_tongue VARCHAR(50),
                nationality VARCHAR(50),
                state VARCHAR(100),
                city VARCHAR(100),
                address TEXT,
                occupation VARCHAR(100),
                education VARCHAR(100),
                annual_income VARCHAR(50),
                about_me TEXT,
                
                father_occupation VARCHAR(100),
                mother_occupation VARCHAR(100),
                siblings_count INTEGER,
                family_type VARCHAR(50),
                family_values VARCHAR(50),
                
                smoking VARCHAR(50),
                drinking VARCHAR(50),
                prayer_frequency VARCHAR(50),
                religious_preference VARCHAR(50),
                dietary_preference VARCHAR(50),
                
                partner_age_range VARCHAR(50),
                partner_countries TEXT,
                partner_marital_status VARCHAR(50),
                partner_education VARCHAR(100),
                partner_occupation VARCHAR(100),
                partner_height_range VARCHAR(50),
                partner_about TEXT,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Database initialized successfully!");
    } catch (e) {
        console.error("Error initializing DB:", e);
    } finally {
        pool.end();
    }
}

init();
