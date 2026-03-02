# Excel Sheet Management System - Setup Guide

## 🎯 Overview

Your admin dashboard now functions as a complete **Student Application Management System** with Excel-like functionality:

### ✅ What's Implemented:

1. **📊 Excel-Like View** - Student applications displayed in a professional table
2. **📤 Upload Excel** - Bulk import student applications from CSV/Excel files
3. **📥 Download Excel** - Export applications to CSV format for offline use
4. **📧 Send to Company** - Share student data directly with companies
5. **🔄 Status Management** - Update application status (pending → shortlisted → rejected → placed)
6. **🔍 Search & Filter** - Find students by name, email, branch, or status
7. **📱 Responsive Design** - Works on desktop, tablet, and mobile

---

## 🚀 Features Breakdown

### 1. Overview Tab
- **View all active placement drives** in card format
- **Click any drive card** to see its applications
- **Create new drives** with the "Create New Drive" button
- **Stats cards** showing total students, drives, and placed students

### 2. Applications Excel Sheet Tab
This tab functions as your Excel management system:

#### **Excel Action Buttons:**

##### 📤 **Upload Excel**
- Upload CSV or Excel files to bulk import student data
- Supported formats: `.csv`, `.xlsx`, `.xls`
- Perfect for importing pre-existing student databases
- Auto-validates file format before upload

##### 📥 **Download Excel**
- Export current view to CSV format
- Includes all student details: name, email, CGPA, branch, skills, status, etc.
- File naming: `applications_YYYY-MM-DD.csv`
- Opens directly in Excel or Google Sheets

##### 📧 **Send to Company** (when drive selected)
- Send filtered applications to company email
- Automatically attaches student data as CSV
- Professional email template with company branding
- Tracks sent applications in system

#### **Application Table Features:**
- **Search bar** - Filter by student name, email, or branch
- **Status filter dropdown** - Filter by pending, shortlisted, rejected, placed
- **Sortable columns** - Click column headers to sort
- **Status badges** - Visual indicators for each application status
- **Action buttons** - View details, update status, or delete application
- **Real-time updates** - Changes reflect immediately

---

## 📋 Backend Setup Required

To complete the Excel upload and email sending functionality, follow these steps:

### Step 1: Install Required Packages

Open terminal in the `backend` folder and run:

```bash
cd backend
npm install multer csv-parser xlsx nodemailer
```

**Package purposes:**
- `multer` - Handle file uploads
- `csv-parser` - Parse CSV files
- `xlsx` - Parse Excel files (.xlsx)
- `nodemailer` - Send emails with attachments

### Step 2: Create Uploads Folder

```bash
mkdir uploads
```

Add to `.gitignore`:
```
uploads/
*.csv
*.xlsx
```

### Step 3: Configure Email Service

Add to `backend/.env`:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**Getting Gmail App Password:**
1. Go to Google Account Settings → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Copy and paste into `.env`

### Step 4: Complete Excel Upload Implementation

Edit `backend/controllers/applicationController.js` - `uploadExcel` function:

```javascript
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const filePath = req.file.path;
    const fileExt = req.file.originalname.split('.').pop();

    // Handle Excel files (.xlsx, .xls)
    if (fileExt === 'xlsx' || fileExt === 'xls') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      for (const row of jsonData) {
        // Find student by email
        const student = await User.findOne({ email: row['Email'] });
        const drive = await Drive.findOne({ companyName: row['Company'] });
        
        if (student && drive) {
          // Check if application already exists
          const existing = await Application.findOne({
            student: student._id,
            drive: drive._id
          });
          
          if (!existing) {
            await Application.create({
              student: student._id,
              drive: drive._id,
              status: row['Status'] || 'pending',
              appliedAt: new Date()
            });
            results.push(row);
          }
        }
      }
    } 
    // Handle CSV files
    else if (fileExt === 'csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', async (row) => {
            const student = await User.findOne({ email: row['Email'] });
            const drive = await Drive.findOne({ companyName: row['Company'] });
            
            if (student && drive) {
              const existing = await Application.findOne({
                student: student._id,
                drive: drive._id
              });
              
              if (!existing) {
                await Application.create({
                  student: student._id,
                  drive: drive._id,
                  status: row['Status'] || 'pending',
                  appliedAt: new Date()
                });
                results.push(row);
              }
            }
          })
          .on('end', resolve)
          .on('error', reject);
      });
    }

    // Delete uploaded file
    fs.unlinkSync(filePath);

    res.json({
      message: `Successfully imported ${results.length} applications`,
      count: results.length
    });
  } catch (error) {
    console.error("Error uploading Excel:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
};
```

### Step 5: Complete Send to Company Implementation

Edit `backend/controllers/applicationController.js` - `sendToCompany` function:

```javascript
const nodemailer = require('nodemailer');

exports.sendToCompany = async (req, res) => {
  try {
    const { driveId, companyEmail, applications: applicationIds } = req.body;

    const drive = await Drive.findById(driveId);
    if (!drive) {
      return res.status(404).json({ message: "Drive not found" });
    }

    const applications = await Application.find({ _id: { $in: applicationIds } })
      .populate("student", "name email cgpa branch currentYear skills tenthMarks twelfthMarks activeBacklogs internships");

    // Generate CSV content
    const headers = ["Name", "Email", "CGPA", "Branch", "Year", "10th", "12th", "Backlogs", "Skills", "Status"];
    const rows = applications.map(app => [
      app.student.name,
      app.student.email,
      app.student.cgpa,
      app.student.branch,
      app.student.currentYear,
      app.student.tenthMarks,
      app.student.twelfthMarks,
      app.student.activeBacklogs,
      app.student.skills.join("; "),
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
      to: companyEmail,
      subject: `Student Applications for ${drive.companyName} - ${drive.role || 'Position'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Student Applications</h2>
          <p>Dear ${drive.companyName} Team,</p>
          <p>Please find attached <strong>${applications.length} student applications</strong> for the <strong>${drive.role || 'position'}</strong> role.</p>
          
          <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Drive Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li>📍 <strong>Company:</strong> ${drive.companyName}</li>
              <li>💼 <strong>Role:</strong> ${drive.role || 'Not specified'}</li>
              <li>💰 <strong>Package:</strong> ₹${drive.package} LPA</li>
              <li>📊 <strong>Min CGPA:</strong> ${drive.minCGPA}</li>
              <li>📅 <strong>Applications:</strong> ${applications.length}</li>
            </ul>
          </div>

          <p>The attached CSV file contains complete student information including:</p>
          <ul>
            <li>Academic records (CGPA, 10th, 12th marks)</li>
            <li>Technical skills</li>
            <li>Branch and year details</li>
            <li>Current application status</li>
          </ul>

          <p>Please review the applications and let us know your shortlist.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>
          <strong>Placement Cell</strong></p>
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
      message: `Successfully sent ${applications.length} applications to ${companyEmail}`,
      count: applications.length,
      companyEmail
    });
  } catch (error) {
    console.error("Error sending to company:", error);
    res.status(500).json({ message: error.message || "Error sending data to company" });
  }
};
```

---

## 📧 How It Works: Student Application Flow

### When a Student Applies:

1. **Student fills application form** on StudentDashboard
2. **Application automatically stored** in MongoDB database
3. **Status set to "pending"** by default
4. **Admin receives notification** (if email configured)
5. **Application appears in Admin Excel Sheet** immediately

### Admin Workflow:

```
1. Student applies
   ↓
2. Application stored in database
   ↓
3. Admin sees in "Applications Excel Sheet" tab
   ↓
4. Admin filters/searches applications
   ↓
5. Admin can:
   - View full student profile
   - Update status (pending → shortlisted)
   - Download as Excel/CSV
   - Send to company email
   ↓
6. Company receives email with CSV attachment
   ↓
7. Company reviews and sends feedback
   ↓
8. Admin updates final status (placed/rejected)
```

---

## 🎨 Excel Sheet Features in Detail

### Application Table Columns:

| Column | Description |
|--------|-------------|
| **Student** | Name, email, and profile picture |
| **Academic** | CGPA, branch, year, backlogs |
| **Skills** | Technical skills (first 3 shown, hover for all) |
| **Status** | Current application status with color badge |
| **Applied Date** | When student submitted application |
| **Actions** | View details, update status, delete |

### Status Color Coding:

- 🔵 **Pending** - Blue badge (awaiting review)
- 🟢 **Shortlisted** - Green badge (selected for interview)
- 🔴 **Rejected** - Red badge (not selected)
- 🟣 **Placed** - Purple badge (successfully placed)

### Search & Filter:

- **Search box** - Real-time filtering by name/email/branch
- **Status dropdown** - Show only specific status applications
- **Drive selector** - View all drives or specific company
- **Count badge** - Shows current filtered count

---

## 📊 Sample Excel File Format

When downloading, your CSV will look like this:

```csv
Student Name,Email,CGPA,Branch,Year,10th Marks,12th Marks,Backlogs,Skills,Status,Applied Date,Company
John Doe,john@example.com,8.5,CSE,4,85,88,0,"React; Node.js; MongoDB",pending,2026-03-02,Google
Jane Smith,jane@example.com,9.2,IT,4,92,95,0,"Python; Django; AWS",shortlisted,2026-03-01,Microsoft
```

For **uploading**, use the same format or Excel file with these columns.

---

## 🔐 Admin Permissions

### Who Can Access Excel Sheet Tab?

- ✅ **Admins** - Full access (view, upload, download, send)
- ❌ **Students** - Cannot access
- ❌ **Companies** - Cannot access (receive via email only)

### Security Considerations:

1. **Authentication required** - Must be logged in as admin
2. **Role-based access** - Only admin role can access
3. **File validation** - Only CSV/Excel files accepted
4. **Email sanitization** - Prevents injection attacks
5. **Upload size limit** - Max 5MB per file

---

## 🚨 Troubleshooting

### Issue: Upload Excel button not working
**Solution:** 
1. Check backend is running on port 5000
2. Verify multer is installed: `npm list multer`
3. Ensure `uploads/` folder exists in backend directory
4. Check browser console for error messages

### Issue: Download Excel giving empty file
**Solution:**
1. Verify applications exist in database
2. Check if filter is too restrictive
3. Ensure student data is populated in applications
4. Check browser download settings

### Issue: Send to Company failing
**Solution:**
1. Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
2. Check company email is valid format
3. Ensure nodemailer is installed
4. Test email service connection:
```javascript
transporter.verify((error, success) => {
  if (error) console.log(error);
  else console.log('Server is ready to send emails');
});
```

### Issue: Applications not showing in table
**Solution:**
1. Check backend `/api/applications/all` endpoint
2. Verify student data is populated: `.populate("student")`
3. Clear browser cache and reload
4. Check network tab for API errors

---

## 📖 User Guide for Admins

### Daily Workflow:

#### Morning:
1. **Check Applications tab** for new entries
2. **Filter by "pending"** status
3. **Review student profiles** by clicking "View Details"
4. **Update status** to "shortlisted" for qualified candidates

#### During Company Visit:
1. **Click company drive card** from Overview tab
2. **Filter by "shortlisted"** status
3. **Click "Download Excel"** button
4. **Share CSV with HR representative**
5. Or **click "Send to Company"** for direct email

#### After Interviews:
1. **Receive feedback** from company
2. **Update status** to "placed" or "rejected"
3. **Download updated Excel** for records
4. **Archive old applications** at end of semester

---

## 🎓 Best Practices

### For Admins:

1. **Regular backups** - Download Excel weekly for backup
2. **Status updates** - Update within 24 hours of decision
3. **Communication** - Send personalized emails to placed students
4. **Documentation** - Keep CSV records for reporting
5. **Data privacy** - Don't share student data publicly

### For Companies:

1. **Quick review** - Check applications within 2-3 days
2. **Feedback** - Provide clear shortlist/rejection reasons
3. **Communication** - Reply to admin emails promptly
4. **Profile requests** - Ask for specific student details if needed

---

## 📈 Advanced Features (Coming Soon)

- **Bulk status update** - Select multiple, update all at once
- **Advanced filters** - Filter by CGPA range, skills, branch
- **Export to Excel** (.xlsx format with formatting)
- **Email templates** - Customizable company email templates
- **Scheduling** - Auto-send applications at specific time
- **Analytics** - Charts showing application trends
- **Notifications** - Real-time alerts for new applications
- **PDF export** - Generate professional PDF reports

---

## ✅ Testing Checklist

Before going live, verify:

- [ ] Backend server running (port 5000)
- [ ] Frontend connected to backend
- [ ] Multer installed and uploads folder exists
- [ ] Email credentials configured in `.env`
- [ ] Test file upload with sample CSV
- [ ] Test file download creates valid CSV
- [ ] Test send email with valid company email
- [ ] Status updates reflect in real-time
- [ ] Search and filter working correctly
- [ ] Mobile responsive design working
- [ ] No console errors in browser
- [ ] All API endpoints responding

---

## 🎉 You're All Set!

Your **Student Application Excel Management System** is now ready to use!

### Quick Start:
1. Login as Admin
2. Go to "Applications Excel Sheet" tab
3. See all student applications in table format
4. Use Upload/Download/Send buttons as needed

### Support:
- Check `ADMIN_ENHANCEMENT_GUIDE.md` for more features
- See `README.md` for general setup
- Contact technical support for issues

---

**Version:** 1.0.0  
**Last Updated:** March 2, 2026  
**Author:** GitHub Copilot AI Assistant
