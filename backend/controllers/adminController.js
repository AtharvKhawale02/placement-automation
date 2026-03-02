const User = require("../models/User");
const Drive = require("../models/Drive");
const Application = require("../models/Application");

// Get Admin Dashboard Stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalCompanies = await User.countDocuments({ role: "company" });
    const totalDrives = await Drive.countDocuments();
    const activeDrives = await Drive.countDocuments({ status: "open" });
    
    // Count placed students (those with at least one offer)
    const placedStudents = await User.countDocuments({ 
      placementStatus: { $in: ["placed", "dream_placed"] }
    });

    // Count total applications
    const totalApplications = await Application.countDocuments();
    const eligibleApplications = await Application.countDocuments({ 
      eligibilityStatus: "eligible" 
    });
    const rejectedApplications = await Application.countDocuments({ 
      eligibilityStatus: "rejected" 
    });

    res.json({
      totalStudents,
      totalCompanies,
      totalDrives,
      activeDrives,
      placedStudents,
      unplacedStudents: totalStudents - placedStudents,
      totalApplications,
      eligibleApplications,
      rejectedApplications,
      placementPercentage: totalStudents > 0 
        ? Math.round((placedStudents / totalStudents) * 100) 
        : 0,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
};

// Get All Applications (Admin View)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student", "name email cgpa skills branch")
      .populate("drive", "companyName minCGPA package deadline status")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching all applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Forward Applications to Company (Admin Action)
exports.forwardApplicationsToCompany = async (req, res) => {
  try {
    const { driveId, applicationIds } = req.body;

    if (!applicationIds || applicationIds.length === 0) {
      return res.status(400).json({ message: "No applications selected" });
    }

    // Update applications to forwarded status
    const result = await Application.updateMany(
      {
        _id: { $in: applicationIds },
        drive: driveId,
        eligibilityStatus: "eligible",
      },
      {
        $set: {
          forwardedToCompany: true,
          forwardedAt: new Date(),
          status: "forwarded",
        },
      }
    );

    res.json({
      message: `${result.modifiedCount} applications forwarded to company`,
      count: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error forwarding applications:", error);
    res.status(500).json({ message: "Error forwarding applications" });
  }
};

// Get All Drives (Admin View)
exports.getAllDrives = async (req, res) => {
  try {
    const drives = await Drive.find()
      .populate("createdBy", "name email companyDetails")
      .sort({ createdAt: -1 });

    res.json(drives);
  } catch (error) {
    console.error("Error fetching drives:", error);
    res.status(500).json({ message: "Error fetching drives" });
  }
};

// Verify Company (Admin Action)
exports.verifyCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { verified } = req.body;

    const company = await User.findOneAndUpdate(
      { _id: companyId, role: "company" },
      { "companyDetails.verified": verified },
      { new: true }
    ).select("-password");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({
      message: verified ? "Company verified successfully" : "Company unverified",
      company,
    });
  } catch (error) {
    console.error("Error verifying company:", error);
    res.status(500).json({ message: "Error verifying company" });
  }
};

// Update Drive Status (Admin Action)
exports.updateDriveStatus = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { status } = req.body;

    const validStatuses = ["open", "closed", "shortlisting", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const drive = await Drive.findByIdAndUpdate(
      driveId,
      { status },
      { new: true }
    ).populate("createdBy", "name email");

    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    res.json({
      message: `Drive status updated to ${status}`,
      drive,
    });
  } catch (error) {
    console.error("Error updating drive status:", error);
    res.status(500).json({ message: "Error updating drive status" });
  }
};

// Get Placement Analytics
exports.getPlacementAnalytics = async (req, res) => {
  try {
    // Branch-wise placement stats
    const students = await User.find({ role: "student" });
    
    const branchStats = {};
    students.forEach(student => {
      if (!branchStats[student.branch]) {
        branchStats[student.branch] = {
          total: 0,
          placed: 0,
        };
      }
      branchStats[student.branch].total++;
      if (student.placementStatus !== "unplaced") {
        branchStats[student.branch].placed++;
      }
    });

    // Package distribution
    const placedStudents = await User.find({
      role: "student",
      placementStatus: { $in: ["placed", "dream_placed"] },
    }).populate("offers.drive");

    const packageRanges = {
      "0-3 LPA": 0,
      "3-5 LPA": 0,
      "5-7 LPA": 0,
      "7-10 LPA": 0,
      "10+ LPA": 0,
    };

    placedStudents.forEach(student => {
      if (student.offers && student.offers.length > 0) {
        const highestPackage = Math.max(...student.offers.map(o => o.package));
        const lpa = highestPackage / 100000;
        
        if (lpa < 3) packageRanges["0-3 LPA"]++;
        else if (lpa < 5) packageRanges["3-5 LPA"]++;
        else if (lpa < 7) packageRanges["5-7 LPA"]++;
        else if (lpa < 10) packageRanges["7-10 LPA"]++;
        else packageRanges["10+ LPA"]++;
      }
    });

    res.json({
      branchStats,
      packageRanges,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};

