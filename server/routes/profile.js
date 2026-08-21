const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const profileController = require("../controllers/profileController");

router.get("/me", authMiddleware, profileController.getMyProfile);
router.put("/me", authMiddleware, profileController.updateMyProfile);

// Multer middleware — translates its own errors into clean 4xx responses
// before handing off to the controller. This is request-parsing plumbing,
// not business logic, so it stays here alongside the other route wiring.
router.post(
  "/me/photos",
  authMiddleware,
  (req, res, next) => {
    upload.single("photo")(req, res, (err) => {
      if (!err) return next();
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Photo is too large. Maximum size is 5MB." });
      }
      if (err.message === "UNSUPPORTED_FILE_TYPE") {
        return res.status(400).json({ message: "Unsupported file type. Please upload a JPEG, PNG, or WEBP image." });
      }
      console.error("Photo upload error:", err);
      return res.status(400).json({ message: "Photo upload failed." });
    });
  },
  profileController.uploadPhoto
);

router.delete("/me/photos/:photoId", authMiddleware, profileController.deletePhoto);

router.get("/:userId", profileController.getPublicProfile);

module.exports = router;
