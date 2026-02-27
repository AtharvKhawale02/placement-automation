const Drive = require("../models/Drive");

/**
 * CREATE DRIVE (Company/Admin)
 */
exports.createDrive = async (req, res) => {
  try {
    const {
      companyName,
      requiredSkills,
      minCGPA,
      package: salaryPackage,
      deadline,
    } = req.body;

    const drive = new Drive({
      companyName,
      requiredSkills,
      minCGPA,
      package: salaryPackage,
      deadline,

      // TEMPORARY (until JWT middleware)
      createdBy: req.body.createdBy,
    });

    await drive.save();

    res.status(201).json({
      message: "Drive created successfully",
      drive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating drive" });
  }
};

/**
 * GET ALL DRIVES (Student/Admin)
 */
exports.getAllDrives = async (req, res) => {
  try {
    const drives = await Drive.find().populate("createdBy", "name email role");
    res.json(drives);
  } catch (error) {
    res.status(500).json({ message: "Error fetching drives" });
  }
};

/**
 * GET DRIVES CREATED BY A COMPANY
 */
exports.getCompanyDrives = async (req, res) => {
  try {
    const { companyId } = req.params;

    const drives = await Drive.find({
      createdBy: companyId,
    });

    res.json(drives);
  } catch (error) {
    res.status(500).json({ message: "Error fetching company drives" });
  }
};