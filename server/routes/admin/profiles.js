const express = require("express");
const router = express.Router();
const adminUsersController = require("../../controllers/adminUsersController");

router.get("/", adminUsersController.getProfiles);

module.exports = router;
