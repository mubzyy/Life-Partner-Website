const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM countries ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
