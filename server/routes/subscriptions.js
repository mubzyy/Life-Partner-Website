const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const subscriptionsController = require("../controllers/subscriptionsController");

router.get("/plans", subscriptionsController.getPlans);
router.get("/me", authMiddleware, subscriptionsController.getMySubscription);
router.post("/cancel", authMiddleware, subscriptionsController.cancelSubscription);
router.post("/", authMiddleware, subscriptionsController.checkout);

module.exports = router;
