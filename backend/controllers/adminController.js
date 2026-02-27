const User = require("../models/User");
const Drive = require("../models/Drive");
const Application = require("../models/Application");

// Get Admin Dashboard Stats
exports.getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalDrives = await Drive.countDocuments();
    
    // Count placed students (those with at least one shortlisted application)
    const placedStudents = await Application.distinct("student", { 
      status: "shortlisted" 
    });

    res.json({
      totalStudents,
      totalDrives,
      placedStudents: placedStudents.length
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
      .populate("student", "name email cgpa skills")
      .populate("drive", "companyName minCGPA package deadline")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching all applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};
