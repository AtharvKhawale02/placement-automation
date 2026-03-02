const express = require("express");
const router = express.Router();

const {
  updateProfile,
  getProfile,
  acceptOffer,
  declineOffer,
  getStudentDashboard,
} = require("../controllers/userController");

// Get user profile
router.get("/profile/:userId", getProfile);

// Update user profile
router.put("/profile/:userId", updateProfile);

// Get student dashboard
router.get("/dashboard/:userId", getStudentDashboard);

// Accept offer
router.post("/accept-offer/:applicationId", acceptOffer);

// Decline offer
router.post("/decline-offer/:applicationId", declineOffer);

module.exports = router;
