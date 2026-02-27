const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "",
    },
    requiredSkills: {
      type: [String],
      required: true,
    },
    minCGPA: {
      type: Number,
      required: true,
    },
    eligibleBranches: {
      type: [String],
      default: [],
    },
    minTenthPercentage: {
      type: Number,
      default: 0,
    },
    minTwelfthPercentage: {
      type: Number,
      default: 0,
    },
    diplomaRequired: {
      type: Boolean,
      default: false,
    },
    package: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },

    // 🔥 IMPORTANT: Ownership
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drive", driveSchema);