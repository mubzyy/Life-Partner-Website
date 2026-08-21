const express = require("express");
const router = express.Router();
const adminNotificationsController = require("../../controllers/adminNotificationsController");

router.get("/activity", adminNotificationsController.getActivity);
router.post("/broadcast", adminNotificationsController.broadcast);

module.exports = router;
