const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const blocksController = require("../controllers/blocksController");

router.get("/", authMiddleware, blocksController.getBlocks);
router.post("/", authMiddleware, blocksController.createBlock);
router.delete("/:blockedId", authMiddleware, blocksController.deleteBlock);

module.exports = router;
