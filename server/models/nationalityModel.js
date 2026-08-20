const pool = require("../db");

// All nationalities, alphabetical — backs the Nationality dropdown on
// Complete Profile.
async function getAllNationalities() {
    const result = await pool.query(
        `SELECT id, nationality, country_id FROM nationalities ORDER BY nationality ASC`
    );
    return result.rows;
}

module.exports = { getAllNationalities };
