import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import StatsCard from "../../components/StatsCard";
import CreateDriveForm from "../../components/CreateDriveForm";
import AdminApplicationViewer from "../../components/AdminApplicationViewer";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDrives: 0,
    placedStudents: 0,
  });

  const [drives, setDrives] = useState([]);
  const [selectedView, setSelectedView] = useState("overview");
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchStats();
    fetchDrives();
    if (selectedView === "applications") {
      fetchApplications();
    }
  }, [selectedView, selectedDrive]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/stats"
      );
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats");
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/drives/all"
      );
      setDrives(res.data);
    } catch (error) {
      console.error("Error fetching drives");
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const endpoint = selectedDrive 
        ? `http://localhost:5000/api/applications/drive/${selectedDrive._id}`
        : "http://localhost:5000/api/applications/all";
      const res = await axios.get(endpoint);
      setApplications(res.data);
    } catch (error) {
      console.error("Error fetching applications", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Download Excel functionality
  const downloadExcel = () => {
    if (applications.length === 0) {
      showNotification("No applications to download", "error");
      return;
    }

    const headers = [
      "Student Name",
      "Email",
      "CGPA",
      "Branch",
      "Year",
      "10th Marks",
      "12th Marks",
      "Backlogs",
      "Skills",
      "Status",
      "Applied Date",
      "Company",
    ];

    const rows = applications.map(app => [
      app.student?.name || "N/A",
      app.student?.email || "N/A",
      app.student?.cgpa || "N/A",
      app.student?.branch || "N/A",
      app.student?.currentYear || "N/A",
      app.student?.tenthMarks || "N/A",
      app.student?.twelfthMarks || "N/A",
      app.student?.activeBacklogs || 0,
      app.student?.skills?.join("; ") || "N/A",
      app.status || "pending",
      new Date(app.appliedAt).toLocaleDateString(),
      app.drive?.companyName || "N/A",
    ]);

    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("Excel file downloaded successfully!", "success");
  };

  // Download Sample Format
  const downloadSampleFormat = () => {
    const headers = ["Email", "Company"];
    const sampleRows = [
      ["student1@example.com", "Google"],
      ["student2@example.com", "Microsoft"],
      ["student3@example.com", "Amazon"]
    ];

    let csvContent = headers.join(",") + "\n";
    sampleRows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n";
    });
    csvContent += "\n# Instructions:\n";
    csvContent += "# 1. Email: Student's registered email address\n";
    csvContent += "# 2. Company: Exact company name from created drives\n";
    csvContent += "# 3. Ensure students are registered and drives are created before uploading\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_upload_format.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("Sample format downloaded! Check the file for instructions.", "success");
  };

  // Upload Excel functionality
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      showNotification("Please upload a valid Excel (.xlsx, .xls) or CSV file", "error");
      event.target.value = "";
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showNotification("File size too large. Maximum size is 10MB", "error");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/applications/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (res.data.count > 0) {
        let message = `Successfully imported ${res.data.count} applications!`;
        if (res.data.totalErrors > 0) {
          message += ` (${res.data.totalErrors} rows had errors)`;
        }
        showNotification(message, "success");
        
        // Log errors to console for debugging
        if (res.data.errors && res.data.errors.length > 0) {
          console.log("Import errors:", res.data.errors);
        }
        
        fetchApplications();
        fetchStats();
        fetchDrives(); // Refresh drives to update counts
      } else {
        let errorMsg = res.data.message || "No valid applications found in the file";
        
        // Show detailed error info
        if (res.data.errors && res.data.errors.length > 0) {
          console.error("Upload errors:", res.data.errors);
          const firstError = res.data.errors[0];
          errorMsg += `\n\nFirst error: ${firstError.error}`;
          if (firstError.email) errorMsg += ` (Email: ${firstError.email})`;
        }
        
        if (res.data.hint) {
          errorMsg += `\n\nHint: ${res.data.hint}`;
        }
        
        showNotification(errorMsg, "error");
      }
    } catch (error) {
      console.error("Error uploading file", error);
      let errorMsg = error.response?.data?.message || error.message || "Failed to upload file";
      
      // Show detailed errors if available
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        console.error("Upload errors:", error.response.data.errors);
        const firstError = error.response.data.errors[0];
        errorMsg += `\n\nFirst error: ${firstError.error}`;
        if (firstError.email) errorMsg += ` (Email: ${firstError.email})`;
      }
      
      if (error.response?.data?.hint) {
        errorMsg += `\n\nHint: ${error.response.data.hint}`;
      }
      
      showNotification(errorMsg, "error");
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  // Send to Company functionality
  const sendToCompany = async () => {
    if (!selectedDrive) {
      showNotification("Please select a drive first", "error");
      return;
    }

    if (applications.length === 0) {
      showNotification("No applications to send", "error");
      return;
    }

    // Check if company email is set
    let emailToSend = selectedDrive.companyEmail;
    if (!emailToSend || emailToSend.trim() === '') {
      emailToSend = prompt("Please enter the company email address:");
      if (!emailToSend || emailToSend.trim() === '') {
        showNotification("Company email is required to send applications", "error");
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToSend)) {
        showNotification("Please enter a valid email address", "error");
        return;
      }
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/applications/send-to-company",
        {
          driveId: selectedDrive._id,
          companyEmail: emailToSend,
          applications: applications.map(app => app._id),
        }
      );
      showNotification(res.data.message || "Data sent to company successfully!", "success");
      
      // If email was entered manually and send was successful, optionally update the drive
      if (emailToSend !== selectedDrive.companyEmail) {
        try {
          await axios.put(`http://localhost:5000/api/drives/${selectedDrive._id}`, {
            ...selectedDrive,
            companyEmail: emailToSend
          });
          // Refresh drives to show updated email
          fetchDrives();
        } catch (updateError) {
          console.log("Could not update drive email:", updateError);
        }
      }
    } catch (error) {
      console.error("Error sending to company", error);
      const errorMsg = error.response?.data?.message || "Failed to send data to company";
      showNotification(errorMsg, "error");
      
      // If it's a missing email error, prompt again
      if (error.response?.data?.needsEmail) {
        setTimeout(() => sendToCompany(), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`${
            notification.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
            {notification.type === "success" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header with Tabs */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-4 text-indigo-600">
            Admin Dashboard
          </h2>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-300 mb-6">
            <button
              onClick={() => {
                setSelectedView("overview");
                setSelectedDrive(null);
                fetchDrives(); // Refresh drives when going back to overview
              }}
              className={`px-6 py-3 font-semibold transition-all ${
                selectedView === "overview"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Overview
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedView("applications");
                fetchApplications();
              }}
              className={`px-6 py-3 font-semibold transition-all ${
                selectedView === "applications"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                Applications Excel Sheet
              </span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
          />
          <StatsCard
            title="Total Drives"
            value={stats.totalDrives}
          />
          <StatsCard
            title="Placed Students"
            value={stats.placedStudents}
          />
        </div>

        {/* Overview Tab */}
        {selectedView === "overview" && (
          <>
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-semibold">
                  Active Placement Drives
                </h3>
                <button
                  onClick={() => {
                    fetchDrives();
                    fetchStats();
                    showNotification("Data refreshed!", "success");
                  }}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Refresh drives"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Create New Drive
              </button>
            </div>

            {/* Drives Grid */}
            {drives.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                <p className="text-xl text-gray-700 font-semibold">No active drives</p>
                <p className="text-gray-500 mt-2">Create a new drive to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drives.map((drive) => (
                  <div
                    key={drive._id}
                    className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer"
                    onClick={() => {
                      setSelectedDrive(drive);
                      setSelectedView("applications");
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold text-gray-800">
                        {drive.companyName}
                      </h4>
                      <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {drive.role && (
                      <p className="text-indigo-600 font-semibold mb-2">{drive.role}</p>
                    )}
                    <div className="space-y-2">
                      <p className="text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                        Min CGPA: <span className="font-bold">{drive.minCGPA}</span>
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        Package: <span className="font-bold">₹{drive.package} LPA</span>
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Deadline: {new Date(drive.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Registered Students Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-700">Registered Students</span>
                        </div>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">
                          {drive.applicationCount || 0}
                        </span>
                      </div>
                      
                      {/* Eligible Students Count */}
                      {drive.applicationCount > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>{drive.eligibleCount || 0} eligible</span>
                          <span className="text-gray-400">|</span>
                          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{(drive.applicationCount || 0) - (drive.eligibleCount || 0)} rejected</span>
                        </div>
                      )}
                      
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Click to view applications
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Applications Excel Sheet Tab */}
        {selectedView === "applications" && (
          <div>
            {/* Excel Actions Bar */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {selectedDrive && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedDrive(null);
                          fetchApplications();
                          fetchDrives(); // Refresh drive counts
                        }}
                        className="text-gray-600 hover:text-gray-900 flex items-center gap-1 font-semibold"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        All Drives
                      </button>
                      <span className="text-gray-400">|</span>
                      <h3 className="text-lg font-bold text-gray-800">{selectedDrive.companyName}</h3>
                    </>
                  )}
                  {!selectedDrive && (
                    <h3 className="text-lg font-bold text-gray-800">All Applications</h3>
                  )}
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                    {applications.length} applications
                  </span>
                </div>

                {/* Excel Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Download Sample Format */}
                  <button
                    onClick={downloadSampleFormat}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    title="Download sample Excel format with instructions"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Sample Format
                  </button>

                  {/* Upload Excel */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <div className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      Upload Excel
                    </div>
                  </label>

                  {/* Download Excel */}
                  <button
                    onClick={downloadExcel}
                    disabled={loading || applications.length === 0}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Excel
                  </button>

                  {/* Send to Company */}
                  {selectedDrive && (
                    <button
                      onClick={sendToCompany}
                      disabled={loading || applications.length === 0}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      Send to Company
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Applications Table/Excel View */}
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg font-semibold text-gray-700">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-xl text-gray-700 font-semibold">No applications yet</p>
                <p className="text-gray-500 mt-2">Students' applications will appear here when they apply</p>
              </div>
            ) : (
              <AdminApplicationViewer
                applications={applications}
                onRefresh={fetchApplications}
                driveId={selectedDrive?._id}
                driveName={selectedDrive?.companyName}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Drive Modal */}
      {showCreateForm && (
        <CreateDriveForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchDrives();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

export default AdminDashboard;