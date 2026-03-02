import { useEffect } from "react";
import EligibilityChecker from "./EligibilityChecker";

/**
 * DriveDetailModal Component
 * Shows complete drive details with eligibility analysis
 */
function DriveDetailModal({ drive, isOpen, onClose, onApply, userProfile, isApplied }) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !drive) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-accent-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{drive.companyName}</h2>
                {drive.role && (
                  <p className="text-xl font-semibold text-white/90">{drive.role}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    ₹{drive.package} LPA
                  </span>
                  {drive.isDreamOffer && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Dream Offer
                    </span>
                  )}
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    {drive.status || "Open"}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Job Description */}
            {drive.jobDescription && (
              <div>
                <h3 className="text-lg font-bold text-secondary-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Job Description
                </h3>
                <p className="text-secondary-700 leading-relaxed">{drive.jobDescription}</p>
              </div>
            )}

            {/* Required Skills */}
            {drive.requiredSkills && drive.requiredSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-secondary-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {drive.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 text-sm font-semibold rounded-lg border border-primary-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Drive Details Grid */}
            <div>
              <h3 className="text-lg font-bold text-secondary-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Job Requirements
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-secondary-600 mb-1">Minimum CGPA</p>
                  <p className="text-2xl font-bold text-primary-600">{drive.minCGPA}</p>
                </div>
                
                {drive.eligibleBranches && drive.eligibleBranches.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-secondary-600 mb-1">Eligible Branches</p>
                    <p className="text-sm font-semibold text-secondary-900">
                      {drive.eligibleBranches.join(", ")}
                    </p>
                  </div>
                )}
                
                {drive.eligibleYears && drive.eligibleYears.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-secondary-600 mb-1">Eligible Years</p>
                    <p className="text-sm font-semibold text-secondary-900">
                      {drive.eligibleYears.map(y => `${y}${getOrdinalSuffix(y)} Year`).join(", ")}
                    </p>
                  </div>
                )}
                
                {drive.backlogsAllowed !== undefined && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-secondary-600 mb-1">Backlog Policy</p>
                    <p className="text-sm font-semibold text-secondary-900">
                      {drive.backlogsAllowed
                        ? `Max ${drive.maxBacklogsAllowed || 0} allowed`
                        : "No backlogs allowed"
                      }
                    </p>
                  </div>
                )}
                
                {drive.deadline && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-secondary-600 mb-1">Application Deadline</p>
                    <p className="text-sm font-semibold text-secondary-900">
                      {new Date(drive.deadline).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Weightage Configuration */}
            {drive.weightage && (
              <div>
                <h3 className="text-lg font-bold text-secondary-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Ranking Criteria & Weightage
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                    <p className="text-3xl font-bold text-blue-600">{drive.weightage.cgpa}%</p>
                    <p className="text-xs font-semibold text-blue-800 mt-1">CGPA</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
                    <p className="text-3xl font-bold text-green-600">{drive.weightage.skills}%</p>
                    <p className="text-xs font-semibold text-green-800 mt-1">Skills Match</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center border border-purple-200">
                    <p className="text-3xl font-bold text-purple-600">{drive.weightage.internships}%</p>
                    <p className="text-xs font-semibold text-purple-800 mt-1">Internships</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center border border-orange-200">
                    <p className="text-3xl font-bold text-orange-600">{drive.weightage.academics}%</p>
                    <p className="text-xs font-semibold text-orange-800 mt-1">Academics</p>
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility Checker */}
            {userProfile && (
              <div>
                <EligibilityChecker
                  drive={drive}
                  userProfile={userProfile}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-secondary-700 rounded-lg font-semibold transition-all"
              >
                Close
              </button>
              {onApply && !isApplied && (
                <button
                  onClick={() => {
                    onApply(drive._id);
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white rounded-lg font-semibold transition-all shadow-lg"
                >
                  Apply Now
                </button>
              )}
              {isApplied && (
                <div className="flex-1 px-6 py-3 bg-green-100 text-green-800 rounded-lg font-semibold text-center border-2 border-green-300 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Already Applied
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

export default DriveDetailModal;
