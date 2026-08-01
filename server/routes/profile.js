const express = require("express");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { user_id, ...profileData } = req.body;
        
        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const existing = await pool.query("SELECT * FROM user_profiles WHERE user_id = $1", [user_id]);

        if (existing.rows.length > 0) {
            // Update
            const setClauses = [];
            const values = [];
            let i = 1;
            
            for (const [key, value] of Object.entries(profileData)) {
                setClauses.push(`${key} = $${i}`);
                
                if (Array.isArray(value)) {
                    values.push(JSON.stringify(value));
                } else {
                    values.push(value);
                }
                
                i++;
            }
            
            setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

            if (setClauses.length > 1) { // more than just updated_at
                values.push(user_id);
                const query = `UPDATE user_profiles SET ${setClauses.join(", ")} WHERE user_id = $${i}`;
                await pool.query(query, values);
            }
        } else {
            // Insert
            const columns = ["user_id"];
            const placeholders = ["$1"];
            const values = [user_id];
            
            let i = 2;
            for (const [key, value] of Object.entries(profileData)) {
                columns.push(key);
                placeholders.push(`$${i}`);
                
                if (Array.isArray(value)) {
                    values.push(JSON.stringify(value));
                } else {
                    values.push(value);
                }
                
                i++;
            }
            
            const query = `INSERT INTO user_profiles (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`;
            await pool.query(query, values);
        }

        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

router.get("/:userId", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM user_profiles WHERE user_id = $1", [req.params.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
