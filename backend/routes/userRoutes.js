const express = require("express");
const router = express.Router();

const {
  updateProfile,
  getProfile
} = require("../controllers/userController");

// Get user profile
router.get("/profile/:userId", getProfile);

// Update user profile
router.put("/profile/:userId", updateProfile);

module.exports = router;
