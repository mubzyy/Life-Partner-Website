const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all nationalities
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`SELECT id, nationality, country_id FROM nationalities ORDER BY nationality ASC`);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching nationalities:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
