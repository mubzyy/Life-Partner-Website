const express = require("express");
const router = express.Router();
const adminPaymentsController = require("../../controllers/adminPaymentsController");

router.get("/summary", adminPaymentsController.getPaymentSummary);
router.get("/", adminPaymentsController.getPayments);

module.exports = router;
