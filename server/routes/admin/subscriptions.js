const express = require("express");
const router = express.Router();
const adminSubscriptionsController = require("../../controllers/adminSubscriptionsController");

router.get("/plans", adminSubscriptionsController.getPlans);
router.post("/plans", adminSubscriptionsController.createPlan);
router.put("/plans/:id", adminSubscriptionsController.updatePlan);
router.get("/", adminSubscriptionsController.getSubscriptions);

module.exports = router;
