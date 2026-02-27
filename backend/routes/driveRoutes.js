const express = require("express");
const router = express.Router();

const {
  createDrive,
  getAllDrives,
  getCompanyDrives,
} = require("../controllers/driveController");

// Create drive (Admin / Company)
router.post("/create", createDrive);

// All drives (Student)
router.get("/all", getAllDrives);

// Company-specific drives
router.get("/company/:companyId", getCompanyDrives);

module.exports = router;