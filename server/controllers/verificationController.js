const fs = require("fs");
const path = require("path");
const verificationModel = require("../models/verificationModel");
const platformSettingsModel = require("../models/platformSettingsModel");
const { VERIFICATIONS_DIR } = require("../middleware/upload");

// GET /api/verifications/me — my own verification request history/status.
async function getMyVerifications(req, res) {
    try {
        const requests = await verificationModel.getMyRequests(req.user.id);
        res.json(requests);
    } catch (err) {
        console.error("Error fetching verification requests:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// POST /api/verifications — submit a new verification request.
// 'cnic' and 'selfie' require an uploaded document; 'profile_photo' reviews
// the user's already-uploaded public profile photo, so no file is needed
// (or accepted) for that type.
async function submitVerification(req, res) {
    try {
        const userId = req.user.id;
        const { type } = req.body;

        if (!verificationModel.TYPES.includes(type)) {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(400).json({ message: `type must be one of: ${verificationModel.TYPES.join(", ")}.` });
        }

        const needsDocument = type === "cnic" || type === "selfie";
        if (needsDocument && !req.file) {
            return res.status(400).json({ message: "A document/photo upload is required for this verification type." });
        }
        if (!needsDocument && req.file) {
            // profile_photo doesn't take an upload — clean up if one was sent anyway.
            fs.unlink(req.file.path, () => {});
        }

        if (await verificationModel.hasPendingOfType(userId, type)) {
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(409).json({ message: "You already have a pending request of this type." });
        }

        const documentPath = needsDocument ? `verifications/${req.file.filename}` : null;
        const settings = await platformSettingsModel.getSettings().catch(() => null);
        const autoApprove = !!settings?.auto_approve_verifications;

        const request = await verificationModel.createRequest({ userId, type, documentPath, autoApprove });
        res.status(201).json({
            message: autoApprove ? "Verification approved automatically." : "Verification request submitted.",
            request,
        });
    } catch (err) {
        if (req.file) fs.unlink(req.file.path, () => {});
        if (err.code === "23505" && err.constraint === "idx_verification_one_pending_per_type") {
            return res.status(409).json({ message: "You already have a pending request of this type." });
        }
        console.error("Error submitting verification:", err);
        res.status(500).json({ message: "Server error." });
    }
}

// GET /api/verifications/:id/document — the OWNER can view their own
// submitted document. (Admin has a separate, adminAuth-gated route for the
// review queue — see adminVerificationController.js.)
async function getMyDocument(req, res) {
    try {
        const requestId = Number(req.params.id);
        const request = await verificationModel.findOwnedRequest(requestId, req.user.id);
        if (!request || !request.document_path) {
            return res.status(404).json({ message: "Document not found." });
        }
        const filePath = path.join(VERIFICATIONS_DIR, path.basename(request.document_path));
        res.sendFile(filePath, (err) => {
            if (err && !res.headersSent) res.status(404).json({ message: "Document not found." });
        });
    } catch (err) {
        console.error("Error fetching verification document:", err);
        res.status(500).json({ message: "Server error." });
    }
}

module.exports = { getMyVerifications, submitVerification, getMyDocument };
