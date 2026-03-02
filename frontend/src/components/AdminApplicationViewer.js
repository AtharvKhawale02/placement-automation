import { useState, useEffect } from "react";
import API from "../services/api";

/**
 * Admin Application Viewer Component
 * Shows all student applications with filtering and export functionality
 */
function AdminApplicationViewer({ driveId, driveName, applications: propApplications, onRefresh }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, shortlisted, rejected, placed
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    // If applications are passed as props, use them
    if (propApplications && Array.isArray(propApplications)) {
      setApplications(propApplications);
      setLoading(false);
    } else if (propApplications) {
      // If propApplications exists but is not an array, set to empty array
      setApplications([]);
      setLoading(false);
    } else {
      // Otherwise, fetch them
      fetchApplications();
    }
  }, [driveId, propApplications]);

  const fetchApplications = async () => {
    try {
      const endpoint = driveId 
        ? `/api/applications/drive/${driveId}`
        : `/api/applications/all`;
      const res = await API.get(endpoint);
      setApplications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (appId, newStatus) => {
    try {
      await API.put(`/api/applications/${appId}/status`, { status: newStatus });
      
      // Call onRefresh if provided, otherwise fetch applications
      if (onRefresh) {
        onRefresh();
      } else {
        fetchApplications();
      }
      
      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-down';
      notification.innerHTML = `<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="font-semibold">Status updated to ${newStatus}</span></div>`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const exportToCSV = () => {
    const headers = ["Student Name", "Email", "CGPA", "Branch", "Year", "Skills", "Status", "Applied Date"];
    const rows = filteredApplications.map(app => [
      app.student?.name || "N/A",
      app.student?.email || "N/A",
      app.student?.cgpa || "N/A",
      app.student?.branch || "N/A",
      app.student?.currentYear || "N/A",
      (app.student?.skills || []).join("; "),
      app.status,
      new Date(app.appliedAt).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications_${driveName || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredApplications = (Array.isArray(applications) ? applications : []).filter(app => {
    const matchesFilter = filter === "all" || app.status === filter;
    const matchesSearch = !searchTerm || 
      app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusConfig = {
    pending: { 
      bg: "bg-blue-100", 
      text: "text-blue-700", 
      border: "border-blue-300",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    shortlisted: { 
      bg: "bg-green-100", 
      text: "text-green-700", 
      border: "border-green-300",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    rejected: { 
      bg: "bg-red-100", 
      text: "text-red-700", 
      border: "border-red-300",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    placed: { 
      bg: "bg-purple-100", 
      text: "text-purple-700", 
      border: "border-purple-300",
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex p-4 bg-primary-100 rounded-lg mb-4">
          <svg className="animate-spin h-8 w-8 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-secondary-600 font-semibold">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {driveName ? `Applications for ${driveName}` : "All Applications"}
            </h3>
            <p className="text-sm text-secondary-600 mt-1">
              {filteredApplications.length} of {applications.length} applications
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search by name, email, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-semibold bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="placed">Placed</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-x-auto">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-secondary-600 font-semibold">No applications found</p>
            <p className="text-sm text-secondary-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">Academic</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">Skills</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-secondary-700 uppercase tracking-wider">Applied</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-secondary-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredApplications.map((app) => {
                const config = statusConfig[app.status] || statusConfig.pending;
                return (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-secondary-900">{app.student?.name || "N/A"}</div>
                        <div className="text-sm text-secondary-600">{app.student?.email || "N/A"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-secondary-600">CGPA:</span> 
                          <span className="font-bold text-primary-600 ml-1">{app.student?.cgpa || "N/A"}</span>
                        </div>
                        <div className="text-xs text-secondary-600">
                          {app.student?.branch || "N/A"} • Year {app.student?.currentYear || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(app.student?.skills || []).slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {skill}
                          </span>
                        ))}
                        {(app.student?.skills || []).length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                            +{app.student.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs ${config.bg} ${config.text} border ${config.border}`}>
                        {config.icon}
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600">
                      {new Date(app.appliedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {app.status !== "placed" && (
                          <select
                            value={app.status}
                            onChange={(e) => updateApplicationStatus(app._id, e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-white hover:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all"
                          >
                            <option value="pending">Pending</option>
                            <option value="shortlisted">Shortlist</option>
                            <option value="rejected">Reject</option>
                            <option value="placed">Place</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedApp.student?.name}</h3>
                  <p className="text-white/90 mt-1">{selectedApp.student?.email}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Academic Details */}
              <div>
                <h4 className="text-lg font-bold text-secondary-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Academic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-secondary-600">CGPA</p>
                    <p className="text-2xl font-bold text-primary-600">{selectedApp.student?.cgpa || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-secondary-600">Branch</p>
                    <p className="text-lg font-bold text-green-700">{selectedApp.student?.branch || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-secondary-600">Current Year</p>
                    <p className="text-lg font-bold text-purple-700">Year {selectedApp.student?.currentYear || "N/A"}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-secondary-600">Backlogs</p>
                    <p className="text-lg font-bold text-amber-700">
                      {selectedApp.student?.activeBacklogs || 0} / {selectedApp.student?.totalBacklogs || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedApp.student?.skills && selectedApp.student.skills.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Technical Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.student.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-2 bg-gradient-to-r from-blue-100 to-primary-100 text-primary-700 text-sm font-semibold rounded-lg border border-primary-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships */}
              {selectedApp.student?.internships && selectedApp.student.internships.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-secondary-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Internship Experience
                  </h4>
                  <div className="space-y-3">
                    {selectedApp.student.internships.map((internship, idx) => (
                      <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="font-bold text-secondary-900">{internship.company}</p>
                        <p className="text-sm text-secondary-700">{internship.role}</p>
                        <p className="text-xs text-secondary-600 mt-1">{internship.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">
                    Applied on {new Date(selectedApp.appliedAt).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  {selectedApp.status !== "placed" && (
                    <select
                      value={selectedApp.status}
                      onChange={(e) => {
                        updateApplicationStatus(selectedApp._id, e.target.value);
                        setSelectedApp(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold bg-white hover:border-primary-500 focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="shortlisted">Mark as Shortlisted</option>
                      <option value="rejected">Mark as Rejected</option>
                      <option value="placed">Mark as Placed</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApplicationViewer;
