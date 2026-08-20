const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const accountController = require("../controllers/accountController");

router.post("/deactivate", authMiddleware, accountController.deactivateAccount);

module.exports = router;
