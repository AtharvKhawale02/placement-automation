/**
 * 🔥 PLACEMENT AUTOMATION ENGINES
 * 
 * This file contains the core automation logic:
 * 1. Eligibility Engine - Auto reject ineligible students
 * 2. Ranking Engine - Calculate weighted scores
 * 3. Policy Engine - Enforce placement policies
 */

const User = require("../models/User");
const Drive = require("../models/Drive");
const Application = require("../models/Application");

// ============================================
// 1️⃣ ELIGIBILITY ENGINE
// ============================================

/**
 * Check if a student is eligible for a drive
 * Returns: { eligible: boolean, reason: string }
 */
const checkEligibility = (student, drive) => {
  // Check CGPA
  if (student.cgpa < drive.minCGPA) {
    return {
      eligible: false,
      reason: `CGPA ${student.cgpa} is below minimum requirement of ${drive.minCGPA}`,
    };
  }

  // Check Branch
  if (drive.eligibleBranches && drive.eligibleBranches.length > 0) {
    if (!drive.eligibleBranches.includes(student.branch)) {
      return {
        eligible: false,
        reason: `Branch ${student.branch} is not eligible. Eligible branches: ${drive.eligibleBranches.join(", ")}`,
      };
    }
  }

  // Check 10th Percentage
  if (drive.minTenthPercentage && student.tenthPercentage < drive.minTenthPercentage) {
    return {
      eligible: false,
      reason: `10th percentage ${student.tenthPercentage}% is below minimum ${drive.minTenthPercentage}%`,
    };
  }

  // Check 12th Percentage
  if (drive.minTwelfthPercentage && student.twelfthPercentage < drive.minTwelfthPercentage) {
    return {
      eligible: false,
      reason: `12th percentage ${student.twelfthPercentage}% is below minimum ${drive.minTwelfthPercentage}%`,
    };
  }

  // Check Diploma Requirement
  if (drive.diplomaRequired && (!student.diploma || student.diploma === "")) {
    return {
      eligible: false,
      reason: "Diploma certificate is required for this drive",
    };
  }

  // Check Backlog Policy
  if (!drive.backlogsAllowed && student.activeBacklogs > 0) {
    return {
      eligible: false,
      reason: `Active backlogs (${student.activeBacklogs}) not allowed for this drive`,
    };
  }

  if (drive.backlogsAllowed && student.activeBacklogs > drive.maxBacklogsAllowed) {
    return {
      eligible: false,
      reason: `Active backlogs ${student.activeBacklogs} exceed maximum allowed ${drive.maxBacklogsAllowed}`,
    };
  }

  // Check Year Eligibility
  if (drive.eligibleYears && drive.eligibleYears.length > 0) {
    if (!drive.eligibleYears.includes(student.currentYear)) {
      return {
        eligible: false,
        reason: `Current year ${student.currentYear} is not eligible. Eligible years: ${drive.eligibleYears.join(", ")}`,
      };
    }
  }

  // All checks passed
  return {
    eligible: true,
    reason: "All eligibility criteria met",
  };
};

// ============================================
// 2️⃣ RANKING ENGINE
// ============================================

/**
 * Calculate skill match percentage
 */
const calculateSkillMatch = (studentSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) {
    return { percentage: 100, matched: [], missing: requiredSkills };
  }

  const matched = requiredSkills.filter(skill =>
    studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
  );

  const missing = requiredSkills.filter(skill =>
    !studentSkills.some(s => s.toLowerCase() === skill.toLowerCase())
  );

  const percentage = (matched.length / requiredSkills.length) * 100;

  return { percentage, matched, missing };
};

/**
 * Normalize CGPA to 0-100 scale
 * Assumes CGPA is out of 10
 */
const normalizeCGPA = (cgpa) => {
  return (cgpa / 10) * 100;
};

/**
 * Calculate internship score
 * Based on number and duration of internships
 */
const calculateInternshipScore = (internships) => {
  if (!internships || internships.length === 0) {
    return 0;
  }

  // Base score for having internships
  let score = 20;

  // Add points for each internship
  score += internships.length * 15;

  // Add points for duration
  const totalDuration = internships.reduce((sum, int) => sum + (int.duration || 0), 0);
  score += totalDuration * 2;

  // Cap at 100
  return Math.min(score, 100);
};

/**
 * Calculate academic consistency score
 * Based on 10th and 12th percentages
 */
const calculateAcademicScore = (tenthPercentage, twelfthPercentage) => {
  const avgPercentage = (tenthPercentage + twelfthPercentage) / 2;
  return avgPercentage;
};

/**
 * Calculate Final Weighted Score
 * This is the CORE of the ranking system
 */
const calculateWeightedScore = (student, drive) => {
  // Get individual scores
  const skillMatch = calculateSkillMatch(student.skills, drive.requiredSkills);
  const cgpaScore = normalizeCGPA(student.cgpa);
  const internshipScore = calculateInternshipScore(student.internships);
  const academicScore = calculateAcademicScore(student.tenthPercentage, student.twelfthPercentage);

  // Get weightage (default if not set)
  const weightage = drive.weightage || {
    cgpa: 40,
    skills: 35,
    internships: 15,
    academics: 10,
  };

  // Calculate weighted score
  const finalScore =
    (cgpaScore * weightage.cgpa) / 100 +
    (skillMatch.percentage * weightage.skills) / 100 +
    (internshipScore * weightage.internships) / 100 +
    (academicScore * weightage.academics) / 100;

  return {
    scoring: {
      skillMatchPercentage: Math.round(skillMatch.percentage * 100) / 100,
      cgpaScore: Math.round(cgpaScore * 100) / 100,
      internshipScore: Math.round(internshipScore * 100) / 100,
      academicScore: Math.round(academicScore * 100) / 100,
      finalWeightedScore: Math.round(finalScore * 100) / 100,
    },
    skillGap: {
      matchedSkills: skillMatch.matched,
      missingSkills: skillMatch.missing,
    },
  };
};

/**
 * Calculate rank and percentile for all applications of a drive
 */
const calculateRankings = async (driveId) => {
  // Get all eligible applications for this drive, sorted by score
  const applications = await Application.find({
    drive: driveId,
    eligibilityStatus: "eligible",
  })
    .sort({ "scoring.finalWeightedScore": -1 })
    .populate("student");

  // Assign ranks and percentiles
  const totalApplicants = applications.length;

  for (let i = 0; i < applications.length; i++) {
    const rank = i + 1;
    const percentile = ((totalApplicants - rank) / totalApplicants) * 100;

    applications[i].rank = rank;
    applications[i].percentile = Math.round(percentile * 100) / 100;

    await applications[i].save();
  }

  return applications;
};

// ============================================
// 3️⃣ POLICY ENGINE
// ============================================

/**
 * Check if student can receive an offer
 * Based on placement policies
 */
const canReceiveOffer = async (studentId, drive) => {
  const student = await User.findById(studentId);

  // Policy 1: If student has a dream offer, cannot apply to non-dream
  if (student.placementStatus === "dream_placed") {
    return {
      canReceive: false,
      reason: "You already have a dream offer. You cannot apply for more positions.",
    };
  }

  // Policy 2: If student has a non-dream offer and this is also non-dream
  if (student.placementStatus === "placed" && !drive.isDreamOffer) {
    return {
      canReceive: false,
      reason: "You already have an offer. You can only apply for dream offers.",
    };
  }

  // Policy 3: Check maximum offer limit (e.g., 2 offers max)
  const MAX_OFFERS = 2;
  if (student.offers && student.offers.length >= MAX_OFFERS) {
    return {
      canReceive: false,
      reason: `You have reached the maximum limit of ${MAX_OFFERS} offers.`,
    };
  }

  return {
    canReceive: true,
    reason: "Student is eligible to receive offer",
  };
};

/**
 * Record an offer for a student
 */
const recordOffer = async (studentId, driveId, companyName, packageAmount, offerType) => {
  const student = await User.findById(studentId);

  student.offers.push({
    drive: driveId,
    companyName,
    package: packageAmount,
    offerType,
    acceptedAt: new Date(),
  });

  // Update placement status
  if (offerType === "dream") {
    student.placementStatus = "dream_placed";
  } else {
    student.placementStatus = "placed";
  }

  await student.save();

  return student;
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Eligibility Engine
  checkEligibility,

  // Ranking Engine
  calculateSkillMatch,
  calculateWeightedScore,
  calculateRankings,

  // Policy Engine
  canReceiveOffer,
  recordOffer,
};
