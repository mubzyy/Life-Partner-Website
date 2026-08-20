const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const profileModel = require("../models/profileModel");
const matchModel = require("../models/matchModel");
const { PHOTOS_DIR } = require("../middleware/upload");
const { STEP_IDS } = require("../lib/profileFields");
const { validateStep, validatePartnerCountryIds } = require("../lib/profileValidation");

function httpError(statusCode, message) {
    const err = new Error(message);
    err.statusCode = statusCode;
    return err;
}

// Reads the JWT if one is present, but never rejects the request for having
// none — GET /:userId is public, but knowing who's asking (if anyone) is
// what lets it honor profile_visibility.
function getOptionalViewerId(req) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/profile/me — the authenticated user's own full profile.
// ─────────────────────────────────────────────────────────────────────────
async function getMyProfile(req, res) {
    try {
        const full = await profileModel.loadFullProfile(req.user.id);
        if (!full) return res.status(404).json({ message: "User not found" });
        res.json(full);
    } catch (err) {
        console.error("GET /profile/me error:", err);
        res.status(500).json({ message: "Server Error" });
    }
}

// ─────────────────────────────────────────────────────────────────────────
// PUT /api/profile/me — persists one onboarding step for the authenticated
// user. Body: { step: 1-5, data: {...fields}, complete?: boolean }.
// The user id is ALWAYS taken from the verified JWT (req.user.id) — the
// frontend has no way to write another user's profile.
// ─────────────────────────────────────────────────────────────────────────
async function updateMyProfile(req, res) {
    const userId = req.user.id;
    const step = Number(req.body.step);
    const data = req.body.data && typeof req.body.data === "object" ? req.body.data : {};

    if (!STEP_IDS.includes(step)) {
        return res.status(400).json({ message: "Invalid step.", errors: ["step must be between 1 and 5."] });
    }

    const { errors, cleaned } = validateStep(step, data);

    let partnerCountryIds = null;
    if (step === 5) {
        const pc = validatePartnerCountryIds(data.partner_countries);
        errors.push(...pc.errors);
        partnerCountryIds = pc.ids;
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed.", errors });
    }

    try {
        // Referential integrity checks — never trust that a submitted FK exists.
        if (cleaned.country_id) {
            if (!(await profileModel.countryExists(cleaned.country_id))) {
                throw httpError(400, "Selected country of residence does not exist.");
            }
        }
        if (cleaned.nationality_id) {
            const nationalityName = await profileModel.findNationality(cleaned.nationality_id);
            if (!nationalityName) throw httpError(400, "Selected nationality does not exist.");
            // Keep the legacy free-text `nationality` column in sync for older
            // readers (MyProfilePage/search/matches still display this text
            // column directly).
            cleaned.nationality = nationalityName;
        }
        if (step === 5 && partnerCountryIds.length > 0) {
            if (!(await profileModel.countriesExistById(partnerCountryIds))) {
                throw httpError(400, "One or more preferred countries do not exist.");
            }
        }

        await profileModel.saveStep({
            userId,
            step,
            cleaned,
            partnerCountryIds,
            markComplete: step === 5 && req.body.complete === true,
        });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ message: err.message, errors: [err.message] });
        }
        console.error("PUT /profile/me error:", err);
        return res.status(500).json({ message: "Server Error" });
    }

    try {
        const full = await profileModel.loadFullProfile(userId);
        res.json(full);
    } catch (err) {
        console.error("PUT /profile/me reload error:", err);
        res.status(500).json({ message: "Profile saved, but failed to reload it." });
    }
}

// ─────────────────────────────────────────────────────────────────────────
// POST /api/profile/me/photos — multipart photo upload for the authenticated
// user. The Step-1 avatar picker always uploads as the primary photo.
// ─────────────────────────────────────────────────────────────────────────
async function uploadPhoto(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "No photo file was provided." });
    }

    const userId = req.user.id;
    const relativeUrl = `/uploads/photos/${req.file.filename}`;
    const makePrimary = req.body.primary !== "false"; // defaults to true

    try {
        const photo = await profileModel.savePhoto({ userId, relativeUrl, makePrimary });
        const full = await profileModel.loadFullProfile(userId);
        res.status(201).json({ photo, profile: full });
    } catch (err) {
        fs.unlink(req.file.path, () => {});
        console.error("POST /profile/me/photos error:", err);
        res.status(500).json({ message: "Failed to save the uploaded photo." });
    }
}

// ─────────────────────────────────────────────────────────────────────────
// DELETE /api/profile/me/photos/:photoId
// ─────────────────────────────────────────────────────────────────────────
async function deletePhoto(req, res) {
    const userId = req.user.id;
    const photoId = Number(req.params.photoId);
    if (!Number.isInteger(photoId) || photoId <= 0) {
        return res.status(400).json({ message: "Invalid photo id." });
    }

    try {
        const result = await profileModel.deletePhoto({ userId, photoId });
        if (!result) {
            // Ownership is never assumed — a photo that isn't this user's is reported as not found.
            return res.status(404).json({ message: "Photo not found." });
        }

        // Best-effort disk cleanup — filename is derived with path.basename so
        // a corrupted/legacy photo_url can never escape the photos directory.
        const filePath = path.join(PHOTOS_DIR, path.basename(result.deletedPhoto.photo_url));
        fs.unlink(filePath, () => {});

        const full = await profileModel.loadFullProfile(userId);
        res.json({ message: "Photo deleted.", profile: full });
    } catch (err) {
        console.error("DELETE /profile/me/photos error:", err);
        res.status(500).json({ message: "Failed to delete photo." });
    }
}

// ─────────────────────────────────────────────────────────────────────────
// GET /api/profile/:userId — public read of any user's profile (used when
// browsing other members: Search, Matches, Profile View, Messages headers).
// Read-only, no ownership implied — writes always go through /me.
//
// Honors the profile owner's profile_visibility setting (Settings > Privacy):
//   everyone → anyone can view
//   matches  → only a mutual match (or the owner) can view
//   private  → only the owner can view
// ─────────────────────────────────────────────────────────────────────────
async function getPublicProfile(req, res) {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ message: "Invalid user id." });
    }
    try {
        const viewerId = getOptionalViewerId(req);
        const isOwner = viewerId === userId;

        const { profileVisibility, lastSeenVisibility } = await profileModel.getVisibilitySettings(userId);

        let mutual = null; // computed lazily, reused for both checks below
        const checkMutual = async () => {
            if (mutual === null) mutual = viewerId ? await matchModel.isMatched(viewerId, userId) : false;
            return mutual;
        };

        if (!isOwner) {
            if (viewerId) {
                if (await profileModel.isBlockedEitherWay(viewerId, userId)) {
                    return res.status(403).json({ message: "This profile is not available." });
                }
            }
            if (profileVisibility === "private") {
                return res.status(403).json({ message: "This profile is private." });
            }
            if (profileVisibility === "matches" && !(await checkMutual())) {
                return res.status(403).json({ message: "This profile is only visible to matches." });
            }
        }

        const full = await profileModel.loadFullProfile(userId);
        if (!full) {
            return res.status(404).json({ message: "User not found" });
        }

        // Redact last_login (used for "last active") unless the viewer is
        // allowed to see it — enforced server-side, not just hidden in the UI.
        if (!isOwner) {
            const canSeeLastSeen =
                lastSeenVisibility === "everyone" ||
                (lastSeenVisibility === "matches" && (await checkMutual()));
            if (!canSeeLastSeen) full.last_login = null;
        }

        res.json(full);
    } catch (err) {
        console.error("GET /profile/:userId error:", err);
        res.status(500).json({ message: "Server Error" });
    }
}

module.exports = { getMyProfile, updateMyProfile, uploadPhoto, deletePhoto, getPublicProfile };
