const express = require("express");
const router = express.Router();
const adminPaymentsController = require("../../controllers/adminPaymentsController");

router.get("/", adminPaymentsController.getReports);

module.exports = router;
