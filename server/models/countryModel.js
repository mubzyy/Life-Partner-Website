const pool = require("../db");

// All countries, alphabetical — backs the Country dropdown on Register /
// Complete Profile and the public countries lookup.
async function getAllCountries() {
    const result = await pool.query("SELECT * FROM countries ORDER BY name ASC");
    return result.rows;
}

module.exports = { getAllCountries };
