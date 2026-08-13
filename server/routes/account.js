const express = require("express");
const router = express.Router();
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

// POST /api/account/deactivate
// Soft-deactivates the authenticated user's account (users.is_active = false).
// Nothing is deleted — every row this user owns is untouched, so the account
// can be restored by an admin flipping is_active back on. From this point on,
// authMiddleware rejects this user's tokens and /api/auth/login refuses them.
router.post("/deactivate", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, is_active",
            [userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ message: "Account deactivated.", is_active: result.rows[0].is_active });
    } catch (err) {
        console.error("Error deactivating account:", err);
        res.status(500).json({ message: "Server error." });
    }
});

module.exports = router;
