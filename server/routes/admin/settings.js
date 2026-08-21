const express = require("express");
const router = express.Router();
const adminSettingsController = require("../../controllers/adminSettingsController");

router.get("/platform", adminSettingsController.getPlatformSettings);
router.put("/platform", adminSettingsController.updatePlatformSettings);

module.exports = router;
