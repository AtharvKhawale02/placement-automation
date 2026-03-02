function DriveCard({ drive, onApply, applied, user, onViewDetails }) {
  // Comprehensive eligibility check
  const userCgpa = user?.cgpa ?? 0;
  const eligibilityChecks = {
    cgpa: userCgpa >= drive.minCGPA,
    branch: !drive.eligibleBranches || drive.eligibleBranches.length === 0 || drive.eligibleBranches.includes(user?.branch),
    year: !drive.eligibleYears || drive.eligibleYears.length === 0 || drive.eligibleYears.includes(user?.currentYear),
    backlogs: drive.backlogsAllowed ? (user?.activeBacklogs || 0) <= (drive.maxBacklogsAllowed || 0) : (user?.activeBacklogs || 0) === 0,
    tenthMarks: !drive.min10thMarks || (user?.tenthMarks || 0) >= drive.min10thMarks,
    twelfthMarks: !drive.min12thMarks || (user?.twelfthMarks || 0) >= drive.min12thMarks,
  };
  
  const eligibleCount = Object.values(eligibilityChecks).filter(Boolean).length;
  const totalChecks = Object.values(eligibilityChecks).length;
  const isFullyEligible = eligibleCount === totalChecks;
  const canApply = !applied && isFullyEligible;
  
  return (
    <div className="card group overflow-hidden animate-scale-in">
      <div className="p-6">
        {/* Company Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1">
              {drive.companyName}
            </h3>
            {drive.role && (
              <p className="text-smFont-semibold text-primary-600 mb-2">{drive.role}</p>
            )}
            <div className="h-1 w-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Job Description */}
        {drive.jobDescription && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-secondary-700 mb-1">Job Description:</p>
            <p className="text-sm text-secondary-600 line-clamp-3">{drive.jobDescription}</p>
          </div>
        )}

        {/* Required Skills */}
        {drive.requiredSkills && drive.requiredSkills.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-secondary-700 mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {drive.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-secondary-700">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span className="text-sm">
                Min CGPA: <span className="font-bold text-primary-600">{drive.minCGPA}</span>
              </span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 ${
                  isFullyEligible 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' 
                    : eligibleCount > 0
                    ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-300'
                    : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-300'
                }`}>
                  {isFullyEligible ? '✓' : '⚠'} {eligibleCount}/{totalChecks} Match
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-secondary-700">
            <svg className="w-5 h-5 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">
              Package: <span className="font-bold text-accent-600">₹{drive.package} LPA</span>
            </span>
          </div>
          {drive.deadline && (
            <div className="flex items-center space-x-2 text-secondary-700">
              <svg className="w-5 h-5 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">
                Deadline: <span className="font-semibold">{new Date(drive.deadline).toLocaleDateString()}</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* View Details Button */}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(drive)}
              className="flex-1 py-2.5 px-4 bg-white border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              View Details
            </button>
          )}
          
          {/* Apply Button */}
          {onApply && (
            <button
              onClick={() => onApply(drive._id)}
              disabled={!canApply}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-all duration-200 ${
                applied
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : !isFullyEligible
                  ? "bg-red-100 text-red-700 cursor-not-allowed border-2 border-red-300"
                  : "bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white shadow-md hover:shadow-lg hover:scale-105"
              }`}
            >
              {applied ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Applied
                </span>
              ) : !isFullyEligible ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Not Eligible
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Apply Now
                </span>
              )}
            </button>
          )}
        </div>
        {!isFullyEligible && user && !applied && (
          <p className="text-xs text-amber-700 mt-2 text-center bg-amber-50 py-2 px-3 rounded-lg border border-amber-200">
            ⚠ You meet {eligibleCount} of {totalChecks} requirements. 
            <button onClick={() => onViewDetails ? onViewDetails(drive) : null} className="underline font-semibold ml-1">
              Check details
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default DriveCard;