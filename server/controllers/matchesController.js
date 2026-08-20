const matchesModel = require("../models/matchesModel");
const { isOnline } = require("../lib/presence");

// Parses partner_age_range values as actually written by Complete Profile
// (server/lib/profileFields.js ENUMS.partner_age_range): "18 - 25", "40+",
// "No Preference". Returns true/false, or null when it doesn't apply
// (no preference set, or the candidate has no date_of_birth yet).
function ageMatchesPreference(age, prefRange) {
    if (!prefRange || prefRange === "No Preference" || age == null) return null;
    const plusMatch = /^(\d+)\+$/.exec(prefRange);
    if (plusMatch) return age >= parseInt(plusMatch[1], 10);
    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(prefRange);
    if (rangeMatch) return age >= parseInt(rangeMatch[1], 10) && age <= parseInt(rangeMatch[2], 10);
    return null;
}

// partner_education is a tier ("Bachelor's Degree or higher" / "Master's
// Degree or higher" / "Doesn't matter"), not a single value to string-match.
const EDUCATION_TIERS = ["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "Doctorate / PhD", "Islamic Education"];
function educationMeetsPreference(candidateEducation, prefTier) {
    if (!prefTier || !candidateEducation) return null;
    if (prefTier === "Doesn't matter") return true;
    const minIndex = prefTier.startsWith("Master's") ? EDUCATION_TIERS.indexOf("Master's Degree") : EDUCATION_TIERS.indexOf("Bachelor's Degree");
    const candidateIndex = EDUCATION_TIERS.indexOf(candidateEducation);
    if (minIndex === -1 || candidateIndex === -1) return null;
    return candidateIndex >= minIndex;
}

// GET /api/matches
// Discovery/recommendation feed: real candidates the current user hasn't
// interacted with yet, scored by an application compatibility score derived
// only from fields the app actually collects (Complete Profile step 5 +
// user_preferred_countries) — never an objective claim about the person.
async function getMatches(req, res) {
    try {
        const userId = req.user.id;

        const self = await matchesModel.getSelfPreferences(userId);
        const preferredCountryIds = await matchesModel.getPreferredCountryIds(userId);
        const candidates = await matchesModel.getCandidates(userId, self.gender);

        const processedMatches = candidates.map(candidate => {
            let age = null;
            if (candidate.date_of_birth) {
                const dob = new Date(candidate.date_of_birth);
                const diff = Date.now() - dob.getTime();
                age = Math.abs(new Date(diff).getUTCFullYear() - 1970);
            }

            // Deterministic application compatibility score — not an
            // objective claim, just how many of the viewer's own stated
            // partner preferences this candidate happens to satisfy.
            let score = 50;
            const tags = [];

            if (ageMatchesPreference(age, self.partner_age_range) === true) {
                score += 15;
                tags.push("Age");
            }

            if (candidate.marital_status && self.partner_marital_status &&
                (self.partner_marital_status === "Open to all" || self.partner_marital_status === candidate.marital_status)) {
                score += 15;
                tags.push("Marital Status");
            }

            if (educationMeetsPreference(candidate.education, self.partner_education) === true) {
                score += 10;
                tags.push("Education");
            }

            if (preferredCountryIds.size > 0 && candidate.country_id && preferredCountryIds.has(candidate.country_id)) {
                score += 10;
                tags.push("Preferred Location");
            }

            score = Math.min(score, 98);

            const online = isOnline(candidate.last_login, candidate.online_status_enabled);

            return {
                id: candidate.id,
                name: candidate.first_name ? `${candidate.first_name} ${candidate.last_name || ''}`.trim() : "Unknown",
                age: age || "N/A",
                profession: candidate.profession || "Not specified",
                city: candidate.city || "Not specified",
                image: candidate.image || null, // fallback handled on the frontend
                matchScore: score,
                match: `${score}% Match`,
                tags: tags.slice(0, 3),
                online,
                status: online ? "Online" : "Offline",
                new: true,
                isPremium: candidate.is_premium,
            };
        });

        // Real "profile visibility boost" for premium (advertised on the
        // Pricing page): premium candidates surface first, same as the
        // Search boost. The compatibility score itself is left untouched —
        // a paid boost affects ordering, never the honesty of the match
        // percentage shown.
        processedMatches.sort((a, b) => (b.isPremium - a.isPremium) || (b.matchScore - a.matchScore));

        res.json(processedMatches);
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ message: "Server error fetching matches" });
    }
}

module.exports = { getMatches };
