const accountModel = require("../models/accountModel");

// POST /api/account/deactivate
// Deactivates the authenticated user's account. From this point on,
// authMiddleware rejects this user's tokens and /api/auth/login refuses them.
async function deactivateAccount(req, res) {
    try {
        const account = await accountModel.deactivate(req.user.id);
        if (!account) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json({ message: "Account deactivated.", is_active: account.is_active });
    } catch (err) {
        console.error("Error deactivating account:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { deactivateAccount };
