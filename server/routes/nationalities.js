const express = require("express");
const router = express.Router();
const nationalitiesController = require("../controllers/nationalitiesController");

router.get("/", nationalitiesController.getNationalities);

module.exports = router;
