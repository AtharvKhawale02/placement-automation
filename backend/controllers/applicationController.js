const Application = require("../models/Application");
const Drive = require("../models/Drive");
const User = require("../models/User");
const {
  checkEligibility,
  calculateWeightedScore,
  calculateRankings,
} = require("../utils/placementEngines");

// Apply to Drive - WITH AUTOMATIC ELIGIBILITY & RANKING
exports.applyToDrive = async (req, res) => {
  try {
    const { studentId, driveId } = req.body;

    const student = await User.findById(studentId);
    const drive = await Drive.findById(driveId);

    if (!student || !drive) {
      return res.status(404).json({ message: "Student or Drive not found" });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      student: studentId,
      drive: driveId,
    });
    if (existingApplication) {
      return res.status(400).json({ message: "Already applied to this drive" });
    }

    // 🤖 STEP 1: ELIGIBILITY ENGINE (AUTOMATIC)
    const eligibilityResult = checkEligibility(student, drive);

    let application;

    if (!eligibilityResult.eligible) {
      // ❌ AUTO REJECTED
      application = new Application({
        student: studentId,
        drive: driveId,
        eligibilityStatus: "rejected",
        rejectionReason: eligibilityResult.reason,
        status: "rejected",
        scoring: {
          skillMatchPercentage: 0,
          cgpaScore: 0,
          internshipScore: 0,
          academicScore: 0,
          finalWeightedScore: 0,
        },
      });

      await application.save();

      return res.status(400).json({
        message: "Application rejected - Not eligible",
        reason: eligibilityResult.reason,
        application,
      });
    }

    // ✅ ELIGIBLE - Calculate Ranking Score
    const scoringResult = calculateWeightedScore(student, drive);

    application = new Application({
      student: studentId,
      drive: driveId,
      eligibilityStatus: "eligible",
      rejectionReason: eligibilityResult.reason,
      scoring: scoringResult.scoring,
      skillGap: scoringResult.skillGap,
      status: "pending",
    });

    await application.save();

    // 🧠 STEP 2: RECALCULATE RANKINGS FOR THIS DRIVE
    await calculateRankings(driveId);

    // Get updated application with rank
    const updatedApplication = await Application.findById(application._id)
      .populate("drive", "companyName package role")
      .populate("student", "name email");

    res.status(201).json({
      message: "Application submitted successfully!",
      application: updatedApplication,
      scoring: scoringResult.scoring,
      skillGap: scoringResult.skillGap,
    });
  } catch (error) {
    console.error("Error applying to drive:", error);
    res.status(500).json({ message: "Error applying to drive" });
  }
};

// Get Student Applications
exports.getStudentApplications = async (req, res) => {
  try {
    const { studentId } = req.params;

    const applications = await Application.find({ student: studentId })
      .populate("drive", "companyName minCGPA package deadline requiredSkills status")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching student applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Get Company Applications (Only Forwarded/Eligible ones)
exports.getCompanyApplications = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Find all drives created by this company
    const drives = await Drive.find({ createdBy: companyId });
    const driveIds = drives.map((d) => d._id);

    // Find applications that are:
    // 1. For this company's drives
    // 2. Eligible
    // 3. Forwarded by admin (or all eligible ones if no forwarding system)
    const applications = await Application.find({
      drive: { $in: driveIds },
      eligibilityStatus: "eligible",
      // Optionally filter by forwardedToCompany: true
    })
      .populate("student", "name email cgpa skills branch internships resume")
      .populate("drive", "companyName minCGPA package deadline role")
      .sort({ "scoring.finalWeightedScore": -1 }); // Sorted by rank

    res.json(applications);
  } catch (error) {
    console.error("Error fetching company applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Update Application Status (Company Action)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, companyFeedback } = req.body;

    const validStatuses = [
      "under_review",
      "shortlisted",
      "rejected",
      "selected",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = {
      status,
      companyReviewedAt: new Date(),
    };

    if (companyFeedback) {
      updateData.companyFeedback = companyFeedback;
    }

    const application = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    )
      .populate("student", "name email cgpa")
      .populate("drive", "companyName package");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      message: "Application status updated",
      application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Error updating status" });
  }
};

// Get Drive Applications with Rankings (For Admin/Company)
exports.getDriveApplications = async (req, res) => {
  try {
    const { driveId } = req.params;
    const { filterTop, eligibleOnly } = req.query; // Optional filters

    // Build query - show ALL applications by default for admin view
    let query = {
      drive: driveId,
    };

    // Only filter by eligibility if explicitly requested (for company view)
    if (eligibleOnly === 'true') {
      query.eligibilityStatus = "eligible";
    }

    const applications = await Application.find(query)
      .populate("student", "name email cgpa skills branch currentYear internships resume tenthMarks twelfthMarks activeBacklogs")
      .populate("drive", "companyName role package")
      .sort({ appliedAt: -1 }); // Sort by application date

    // Apply top percentage filter if requested
    let filteredApplications = applications;
    if (filterTop) {
      const topPercentage = parseInt(filterTop);
      const topCount = Math.ceil((applications.length * topPercentage) / 100);
      filteredApplications = applications.slice(0, topCount);
    }

    // Return as array for consistency with getAllApplications
    res.json(filteredApplications);
  } catch (error) {
    console.error("Error fetching drive applications:", error);
    res.status(500).json({ message: "Error fetching drive applications" });
  }
};

// Get ALL Applications (Admin)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student", "name email cgpa branch currentYear skills tenthMarks twelfthMarks activeBacklogs internships")
      .populate("drive", "companyName role package")
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Error fetching all applications:", error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// Upload Excel File (Admin) - Bulk import applications
exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const csv = require('csv-parser');
    const xlsx = require('xlsx');
    const fs = require('fs');    const path = require('path');
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }    
    const results = [];
    const errors = [];
    const filePath = req.file.path;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();

    try {
      let jsonData = [];
      
      // Handle Excel files (.xlsx, .xls)
      if (fileExt === 'xlsx' || fileExt === 'xls') {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = xlsx.utils.sheet_to_json(worksheet);
      } 
      // Handle CSV files
      else if (fileExt === 'csv') {
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
              jsonData.push(row);
            })
            .on('end', resolve)
            .on('error', reject);
        });
      } else {
        // Delete file and return error
        fs.unlinkSync(filePath);
        return res.status(400).json({ message: "Invalid file format. Please upload CSV or Excel file." });
      }

      // Process all rows
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        try {
          // Get email with flexible column name matching
          const email = row['Email'] || row['email'] || row['Student Email'] || row['student_email'];
          
          // Get company name with flexible matching
          const companyName = row['Company'] || row['company'] || row['Company Name'] || 
                              row['company_name'] || row['CompanyName'];
          
          if (!email) {
            errors.push({ row: i + 2, error: 'Missing email address' });
            continue;
          }
          
          if (!companyName) {
            errors.push({ row: i + 2, error: 'Missing company name' });
            continue;
          }

          // Find student by email (case-insensitive)
          const student = await User.findOne({ 
            email: email.trim().toLowerCase(),
            role: 'student'
          });
          
          if (!student) {
            errors.push({ 
              row: i + 2, 
              email: email, 
              error: `Student not found with email: ${email}` 
            });
            continue;
          }

          // Find drive by company name (case-insensitive)
          const drive = await Drive.findOne({ 
            companyName: { $regex: new RegExp('^' + companyName.trim() + '$', 'i') }
          });
          
          if (!drive) {
            errors.push({ 
              row: i + 2, 
              email: email,
              error: `Drive not found for company: ${companyName}` 
            });
            continue;
          }

          // Check if application already exists
          const existing = await Application.findOne({
            student: student._id,
            drive: drive._id
          });
          
          if (existing) {
            errors.push({ 
              row: i + 2, 
              email: email,
              company: companyName,
              error: 'Application already exists' 
            });
            continue;
          }

          // Run eligibility check
          const eligibilityResult = checkEligibility(student, drive);
          const scoringResult = calculateWeightedScore(student, drive);

          // Create application with eligibility and scoring
          await Application.create({
            student: student._id,
            drive: drive._id,
            eligibilityStatus: eligibilityResult.eligible ? 'eligible' : 'rejected',
            rejectionReason: eligibilityResult.reason || '',
            status: eligibilityResult.eligible ? 'pending' : 'rejected',
            scoring: scoringResult.scoring,
            skillGap: scoringResult.skillGap,
            appliedAt: row['Applied Date'] || row['applied_date'] ? 
                      new Date(row['Applied Date'] || row['applied_date']) : new Date()
          });
          
          results.push({ 
            email: student.email, 
            name: student.name,
            company: drive.companyName,
            status: eligibilityResult.eligible ? 'eligible' : 'rejected'
          });
        } catch (err) {
          errors.push({ 
            row: i + 2, 
            error: `Error processing row: ${err.message}` 
          });
          console.error('Error processing row:', err);
        }
      }

      // Delete uploaded file after processing
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Return detailed response
      if (results.length === 0 && errors.length === 0) {
        return res.status(400).json({
          message: "No data found in the file. Please ensure the Excel/CSV file contains data.",
          count: 0,
          imported: [],
          errors: []
        });
      }

      if (results.length === 0) {
        return res.status(400).json({
          message: `No applications imported. Found ${errors.length} error(s). Please check the file format and ensure students and drives exist in the database.`,
          count: 0,
          imported: [],
          errors: errors.slice(0, 10), // Show first 10 errors
          hint: "Required columns: 'Email' and 'Company'. Make sure students are registered and drives are created before importing."
        });
      }

      res.json({
        message: `Successfully imported ${results.length} application(s)${errors.length > 0 ? ` with ${errors.length} error(s)` : ''}`,
        count: results.length,
        imported: results,
        errors: errors.length > 0 ? errors.slice(0, 10) : [], // Show first 10 errors
        totalErrors: errors.length
      });
    } catch (parseError) {
      // Clean up file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }
  } catch (error) {
    console.error("Error uploading Excel:", error);
    res.status(500).json({ 
      message: error.message || "Error uploading file",
      error: error.toString()
    });
  }
};

// Send Application Data to Company (Admin)
exports.sendToCompany = async (req, res) => {
  try {
    const { driveId, companyEmail, applications: applicationIds } = req.body;

    if (!driveId) {
      return res.status(400).json({ message: "Drive ID is required" });
    }

    if (!applicationIds || applicationIds.length === 0) {
      return res.status(400).json({ message: "No applications selected" });
    }

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    // Use provided email or drive's email or fallback
    const targetEmail = companyEmail || drive.companyEmail;
    if (!targetEmail || targetEmail.trim() === '') {
      return res.status(400).json({ 
        message: "Company email not set. Please add company email to the drive first.",
        needsEmail: true
      });
    }

    const applications = await Application.find({ _id: { $in: applicationIds } })
      .populate("student", "name email cgpa branch currentYear skills tenthMarks twelfthMarks activeBacklogs internships");

    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }

    // Check if nodemailer is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      // If email not configured, still generate CSV for download
      const headers = ["Name", "Email", "CGPA", "Branch", "Year", "10th", "12th", "Backlogs", "Skills", "Status"];
      const rows = applications.map(app => [
        app.student.name,
        app.student.email,
        app.student.cgpa,
        app.student.branch,
        app.student.currentYear,
        app.student.tenthMarks || "N/A",
        app.student.twelfthMarks || "N/A",
        app.student.activeBacklogs || 0,
        app.student.skills.join("; "),
        app.status
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      return res.json({
        message: `Prepared ${applications.length} applications for ${targetEmail}. Email configuration needed to send automatically.`,
        count: applications.length,
        companyEmail: targetEmail,
        csvData: csvContent,
        note: "Configure EMAIL_USER and EMAIL_PASSWORD in .env to enable automatic email sending"
      });
    }

    // Email is configured - send it
    const nodemailer = require('nodemailer');

    // Generate CSV content
    const headers = ["Name", "Email", "CGPA", "Branch", "Year", "10th", "12th", "Backlogs", "Skills", "Internships", "Status"];
    const rows = applications.map(app => [
      app.student.name,
      app.student.email,
      app.student.cgpa,
      app.student.branch,
      app.student.currentYear,
      app.student.tenthMarks || "N/A",
      app.student.twelfthMarks || "N/A",
      app.student.activeBacklogs || 0,
      app.student.skills.join("; "),
      app.student.internships?.map(i => `${i.company} (${i.duration})`).join("; ") || "None",
      app.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: targetEmail,
      subject: `Student Applications for ${drive.companyName} - ${drive.role || 'Position'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 28px;">Student Applications</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #333;">Dear ${drive.companyName} Team,</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              We are pleased to share <strong style="color: #667eea;">${applications.length} student applications</strong> 
              for the <strong>${drive.role || 'position'}</strong> role.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea; font-size: 20px;">Drive Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Company:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${drive.companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Role:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${drive.role || 'Not specified'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Package:</strong></td>
                  <td style="padding: 8px 0; color: #333;">₹${drive.package} LPA</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Min CGPA:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${drive.minCGPA}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Total Applications:</strong></td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">${applications.length}</td>
                </tr>
              </table>
            </div>

            <div style="background: #e8eaf6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea; font-size: 18px;">📎 Attachment Details</h3>
              <p style="margin: 10px 0; color: #555;">The attached CSV file contains complete student information:</p>
              <ul style="color: #555; line-height: 1.8; margin: 10px 0;">
                <li>Personal details (Name, Email)</li>
                <li>Academic records (CGPA, 10th, 12th marks)</li>
                <li>Technical skills</li>
                <li>Internship experience</li>
                <li>Branch and year details</li>
                <li>Current application status</li>
              </ul>
            </div>

            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⏰ Next Steps:</strong> Please review the applications and share your shortlist with us at your earliest convenience.
              </p>
            </div>

            <p style="margin-top: 30px; font-size: 16px; color: #555;">
              Should you need any additional information or wish to schedule interviews, please don't hesitate to reach out.
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
              <p style="margin: 5px 0; color: #555;">Best regards,</p>
              <p style="margin: 5px 0; color: #667eea; font-weight: bold; font-size: 18px;">Placement Cell</p>
              <p style="margin: 5px 0; color: #999; font-size: 14px;">Student Placement & Career Services</p>
            </div>
          </div>
        </div>
      `,
      attachments: [{
        filename: `applications_${drive.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent,
        contentType: 'text/csv'
      }]
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({
      message: `Successfully sent ${applications.length} applications to ${targetEmail}`,
      count: applications.length,
      companyEmail: targetEmail,
      success: true
    });
  } catch (error) {
    console.error("Error sending to company:", error);
    res.status(500).json({ 
      message: error.message || "Error sending data to company",
      error: error.toString()
    });
  }
};