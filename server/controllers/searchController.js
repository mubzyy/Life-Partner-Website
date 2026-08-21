const searchModel = require("../models/searchModel");
const { isOnline } = require("../lib/presence");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// POST /api/search
// Body expects optional filters:
// { query, minAge, maxAge, gender, religion, sect, maritalStatus, city,
//   education, profession, sort, page, limit }
async function search(req, res) {
    try {
        const userId = req.user.id;
        const {
            query: searchText, minAge, maxAge, gender, religion, sect,
            maritalStatus, city, education, profession, sort,
        } = req.body;

        const page = Math.max(1, parseInt(req.body.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.body.limit, 10) || DEFAULT_LIMIT));
        const offset = (page - 1) * limit;

        const filters = { query: searchText, minAge, maxAge, gender, religion, sect, maritalStatus, city, education, profession };

        const total = await searchModel.countResults(userId, filters);
        const rows = await searchModel.searchProfiles(userId, filters, sort, limit, offset);

        const profiles = rows.map(profile => {
            let age = null;
            if (profile.date_of_birth) {
                const dob = new Date(profile.date_of_birth);
                const diff = Date.now() - dob.getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }

            return {
                id: profile.id,
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
                isPremium: profile.is_premium,
            };
        });

        res.json({
            results: profiles,
            total,
            page,
            limit,
            hasNextPage: offset + profiles.length < total,
        });
    } catch (error) {
        console.error("Error fetching search results:", error);
        res.status(500).json({ message: "Server error fetching search results" });
    }
}

module.exports = { search };
