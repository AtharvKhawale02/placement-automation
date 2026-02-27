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

    // 1 Eligibility Check
    if (student.cgpa < drive.minCGPA) {
      return res.status(400).json({ message: "Not eligible due to CGPA" });
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
      matchScore
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