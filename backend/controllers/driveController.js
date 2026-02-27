const Drive = require("../models/Drive");

// Create Drive
exports.createDrive = async (req, res) => {
  try {
    const { companyName, requiredSkills, minCGPA, package, deadline } = req.body;

    const drive = new Drive({
      companyName,
      requiredSkills,
      minCGPA,
      package,
      deadline
    });

    await drive.save();

    res.json({ message: "Drive created successfully", drive });
  } catch (error) {
    res.status(500).json({ message: "Error creating drive" });
  }
};

// Get All Drives
exports.getAllDrives = async (req, res) => {
  try {
    const drives = await Drive.find();
    res.json(drives);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drives" });
  }
};