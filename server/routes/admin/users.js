const express = require("express");
const router = express.Router();
const adminUsersController = require("../../controllers/adminUsersController");

router.get("/", adminUsersController.getUsers);
router.post("/", adminUsersController.createUser);
router.get("/:id", adminUsersController.getUser);
router.put("/:id", adminUsersController.updateUser);
router.post("/:id/deactivate", adminUsersController.deactivateUser);
router.post("/:id/activate", adminUsersController.activateUser);

module.exports = router;
