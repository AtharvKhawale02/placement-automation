const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    companyEmail: {
      type: String,
      default: "",
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

    // Backlog Policy
    backlogsAllowed: {
      type: Boolean,
      default: false,
    },

    maxBacklogsAllowed: {
      type: Number,
      default: 0,
    },

    // Year Eligibility
    eligibleYears: {
      type: [Number],
      default: [3, 4], // Default: 3rd and 4th year
    },

    // Weightage Configuration for Ranking
    weightage: {
      cgpa: {
        type: Number,
        default: 40, // 40%
      },
      skills: {
        type: Number,
        default: 35, // 35%
      },
      internships: {
        type: Number,
        default: 15, // 15%
      },
      academics: {
        type: Number,
        default: 10, // 10% (10th & 12th)
      },
    },

    // Drive Status
    status: {
      type: String,
      enum: ["open", "closed", "shortlisting", "completed"],
      default: "open",
    },

    // Dream Offer Classification
    isDreamOffer: {
      type: Boolean,
      default: false, // Dream if package >= threshold (e.g., 10 LPA)
    },

    dreamThreshold: {
      type: Number,
      default: 1000000, // 10 LPA in rupees
    },

    //  IMPORTANT: Ownership
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Drive", driveSchema);