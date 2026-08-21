const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const searchController = require("../controllers/searchController");

router.post("/", authMiddleware, searchController.search);

module.exports = router;
