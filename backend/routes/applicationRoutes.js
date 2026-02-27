const express = require("express");
const { 
  applyToDrive,
  getStudentApplications,
  getCompanyApplications,
  updateApplicationStatus
} = require("../controllers/applicationController");

const router = express.Router();

router.post("/apply", applyToDrive);
router.get("/student/:studentId", getStudentApplications);
router.get("/company/:companyId", getCompanyApplications);
router.put("/status/:applicationId", updateApplicationStatus);

module.exports = router;