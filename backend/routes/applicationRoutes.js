const express = require("express");
const { applyToDrive } = require("../controllers/applicationController");

const router = express.Router();

router.post("/apply", applyToDrive);

module.exports = router;