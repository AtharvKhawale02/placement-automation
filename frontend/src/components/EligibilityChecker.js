import { useState, useEffect } from "react";

/**
 * EligibilityChecker Component
 * Shows real-time eligibility status for a drive based on user profile
 */
function EligibilityChecker({ drive, userProfile, extractedSkills = [] }) {
  const [eligibility, setEligibility] = useState({
    isEligible: true,
    checks: [],
    score: 0,
    skillMatch: 0,
  });

  useEffect(() => {
    if (drive && userProfile) {
      checkEligibility();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drive, userProfile, extractedSkills]);

  const checkEligibility = () => {
    const checks = [];
    let failedChecks = 0;

    // Use extracted skills if available, otherwise use profile skills
    const userSkills = extractedSkills.length > 0 ? extractedSkills : (userProfile.skills || []);

    // 1. CGPA Check
    const cgpaCheck = {
      criterion: "CGPA Requirement",
      required: `${drive.minCGPA || 0} CGPA`,
      current: `${userProfile.cgpa || 0} CGPA`,
      status: (userProfile.cgpa || 0) >= (drive.minCGPA || 0),
      icon: "📊",
    };
    checks.push(cgpaCheck);
    if (!cgpaCheck.status) failedChecks++;

    // 2. Branch Check
    if (drive.eligibleBranches && drive.eligibleBranches.length > 0) {
      const branchCheck = {
        criterion: "Branch Eligibility",
        required: drive.eligibleBranches.join(", "),
        current: userProfile.branch || "Not specified",
        status: drive.eligibleBranches.includes(userProfile.branch),
        icon: "🎓",
      };
      checks.push(branchCheck);
      if (!branchCheck.status) failedChecks++;
    }

    // 3. 10th Percentage Check
    if (drive.minTenthPercentage && drive.minTenthPercentage > 0) {
      const tenthCheck = {
        criterion: "10th Percentage",
        required: `${drive.minTenthPercentage}% minimum`,
        current: `${userProfile.tenthPercentage || 0}%`,
        status: (userProfile.tenthPercentage || 0) >= drive.minTenthPercentage,
        icon: "📚",
      };
      checks.push(tenthCheck);
      if (!tenthCheck.status) failedChecks++;
    }

    // 4. 12th Percentage Check
    if (drive.minTwelfthPercentage && drive.minTwelfthPercentage > 0) {
      const twelfthCheck = {
        criterion: "12th Percentage",
        required: `${drive.minTwelfthPercentage}% minimum`,
        current: `${userProfile.twelfthPercentage || 0}%`,
        status: (userProfile.twelfthPercentage || 0) >= drive.minTwelfthPercentage,
        icon: "📖",
      };
      checks.push(twelfthCheck);
      if (!twelfthCheck.status) failedChecks++;
    }

    // 5. Backlog Check
    if (drive.backlogsAllowed !== undefined) {
      if (!drive.backlogsAllowed) {
        const backlogCheck = {
          criterion: "Backlog Policy",
          required: "No active backlogs",
          current: `${userProfile.activeBacklogs || 0} backlogs`,
          status: (userProfile.activeBacklogs || 0) === 0,
          icon: "🚫",
        };
        checks.push(backlogCheck);
        if (!backlogCheck.status) failedChecks++;
      } else if (drive.maxBacklogsAllowed !== undefined) {
        const backlogCheck = {
          criterion: "Backlog Policy",
          required: `Maximum ${drive.maxBacklogsAllowed} backlogs`,
          current: `${userProfile.activeBacklogs || 0} backlogs`,
          status: (userProfile.activeBacklogs || 0) <= drive.maxBacklogsAllowed,
          icon: "⚠️",
        };
        checks.push(backlogCheck);
        if (!backlogCheck.status) failedChecks++;
      }
    }

    // 6. Year Eligibility Check
    if (drive.eligibleYears && drive.eligibleYears.length > 0) {
      const yearCheck = {
        criterion: "Year Eligibility",
        required: drive.eligibleYears.map(y => `${y}${getOrdinalSuffix(y)} Year`).join(", "),
        current: `${userProfile.currentYear || 0}${getOrdinalSuffix(userProfile.currentYear || 0)} Year`,
        status: drive.eligibleYears.includes(userProfile.currentYear),
        icon: "📅",
      };
      checks.push(yearCheck);
      if (!yearCheck.status) failedChecks++;
    }

    // 7. Skills Match Analysis
    const requiredSkills = drive.requiredSkills || [];
    const matchedSkills = requiredSkills.filter(reqSkill =>
      userSkills.some(userSkill =>
        userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
    const missingSkills = requiredSkills.filter(reqSkill =>
      !userSkills.some(userSkill =>
        userSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
        reqSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    const skillMatchPercentage = requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 100;

    const skillCheck = {
      criterion: "Skills Match",
      required: requiredSkills.join(", "),
      current: `${matchedSkills.length}/${requiredSkills.length} skills matched`,
      status: matchedSkills.length > 0,
      icon: "💻",
      details: {
        matched: matchedSkills,
        missing: missingSkills,
        percentage: skillMatchPercentage,
      },
    };
    checks.push(skillCheck);

    // Calculate overall score
    const totalChecks = checks.length;
    const passedChecks = totalChecks - failedChecks;
    const overallScore = Math.round((passedChecks / totalChecks) * 100);

    setEligibility({
      isEligible: failedChecks === 0,
      checks,
      score: overallScore,
      skillMatch: skillMatchPercentage,
    });
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  if (!drive || !userProfile) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Overall Eligibility Status */}
      <div className={`rounded-xl p-6 shadow-lg ${
        eligibility.isEligible
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
          : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-300'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                eligibility.isEligible ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {eligibility.isEligible ? (
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${
                  eligibility.isEligible ? 'text-green-800' : 'text-red-800'
                }`}>
                  {eligibility.isEligible ? 'You are Eligible! ✅' : 'Not Eligible ❌'}
                </h3>
                <p className={`text-sm ${
                  eligibility.isEligible ? 'text-green-700' : 'text-red-700'
                }`}>
                  {eligibility.isEligible
                    ? 'You meet all the requirements for this drive'
                    : 'You do not meet some requirements for this drive'
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Score Badge */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${
              eligibility.score >= 80 ? 'text-green-600' :
              eligibility.score >= 50 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {eligibility.score}%
            </div>
            <p className="text-xs text-secondary-600 font-medium">Match Score</p>
          </div>
        </div>

        {/* Skills Match Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className={eligibility.isEligible ? 'text-green-800' : 'text-red-800'}>
              Skills Match
            </span>
            <span className={eligibility.isEligible ? 'text-green-700' : 'text-red-700'}>
              {eligibility.skillMatch}%
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                eligibility.skillMatch >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                eligibility.skillMatch >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${eligibility.skillMatch}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Detailed Checks */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Eligibility Criteria Breakdown
        </h4>
        
        <div className="space-y-3">
          {eligibility.checks.map((check, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                check.status
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-2xl">{check.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-semibold text-secondary-900">{check.criterion}</h5>
                      {check.status ? (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                          ✓ PASS
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                          ✗ FAIL
                        </span>
                      )}
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="text-secondary-600">
                        <span className="font-medium">Required:</span> {check.required}
                      </p>
                      <p className={check.status ? 'text-green-700' : 'text-red-700'}>
                        <span className="font-medium">Your Profile:</span> {check.current}
                      </p>
                    </div>

                    {/* Skills Details */}
                    {check.details && (
                      <div className="mt-3 space-y-2">
                        {check.details.matched.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-green-700 mb-1">
                              ✓ Matched Skills ({check.details.matched.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {check.details.matched.map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {check.details.missing.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-700 mb-1">
                              ✗ Missing Skills ({check.details.missing.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {check.details.missing.map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {!eligibility.isEligible && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5">
          <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Recommendations
          </h4>
          <ul className="space-y-2 text-sm text-blue-900">
            {eligibility.checks.filter(c => !c.status).map((check, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>{check.criterion}:</strong> You need to meet the requirement of {check.required}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default EligibilityChecker;
