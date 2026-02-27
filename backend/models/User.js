const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["student", "admin", "company"],
    default: "student",
  },

  // ✅ REQUIRED because applyToDrive USES THEM
  cgpa: {
    type: Number,
    default: 0,
  },

  skills: {
    type: [String],
    default: [],
  },

  branch: {
    type: String,
    default: "",
  },

  // Academic Details
  tenthPercentage: {
    type: Number,
    default: 0,
  },

  twelfthPercentage: {
    type: Number,
    default: 0,
  },

  diploma: {
    type: String,
    default: "",
  },

  // Resume
  resume: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("User", userSchema);