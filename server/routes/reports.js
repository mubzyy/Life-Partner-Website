const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const reportsController = require("../controllers/reportsController");

router.get("/", authMiddleware, reportsController.getReports);
router.post("/", authMiddleware, reportsController.createReport);

module.exports = router;
