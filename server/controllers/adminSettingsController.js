const platformSettingsModel = require("../models/platformSettingsModel");

const BOOLEAN_FIELDS = ["maintenance_mode", "registration_open", "auto_approve_verifications", "premium_required_to_message"];

// GET /api/admin/settings/platform
async function getPlatformSettings(req, res) {
    try {
        const settings = await platformSettingsModel.getSettings();
        res.json(settings);
    } catch (err) {
        console.error("Error fetching platform settings:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// PUT /api/admin/settings/platform — every value here is REAL and enforced
// elsewhere in the app (authController, profileController, messagesController,
// verificationController) — not just persisted and displayed.
async function updatePlatformSettings(req, res) {
    try {
        const updates = {};
        const errors = [];

        for (const field of BOOLEAN_FIELDS) {
            if (req.body[field] !== undefined) {
                if (typeof req.body[field] !== "boolean") errors.push(`${field} must be true or false.`);
                else updates[field] = req.body[field];
            }
        }
        if (req.body.min_age !== undefined) {
            const n = Number(req.body.min_age);
            if (!Number.isInteger(n) || n < 18 || n > 99) errors.push("min_age must be an integer between 18 and 99.");
            else updates.min_age = n;
        }
        if (req.body.max_photos !== undefined) {
            const n = Number(req.body.max_photos);
            if (!Number.isInteger(n) || n < 1 || n > 20) errors.push("max_photos must be an integer between 1 and 20.");
            else updates.max_photos = n;
        }

        if (errors.length > 0) return res.status(400).json({ message: "Validation failed.", errors });
        if (Object.keys(updates).length === 0) return res.status(400).json({ message: "No valid settings fields were provided." });

        const settings = await platformSettingsModel.updateSettings(updates, req.admin.id);
        res.json(settings);
    } catch (err) {
        console.error("Error updating platform settings:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { getPlatformSettings, updatePlatformSettings };
