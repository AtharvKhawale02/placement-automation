const express = require("express");
const router = express.Router();

const {
  getAdminStats,
  getAllStudents,
  getAllApplications,
  forwardApplicationsToCompany,
  getAllDrives,
  verifyCompany,
  updateDriveStatus,
  getPlacementAnalytics
} = require("../controllers/adminController");

// Admin Dashboard Stats
router.get("/stats", getAdminStats);

// View All Students
router.get("/students", getAllStudents);

// View All Applications
router.get("/applications", getAllApplications);

// View All Drives
router.get("/drives", getAllDrives);

// Forward Applications to Company
router.post("/forward-applications", forwardApplicationsToCompany);

// Verify Company
router.put("/verify-company/:companyId", verifyCompany);

// Update Drive Status
router.put("/drive-status/:driveId", updateDriveStatus);

// Get Placement Analytics
router.get("/analytics", getPlacementAnalytics);

module.exports = router;
