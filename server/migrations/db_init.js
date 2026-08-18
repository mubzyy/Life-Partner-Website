const { Pool } = require("pg");
const path = require("path");
// Load .env.local first (local dev), then fall back to .env (production).
// Anchored to server/ (one level up from this migrations/ folder), not
// process.cwd() — resolves correctly no matter where this script is run from.
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local"), override: false });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
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
        console.log("Creating users table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100),
                middle_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                country_id INTEGER REFERENCES countries(id),
                phone_code VARCHAR(10),
                phone_number VARCHAR(20),
                email_verified BOOLEAN DEFAULT false,
                is_active BOOLEAN DEFAULT true,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Creating notifications table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                is_read BOOLEAN DEFAULT false,
                action_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
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

        console.log("Creating nationalities table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS nationalities (
                id SERIAL PRIMARY KEY,
                country_id INTEGER REFERENCES countries(id) ON DELETE CASCADE,
                nationality VARCHAR(100) NOT NULL
            );
        `);

        console.log("Seeding nationalities...");
        const natRes = await pool.query(`SELECT COUNT(*) FROM nationalities`);
        if (parseInt(natRes.rows[0].count) === 0) {
            const nationalityMap = {
                "US": "American", "GB": "British", "CA": "Canadian", "AU": "Australian",
                "AE": "Emirati", "SA": "Saudi", "PK": "Pakistani", "IN": "Indian",
                "BD": "Bangladeshi", "MY": "Malaysian", "ID": "Indonesian", "TR": "Turkish",
                "ZA": "South African", "EG": "Egyptian", "NG": "Nigerian", "FR": "French", "DE": "German"
            };
            const allCountries = await pool.query(`SELECT id, iso_code FROM countries`);
            for (let row of allCountries.rows) {
                const nat = nationalityMap[row.iso_code];
                if (nat) {
                    await pool.query(`INSERT INTO nationalities (country_id, nationality) VALUES ($1, $2)`, [row.id, nat]);
                }
            }
        }

        console.log("Creating favorites table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS favorites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                target_profile_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, target_profile_id)
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
