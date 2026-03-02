const Drive = require("../models/Drive");

/**
 * CREATE DRIVE (Company/Admin)
 * Now supports full configuration including weightage
 */
exports.createDrive = async (req, res) => {
  try {
    const {
      companyName,
      jobDescription,
      role,
      requiredSkills,
      minCGPA,
      package: salaryPackage,
      deadline,
      eligibleBranches,
      minTenthPercentage,
      minTwelfthPercentage,
      diplomaRequired,
      backlogsAllowed,
      maxBacklogsAllowed,
      eligibleYears,
      weightage,
      isDreamOffer,
      createdBy,
    } = req.body;

    // Auto-determine dream offer if not specified
    const dreamThreshold = 1000000; // 10 LPA
    const isDream = isDreamOffer !== undefined 
      ? isDreamOffer 
      : salaryPackage >= dreamThreshold;

    const drive = new Drive({
      companyName,
      jobDescription,
      role,
      requiredSkills,
      minCGPA,
      package: salaryPackage,
      deadline,
      eligibleBranches: eligibleBranches || [],
      minTenthPercentage: minTenthPercentage || 0,
      minTwelfthPercentage: minTwelfthPercentage || 0,
      diplomaRequired: diplomaRequired || false,
      backlogsAllowed: backlogsAllowed || false,
      maxBacklogsAllowed: maxBacklogsAllowed || 0,
      eligibleYears: eligibleYears || [3, 4],
      weightage: weightage || {
        cgpa: 40,
        skills: 35,
        internships: 15,
        academics: 10,
      },
      isDreamOffer: isDream,
      dreamThreshold,
      status: "open",
      createdBy: createdBy,
    });

    await drive.save();

    res.status(201).json({
      message: "Drive created successfully",
      drive,
    });
  } catch (error) {
    console.error("Drive creation error:", error);
    res.status(500).json({ message: "Error creating drive" });
  }
};

/**
 * GET ALL DRIVES (Student/Admin)
 */
exports.getAllDrives = async (req, res) => {
  try {
    const { status } = req.query;
    const Application = require("../models/Application");

    let query = {};
    if (status) {
      query.status = status;
    }

    const drives = await Drive.find(query)
      .populate("createdBy", "name email role companyDetails")
      .sort({ createdAt: -1 });

    // Get application counts for each drive
    const drivesWithCounts = await Promise.all(
      drives.map(async (drive) => {
        const totalApplications = await Application.countDocuments({ drive: drive._id });
        const eligibleApplications = await Application.countDocuments({ 
          drive: drive._id, 
          eligibilityStatus: "eligible" 
        });
        
        return {
          ...drive.toObject(),
          applicationCount: totalApplications,
          eligibleCount: eligibleApplications,
        };
      })
    );

    res.json(drivesWithCounts);
  } catch (error) {
    console.error("Error fetching drives:", error);
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
    }).sort({ createdAt: -1 });

    res.json(drives);
  } catch (error) {
    console.error("Error fetching company drives:", error);
    res.status(500).json({ message: "Error fetching company drives" });
  }
};

/**
 * GET SINGLE DRIVE BY ID
 */
exports.getDriveById = async (req, res) => {
  try {
    const { driveId } = req.params;

    const drive = await Drive.findById(driveId)
      .populate("createdBy", "name email companyDetails");

    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    res.json(drive);
  } catch (error) {
    console.error("Error fetching drive:", error);
    res.status(500).json({ message: "Error fetching drive" });
  }
};

/**
 * UPDATE DRIVE (Company)
 */
exports.updateDrive = async (req, res) => {
  try {
    const { driveId } = req.params;
    const updateData = req.body;

    // Don't allow changing createdBy
    delete updateData.createdBy;

    const drive = await Drive.findByIdAndUpdate(
      driveId,
      updateData,
      { new: true }
    ).populate("createdBy", "name email");

    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    res.json({
      message: "Drive updated successfully",
      drive,
    });
  } catch (error) {
    console.error("Error updating drive:", error);
    res.status(500).json({ message: "Error updating drive" });
  }
};

/**
 * DELETE DRIVE (Company/Admin)
 */
exports.deleteDrive = async (req, res) => {
  try {
    const { driveId } = req.params;

    const drive = await Drive.findByIdAndDelete(driveId);

    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    res.json({
      message: "Drive deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting drive:", error);
    res.status(500).json({ message: "Error deleting drive" });
  }
};