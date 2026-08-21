const nationalityModel = require("../models/nationalityModel");

// GET /api/nationalities
async function getNationalities(req, res) {
    try {
        const nationalities = await nationalityModel.getAllNationalities();
        res.json(nationalities);
    } catch (err) {
        console.error("Error fetching nationalities:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getNationalities };
