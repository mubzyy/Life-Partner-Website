const countryModel = require("../models/countryModel");

// GET /api/countries
async function getCountries(req, res) {
    try {
        const countries = await countryModel.getAllCountries();
        res.json(countries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = { getCountries };
