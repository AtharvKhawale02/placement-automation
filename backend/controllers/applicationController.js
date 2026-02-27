const Application = require("../models/Application");
const Drive = require("../models/Drive");
const User = require("../models/User");

// Apply to Drive
exports.applyToDrive = async (req, res) => {
  try {
    const { studentId, driveId } = req.body;

    const student = await User.findById(studentId);
    const drive = await Drive.findById(driveId);

    if (!student || !drive) {
      return res.status(404).json({ message: "Student or Drive not found" });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ student: studentId, drive: driveId });
    if (existingApplication) {
      return res.status(400).json({ message: "Already applied to this drive" });
    }

    // 1 Eligibility Checks
    // Check CGPA
    if (student.cgpa < drive.minCGPA) {
      return res.status(400).json({ message: `Not eligible: CGPA ${student.cgpa} is below minimum ${drive.minCGPA}` });
    }

    // Check Branch
    if (drive.eligibleBranches && drive.eligibleBranches.length > 0) {
      if (!drive.eligibleBranches.includes(student.branch)) {
        return res.status(400).json({ message: `Not eligible: Your branch (${student.branch}) is not eligible for this drive` });
      }
    }

    // Check 10th Percentage
    if (drive.minTenthPercentage && student.tenthPercentage < drive.minTenthPercentage) {
      return res.status(400).json({ message: `Not eligible: 10th percentage ${student.tenthPercentage}% is below minimum ${drive.minTenthPercentage}%` });
    }

    // Check 12th Percentage
    if (drive.minTwelfthPercentage && student.twelfthPercentage < drive.minTwelfthPercentage) {
      return res.status(400).json({ message: `Not eligible: 12th percentage ${student.twelfthPercentage}% is below minimum ${drive.minTwelfthPercentage}%` });
    }

    // Check Diploma requirement
    if (drive.diplomaRequired && !student.diploma) {
      return res.status(400).json({ message: "Not eligible: Diploma is required for this drive" });
    }

    // 2 Skill Match Calculation
    const matchedSkills = drive.requiredSkills.filter(skill =>
      student.skills.includes(skill)
    );

    const matchScore =
      (matchedSkills.length / drive.requiredSkills.length) * 100;

    // 3 Save Application
    const application = new Application({
      student: studentId,
      drive: driveId,
      matchScore,
      status: "pending"
    });

    await application.save();

    res.json({
      message: "Application submitted successfully",
      matchScore
    });

  } catch (error) {
    res.status(500).json({ message: "Error applying to drive" });
  }
};

// Get Student Applications
exports.getStudentApplications = async (req, res) => {
  try {
    const { studentId } = req.params;

    const applications = await Application.find({ student: studentId })
      .populate("drive", "companyName minCGPA package deadline requiredSkills")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching student applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Get Company Applications
exports.getCompanyApplications = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Find all drives created by this company
    const drives = await Drive.find({ createdBy: companyId });
    const driveIds = drives.map(d => d._id);

    // Find all applications for these drives
    const applications = await Application.find({ drive: { $in: driveIds } })
      .populate("student", "name email cgpa skills")
      .populate("drive", "companyName minCGPA package deadline")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching company applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Update Application Status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!['pending', 'shortlisted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    ).populate("student", "name email");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      message: "Application status updated",
      application
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Error updating status" });
  }
};