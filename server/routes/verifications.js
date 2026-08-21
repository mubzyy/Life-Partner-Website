const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { uploadVerificationDoc } = require("../middleware/upload");
const verificationController = require("../controllers/verificationController");

router.get("/me", authMiddleware, verificationController.getMyVerifications);

// Multer middleware — same error-translation pattern as profile.js's photo
// upload route. 'document' is optional at the multer layer; the controller
// enforces which types actually require one.
router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    uploadVerificationDoc.single("document")(req, res, (err) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File is too large. Maximum size is 5MB." });
      }
      if (err.message === "UNSUPPORTED_FILE_TYPE") {
        return res.status(400).json({ message: "Unsupported file type. Please upload a JPEG, PNG, or WEBP image." });
      }
      console.error("Verification upload error:", err);
      return res.status(400).json({ message: "Upload failed." });
    });
  },
  verificationController.submitVerification
);

router.get("/:id/document", authMiddleware, verificationController.getMyDocument);

module.exports = router;
