const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const matchesController = require("../controllers/matchesController");

router.get("/", authMiddleware, matchesController.getMatches);

module.exports = router;
