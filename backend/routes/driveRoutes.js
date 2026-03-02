const express = require("express");
const router = express.Router();

const {
  createDrive,
  getAllDrives,
  getCompanyDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
} = require("../controllers/driveController");

// Create drive (Admin / Company)
router.post("/create", createDrive);

// All drives (Student)
router.get("/all", getAllDrives);

// Company-specific drives
router.get("/company/:companyId", getCompanyDrives);

// Get single drive by ID
router.get("/:driveId", getDriveById);

// Update drive
router.put("/:driveId", updateDrive);

// Delete drive
router.delete("/:driveId", deleteDrive);

module.exports = router;