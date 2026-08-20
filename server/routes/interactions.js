const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const interactionsController = require("../controllers/interactionsController");

router.post("/", authMiddleware, interactionsController.createInteraction);

module.exports = router;
