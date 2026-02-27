const express = require("express");
const router = express.Router();

const {
  getAdminStats,
  getAllStudents,
  getAllApplications
} = require("../controllers/adminController");

// Admin Dashboard Stats
router.get("/stats", getAdminStats);

// View All Students
router.get("/students", getAllStudents);

// View All Applications
router.get("/applications", getAllApplications);

module.exports = router;
