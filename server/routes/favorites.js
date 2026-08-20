const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const favoritesController = require("../controllers/favoritesController");

router.get("/", authMiddleware, favoritesController.getFavorites);
router.post("/toggle", authMiddleware, favoritesController.toggleFavorite);

module.exports = router;
