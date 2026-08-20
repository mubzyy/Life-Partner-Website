const favoriteModel = require("../models/favoriteModel");
const { isOnline } = require("../lib/presence");

// GET /api/favorites
async function getFavorites(req, res) {
    try {
        const rows = await favoriteModel.getFavoritesByUser(req.user.id);

        const favorites = rows.map(profile => {
            let age = null;
            if (profile.date_of_birth) {
                const dob = new Date(profile.date_of_birth);
                const diff = Date.now() - dob.getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }

            return {
                id: profile.target_profile_id,
                target_profile_id: profile.target_profile_id,
                name: profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : "Unknown",
                age: age || "N/A",
                gender: profile.gender,
                maritalStatus: profile.marital_status,
                religion: profile.religion,
                sect: profile.sect,
                profession: profile.profession || "Not specified",
                city: profile.city || "Not specified",
                edu: profile.education || "Not specified",
                image: profile.image || null,
                online: isOnline(profile.last_login, profile.online_status_enabled),
            };
        });

        res.json(favorites);
    } catch (err) {
        console.error("Error fetching favorites:", err);
        res.status(500).json({ error: "Server error" });
    }
}

// POST /api/favorites/toggle
async function toggleFavorite(req, res) {
    try {
        const userId = req.user.id;
        const { target_profile_id } = req.body;

        if (!target_profile_id) {
            return res.status(400).json({ message: "target_profile_id is required" });
        }

        const existing = await favoriteModel.findFavorite(userId, target_profile_id);

        if (existing) {
            await favoriteModel.removeFavorite(userId, target_profile_id);
            return res.json({ action: "removed", target_profile_id });
        }

        await favoriteModel.addFavorite(userId, target_profile_id);

        // Notify the target — best-effort, never blocks the toggle itself.
        try {
            const actorName = (await favoriteModel.getFirstName(userId)) || "Someone";
            await favoriteModel.notifyNewFavorite(target_profile_id, actorName);
        } catch (e) {
            console.error("Error creating favorite notification", e);
        }

        return res.json({ action: "added", target_profile_id });
    } catch (err) {
        console.error("Error toggling favorite:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getFavorites, toggleFavorite };
