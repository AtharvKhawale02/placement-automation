const User = require("../models/User");
const Application = require("../models/Application");
const { canReceiveOffer, recordOffer } = require("../utils/placementEngines");

// Update User Profile (Students can update CGPA, Skills, etc.)
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      cgpa,
      skills,
      branch,
      tenthPercentage,
      twelfthPercentage,
      diploma,
      resume,
      activeBacklogs,
      totalBacklogs,
      currentYear,
      internships,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (skills) updateData.skills = skills;
    if (branch) updateData.branch = branch;
    if (tenthPercentage !== undefined) updateData.tenthPercentage = tenthPercentage;
    if (twelfthPercentage !== undefined) updateData.twelfthPercentage = twelfthPercentage;
    if (diploma) updateData.diploma = diploma;
    if (resume) updateData.resume = resume;
    if (activeBacklogs !== undefined) updateData.activeBacklogs = activeBacklogs;
    if (totalBacklogs !== undefined) updateData.totalBacklogs = totalBacklogs;
    if (currentYear !== undefined) updateData.currentYear = currentYear;
    if (internships) updateData.internships = internships;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select("-password")
      .populate("offers.drive", "companyName package role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// Accept Offer (Student Action)
exports.acceptOffer = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate("student")
      .populate("drive");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "selected") {
      return res.status(400).json({ 
        message: "Can only accept offers for applications with 'selected' status" 
      });
    }

    // Check policy
    const policyCheck = await canReceiveOffer(
      application.student._id,
      application.drive
    );

    if (!policyCheck.canReceive) {
      return res.status(400).json({
        message: "Policy violation",
        reason: policyCheck.reason,
      });
    }

    // Record the offer
    const offerType = application.drive.isDreamOffer ? "dream" : "non-dream";
    await recordOffer(
      application.student._id,
      application.drive._id,
      application.drive.companyName,
      application.drive.package,
      offerType
    );

    // Update application status
    application.status = "offer_accepted";
    await application.save();

    res.json({
      message: "Offer accepted successfully!",
      application,
    });
  } catch (error) {
    console.error("Error accepting offer:", error);
    res.status(500).json({ message: "Error accepting offer" });
  }
};

// Decline Offer (Student Action)
exports.declineOffer = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== "selected") {
      return res.status(400).json({ 
        message: "Can only decline offers for applications with 'selected' status" 
      });
    }

    application.status = "offer_declined";
    await application.save();

    res.json({
      message: "Offer declined",
      application,
    });
  } catch (error) {
    console.error("Error declining offer:", error);
    res.status(500).json({ message: "Error declining offer" });
  }
};

// Get Student Dashboard Summary
exports.getStudentDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await User.findById(userId).select("-password");
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get application stats
    const totalApplications = await Application.countDocuments({ student: userId });
    const eligibleApplications = await Application.countDocuments({
      student: userId,
      eligibilityStatus: "eligible",
    });
    const rejectedApplications = await Application.countDocuments({
      student: userId,
      eligibilityStatus: "rejected",
    });
    const pendingApplications = await Application.countDocuments({
      student: userId,
      status: { $in: ["pending", "under_review", "forwarded"] },
    });
    const shortlistedApplications = await Application.countDocuments({
      student: userId,
      status: "shortlisted",
    });

    res.json({
      student,
      stats: {
        totalApplications,
        eligibleApplications,
        rejectedApplications,
        pendingApplications,
        shortlistedApplications,
        placementStatus: student.placementStatus,
        offersReceived: student.offers ? student.offers.length : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    res.status(500).json({ message: "Error fetching dashboard" });
  }
};
