const express = require("express");
const multer = require("multer");
const { 
  applyToDrive,
  getStudentApplications,
  getCompanyApplications,
  updateApplicationStatus,
  getDriveApplications,
  getAllApplications,
  uploadExcel,
  sendToCompany
} = require("../controllers/applicationController");

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

router.post("/apply", applyToDrive);
router.get("/student/:studentId", getStudentApplications);
router.get("/company/:companyId", getCompanyApplications);
router.get("/drive/:driveId", getDriveApplications); // Admin/Company view for specific drive
router.get("/all", getAllApplications); // Admin: Get all applications
router.put("/status/:applicationId", updateApplicationStatus);
router.put("/:applicationId/status", updateApplicationStatus); // Alternative route for status update
router.post("/upload", upload.single('file'), uploadExcel); // Admin: Upload Excel file
router.post("/send-to-company", sendToCompany); // Admin: Send data to company

module.exports = router;