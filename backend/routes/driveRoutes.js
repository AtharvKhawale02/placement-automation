const express = require("express");
const { createDrive, getAllDrives } = require("../controllers/driveController");

const router = express.Router();

router.post("/create", createDrive);
router.get("/all", getAllDrives);

module.exports = router;