import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import Navbar from "../../components/Navbar";
import DriveCard from "../../components/DriveCard";
import DriveDetailModal from "../../components/DriveDetailModal";

function StudentDashboard() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedDrives, setAppliedDrives] = useState([]);
  const [applications, setApplications] = useState([]); // Store full application data with status
  const [filter, setFilter] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedDriveId, setSelectedDriveId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const drivesRes = await API.get(
          "/api/drives/all"
        );
        setDrives(drivesRes.data);

        const appliedRes = await API.get(
          `/api/applications/student/${user._id}`
        );
        setApplications(appliedRes.data); // Store full application data
        setAppliedDrives(
          appliedRes.data.map((a) => a.drive._id)
        );
      } catch (error) {
        console.error("Error loading student data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id]);

  const handleApplyClick = (driveId) => {
    setSelectedDriveId(driveId);
    setShowConfirmModal(true);
  };

  const confirmApply = async () => {
    setShowConfirmModal(false);
    await applyToDrive(selectedDriveId);
  };

  const handleViewDetails = (drive) => {
    setSelectedDrive(drive);
    setShowDetailModal(true);
  };

  const applyToDrive = async (driveId) => {
    try {
      await API.post(
        "/api/applications/apply",
        {
          studentId: user._id,
          driveId,
        }
      );

      // Refresh applications to get updated list with status
      const appliedRes = await API.get(
        `/api/applications/student/${user._id}`
      );
      setApplications(appliedRes.data);
      setAppliedDrives(appliedRes.data.map((a) => a.drive._id));
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-6 bg-accent-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-down';
      notification.innerHTML = '<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="font-semibold">Applied successfully!</span></div>';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      // Display actual error message from backend
      const errorMessage = error.response?.data?.message || "An error occurred while applying";
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-6 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-down max-w-md';
      notification.innerHTML = `<div class="flex items-start"><svg class="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg><div><span class="font-semibold block">Application Failed</span><span class="text-sm">${errorMessage}</span>${errorMessage.includes('CGPA') || errorMessage.includes('eligible') ? '<br/><span class="text-xs mt-1 inline-block flex items-center gap-1"><svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>Please update your profile with correct CGPA and skills.</span>' : ''}</div></div>`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    }
  };

  const filteredDrives = drives.filter(drive => {
    if (filter === "applied") return appliedDrives.includes(drive._id);
    if (filter === "available") return !appliedDrives.includes(drive._id);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex p-4 bg-primary-100 rounded-lg mb-4">
            <svg className="animate-spin h-10 w-10 text-primary-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-lg font-semibold text-secondary-700">Loading drives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-secondary-900">Student Dashboard</h2>
                <p className="text-secondary-600">Explore and apply to placement drives</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/profile/edit")}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-lg font-semibold shadow-md hover:bg-primary-700 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Completion Alert */}
        {(user.cgpa === 0 || !user.skills || user.skills.length === 0) && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg animate-slide-down">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-yellow-800 mb-1">Complete Your Profile</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Your profile is incomplete. Please update your CGPA and skills to apply for placement drives.
                </p>
                <button
                  onClick={() => navigate("/profile/edit")}
                  className="text-sm font-semibold text-yellow-800 underline hover:text-yellow-900"
                >
                  Update Profile Now →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Applications Section - Status Tracking */}
        {applications.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <h3 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              My Applications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => {
                const statusConfig = {
                  pending: {
                    bg: "bg-blue-50",
                    border: "border-blue-200",
                    text: "text-blue-700",
                    badgeBg: "bg-blue-100",
                    badgeText: "text-blue-600",
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )
                  },
                  shortlisted: {
                    bg: "bg-green-50",
                    border: "border-green-200",
                    text: "text-green-700",
                    badgeBg: "bg-green-100",
                    badgeText: "text-green-600",
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )
                  },
                  rejected: {
                    bg: "bg-red-50",
                    border: "border-red-200",
                    text: "text-red-700",
                    badgeBg: "bg-red-100",
                    badgeText: "text-red-600",
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )
                  }
                };

                const config = statusConfig[app.status] || statusConfig.pending;

                return (
                  <div
                    key={app._id}
                    className={`${config.bg} ${config.border} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-secondary-900 text-lg">{app.drive.companyName}</h4>
                      <span className={`${config.badgeBg} ${config.badgeText} px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1`}>
                        {config.icon}
                        {app.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-secondary-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Package:</span> ₹{app.drive.package} LPA
                      </div>
                      <div className="flex items-center gap-2 text-secondary-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Applied on:</span> {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                      {app.matchScore !== undefined && (
                        <div className="flex items-center gap-2 text-secondary-600">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-medium">Match Score:</span> {app.matchScore}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-semibold mb-1">Total Drives</p>
                <p className="text-3xl font-bold text-primary-600">{drives.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-semibold mb-1">Applications</p>
                <p className="text-3xl font-bold text-blue-600">{appliedDrives.length}</p>
                {applications.length > 0 && (
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="text-blue-600 font-medium">
                      {applications.filter(a => a.status === 'pending').length} Pending
                    </span>
                    <span className="text-green-600 font-medium">
                      {applications.filter(a => a.status === 'shortlisted').length} Shortlisted
                    </span>
                    <span className="text-red-600 font-medium">
                      {applications.filter(a => a.status === 'rejected').length} Rejected
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm font-semibold mb-1">Shortlisted</p>
                <p className="text-3xl font-bold text-accent-600">
                  {applications.filter(a => a.status === 'shortlisted').length}
                </p>
                <p className="text-xs text-secondary-500 mt-1">Success Rate: {appliedDrives.length > 0 ? Math.round((applications.filter(a => a.status === 'shortlisted').length / appliedDrives.length) * 100) : 0}%</p>
              </div>
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
          {[
            { id: "all", label: "All Drives" },
            { id: "available", label: "Available" },
            { id: "applied", label: "Applied" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${ 
                filter === tab.id
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-white text-secondary-700 hover:bg-gray-50 shadow border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drives Grid */}
        {filteredDrives.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-xl text-secondary-900 font-semibold">No drives found</p>
            <p className="text-secondary-600 mt-2">Try changing your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive, index) => (
              <div
                key={drive._id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-scale-in"
              >
                <DriveCard
                  drive={drive}
                  onApply={handleApplyClick}
                  onViewDetails={handleViewDetails}
                  applied={appliedDrives.includes(drive._id)}
                  user={user}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">Confirm Application</h3>
                  <p className="text-sm text-secondary-600">Review your profile before applying</p>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Your Current Profile:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• CGPA: <span className="font-semibold">{user.cgpa || 0}</span></li>
                    <li>• Branch: <span className="font-semibold">{user.branch || "Not set"}</span></li>
                    <li>• Skills: <span className="font-semibold">{user.skills && user.skills.length > 0 ? user.skills.join(", ") : "No skills added"}</span></li>
                    <li>• 10th: <span className="font-semibold">{user.tenthPercentage || 0}%</span></li>
                    <li>• 12th: <span className="font-semibold">{user.twelfthPercentage || 0}%</span></li>
                  </ul>
                </div>
              </div>

              <p className="text-sm text-secondary-700 mb-6">
                Make sure your profile is up-to-date to maximize your chances. Do you want to update your profile before applying?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    navigate("/profile/edit");
                  }}
                  className="flex-1 px-4 py-3 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg font-semibold transition-all duration-200"
                >
                  Edit Profile
                </button>
                <button
                  onClick={confirmApply}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all duration-200"
                >
                  Continue & Apply
                </button>
              </div>

              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full mt-3 px-4 py-2 text-secondary-600 hover:text-secondary-800 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drive Detail Modal */}
      <DriveDetailModal
        drive={selectedDrive}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onApply={handleApplyClick}
        userProfile={user}
        isApplied={appliedDrives.includes(selectedDrive?._id)}
      />
    </div>
  );
}

export default StudentDashboard;