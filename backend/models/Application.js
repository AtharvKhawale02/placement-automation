const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Drive",
    required: true,
  },

  // Eligibility Status
  eligibilityStatus: {
    type: String,
    enum: ["eligible", "rejected"],
    default: "eligible",
  },

  rejectionReason: {
    type: String,
    default: "",
  },

  // Scoring Breakdown
  scoring: {
    skillMatchPercentage: {
      type: Number,
      default: 0,
    },
    cgpaScore: {
      type: Number,
      default: 0,
    },
    internshipScore: {
      type: Number,
      default: 0,
    },
    academicScore: {
      type: Number,
      default: 0,
    },
    finalWeightedScore: {
      type: Number,
      default: 0,
    },
  },

  // Ranking Information
  rank: {
    type: Number,
    default: 0,
  },

  percentile: {
    type: Number,
    default: 0,
  },

  // Application Status Flow
  status: {
    type: String,
    enum: [
      "pending",           // Initial application
      "under_review",      // Admin reviewing
      "forwarded",         // Forwarded to company
      "shortlisted",       // Company shortlisted
      "rejected",          // Company rejected
      "selected",          // Final selection
      "offer_accepted",    // Student accepted
      "offer_declined",    // Student declined
    ],
    default: "pending",
  },

  // Admin Actions
  forwardedToCompany: {
    type: Boolean,
    default: false,
  },

  forwardedAt: {
    type: Date,
  },

  adminNotes: {
    type: String,
    default: "",
  },

  // Company Feedback
  companyFeedback: {
    type: String,
    default: "",
  },

  companyReviewedAt: {
    type: Date,
  },

  // Skill Gap Analysis
  skillGap: {
    matchedSkills: [String],
    missingSkills: [String],
  },

}, {
  timestamps: true,
});

// Index for faster queries
applicationSchema.index({ student: 1, drive: 1 }, { unique: true });
applicationSchema.index({ drive: 1, "scoring.finalWeightedScore": -1 });
applicationSchema.index({ eligibilityStatus: 1 });

module.exports = mongoose.model("Application", applicationSchema);