const User = require("../models/User");

// Update User Profile (Students can update CGPA, Skills, etc.)
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, cgpa, skills, branch, tenthPercentage, twelfthPercentage, diploma, resume } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (skills) updateData.skills = skills;
    if (branch) updateData.branch = branch;
    if (tenthPercentage !== undefined) updateData.tenthPercentage = tenthPercentage;
    if (twelfthPercentage !== undefined) updateData.twelfthPercentage = twelfthPercentage;
    if (diploma) updateData.diploma = diploma;
    if (resume) updateData.resume = resume;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user
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

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};
