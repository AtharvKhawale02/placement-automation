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

  // Backlog Information
  activeBacklogs: {
    type: Number,
    default: 0,
  },

  totalBacklogs: {
    type: Number,
    default: 0,
  },

  // Year and Batch
  currentYear: {
    type: Number,
    default: 1,
  },

  batchYear: {
    type: Number,
    default: new Date().getFullYear(),
  },

  // Internship Experience
  internships: [{
    company: String,
    role: String,
    duration: Number, // in months
    description: String,
  }],

  // Resume
  resume: {
    type: String,
    default: "",
  },

  // Placement Status
  placementStatus: {
    type: String,
    enum: ["unplaced", "placed", "dream_placed"],
    default: "unplaced",
  },

  // Offers Received
  offers: [{
    drive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Drive",
    },
    companyName: String,
    package: Number,
    offerType: {
      type: String,
      enum: ["dream", "non-dream"],
    },
    acceptedAt: Date,
  }],

  // Company-specific fields
  companyDetails: {
    companyName: String,
    registrationNumber: String,
    website: String,
    verified: {
      type: Boolean,
      default: false,
    },
  },
});

module.exports = mongoose.model("User", userSchema);