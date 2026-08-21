const express = require("express");
const router = express.Router();
const adminVerificationController = require("../../controllers/adminVerificationController");

router.get("/", adminVerificationController.getVerifications);
router.get("/:id/document", adminVerificationController.getDocument);
router.patch("/:id", adminVerificationController.reviewVerification);

module.exports = router;
