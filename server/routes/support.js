const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const supportController = require("../controllers/supportController");

router.get("/", authMiddleware, supportController.getTickets);
router.post("/", authMiddleware, supportController.createTicket);
router.patch("/:id", authMiddleware, supportController.updateTicket);

module.exports = router;
