import { useState } from "react";

function StudentDetailModal({ application, onClose, onStatusChange }) {
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  if (!application || !application.student) return null;

  const student = application.student;
  const scoring = application.scoring || {};

  const handleStatusUpdate = async (status) => {
    setLoading(true);
    try {
      await onStatusChange(application._id, status, feedback);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-primary-100 text-sm">{student.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                application.status === "shortlisted"
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : application.status === "rejected"
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-blue-100 text-blue-700 border border-blue-300"
              }`}>
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    application.status === "shortlisted"
                      ? "bg-green-500"
                      : application.status === "rejected"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  } animate-pulse`}></span>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </span>
              <span className="text-xs text-gray-500">
                Applied on {new Date(application.appliedAt || application.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            {/* Match Score */}
            {scoring.finalWeightedScore !== undefined && (
              <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
                <span className="text-sm font-semibold text-gray-700">Match Score: </span>
                <span className={`text-xl font-bold ${
                  scoring.finalWeightedScore >= 80
                    ? "text-green-600"
                    : scoring.finalWeightedScore >= 60
                    ? "text-blue-600"
                    : scoring.finalWeightedScore >= 40
                    ? "text-orange-600"
                    : "text-red-600"
                }`}>
                  {Math.round(scoring.finalWeightedScore)}%
                </span>
              </div>
            )}
          </div>

          {/* Academic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Academic Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Branch</p>
                <p className="text-lg font-bold text-gray-800">{student.branch || "N/A"}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Current Year</p>
                <p className="text-lg font-bold text-gray-800">{student.currentYear || "N/A"}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">CGPA</p>
                <p className="text-lg font-bold text-blue-600">{student.cgpa || "N/A"} / 10</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">Active Backlogs</p>
                <p className={`text-lg font-bold ${
                  student.activeBacklogs > 0 ? "text-red-600" : "text-green-600"
                }`}>
                  {student.activeBacklogs || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">10th Marks</p>
                <p className="text-lg font-bold text-gray-800">{student.tenthMarks || "N/A"}%</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">12th Marks</p>
                <p className="text-lg font-bold text-gray-800">{student.twelfthMarks || "N/A"}%</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {student.skills && student.skills.length > 0 ? (
                student.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-gray-700 shadow-sm border border-green-200 hover:shadow-md transition-shadow"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-600">No skills listed</p>
              )}
            </div>
            {scoring.skillMatchPercentage !== undefined && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-semibold">Skill Match: </span>
                <span className="text-green-700 font-bold">{Math.round(scoring.skillMatchPercentage)}%</span>
              </div>
            )}
          </div>

          {/* Internships */}
          {student.internships && student.internships.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
                Internship Experience
              </h3>
              <div className="space-y-3">
                {student.internships.map((internship, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="font-bold text-gray-800">{internship.company}</p>
                    <p className="text-sm text-gray-600">{internship.role}</p>
                    <p className="text-xs text-gray-500 mt-1">{internship.duration}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Breakdown */}
          {scoring.finalWeightedScore !== undefined && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5 border border-orange-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Score Breakdown
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {scoring.cgpaScore !== undefined && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">CGPA Score</p>
                    <p className="text-lg font-bold text-blue-600">{Math.round(scoring.cgpaScore)}%</p>
                  </div>
                )}
                {scoring.skillMatchPercentage !== undefined && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Skill Match</p>
                    <p className="text-lg font-bold text-green-600">{Math.round(scoring.skillMatchPercentage)}%</p>
                  </div>
                )}
                {scoring.internshipScore !== undefined && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Internship Score</p>
                    <p className="text-lg font-bold text-purple-600">{Math.round(scoring.internshipScore)}%</p>
                  </div>
                )}
                {scoring.academicScore !== undefined && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Academic Score</p>
                    <p className="text-lg font-bold text-orange-600">{Math.round(scoring.academicScore)}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resume */}
          {student.resume && (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                Resume
              </h3>
              <a
                href={student.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all border border-primary-200 hover:bg-primary-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Resume
              </a>
            </div>
          )}

          {/* Feedback Section */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              Add Feedback (Optional)
            </h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
              rows="3"
              placeholder="Share your feedback with the candidate..."
            ></textarea>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              Close
            </button>
            
            {application.status !== "rejected" && (
              <button
                onClick={() => handleStatusUpdate("rejected")}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Reject
                  </>
                )}
              </button>
            )}
            
            {application.status !== "shortlisted" && (
              <button
                onClick={() => handleStatusUpdate("shortlisted")}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Shortlist
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetailModal;
