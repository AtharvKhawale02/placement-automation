const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    requiredSkills: {
      type: [String],
      required: true,
    },
    minCGPA: {
      type: Number,
      required: true,
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