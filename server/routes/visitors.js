const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const visitorsController = require("../controllers/visitorsController");

router.get("/", authMiddleware, visitorsController.getVisitors);
router.post("/", authMiddleware, visitorsController.recordVisit);
router.get("/stats", authMiddleware, visitorsController.getVisitorStats);

module.exports = router;
