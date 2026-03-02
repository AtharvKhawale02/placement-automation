import { useState } from "react";
import API from "../services/api";

function CreateDriveForm({ onClose, onSuccess }) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    jobDescription: "",
    role: "",
    requiredSkills: "",
    minCGPA: "",
    eligibleBranches: "",
    minTenthPercentage: "",
    minTwelfthPercentage: "",
    diplomaRequired: false,
    package: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Convert skills string to array
      const skillsArray = formData.requiredSkills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Convert branches string to array
      const branchesArray = formData.eligibleBranches
        .split(",")
        .map(b => b.trim())
        .filter(b => b.length > 0);

      const driveData = {
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        jobDescription: formData.jobDescription,
        role: formData.role,
        requiredSkills: skillsArray,
        minCGPA: parseFloat(formData.minCGPA),
        eligibleBranches: branchesArray,
        minTenthPercentage: parseFloat(formData.minTenthPercentage) || 0,
        minTwelfthPercentage: parseFloat(formData.minTwelfthPercentage) || 0,
        diplomaRequired: formData.diplomaRequired,
        package: parseInt(formData.package),
        deadline: formData.deadline,
        createdBy: user._id,
      };

      await API.post("/api/drives/create", driveData);

      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-6 bg-accent-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-down';
      notification.innerHTML = '<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="font-semibold">Drive created successfully!</span></div>';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating drive");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary-900">Create Placement Drive</h2>
                <p className="text-sm text-secondary-600">Add a new job opportunity</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-secondary-500 hover:text-secondary-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 text-sm font-semibold">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            {/* Company Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Company Name *
              </label>
              <input
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., Google, Microsoft"
              />
            </div>

            {/* Company Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Company Email *
              </label>
              <input
                name="companyEmail"
                type="email"
                value={formData.companyEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., hr@company.com"
              />
            </div>

            {/* Role */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Job Role *
              </label>
              <input
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., Software Engineer, Data Analyst"
              />
            </div>

            {/* Job Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Job Description *
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="Describe the job role, responsibilities, and requirements..."
              />
            </div>

            {/* Min CGPA */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Minimum CGPA *
              </label>
              <input
                name="minCGPA"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.minCGPA}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., 7.5"
              />
            </div>

            {/* Package */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Package (LPA) *
              </label>
              <input
                name="package"
                type="number"
                min="0"
                value={formData.package}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., 12"
              />
            </div>

            {/* Eligible Branches */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Eligible Branches
              </label>
              <input
                name="eligibleBranches"
                value={formData.eligibleBranches}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., Computer Science, IT, Electronics (comma-separated, leave blank for all branches)"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Leave blank to allow all branches
              </p>
            </div>

            {/* Min 10th Percentage */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Min 10th Percentage
              </label>
              <input
                name="minTenthPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.minTenthPercentage}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., 75.0"
              />
            </div>

            {/* Min 12th Percentage */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Min 12th Percentage
              </label>
              <input
                name="minTwelfthPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.minTwelfthPercentage}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., 75.0"
              />
            </div>

            {/* Diploma Required */}
            <div className="md:col-span-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="diplomaRequired"
                  checked={formData.diplomaRequired}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-semibold text-secondary-700">
                  Diploma Required
                </span>
              </label>
              <p className="text-xs text-secondary-500 mt-1 ml-8">
                Check this if diploma is mandatory for this drive
              </p>
            </div>

            {/* Deadline */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Application Deadline *
              </label>
              <input
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
              />
            </div>

            {/* Required Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Required Skills *
              </label>
              <textarea
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
              />
              <p className="text-xs text-secondary-500 mt-1">
                Separate multiple skills with commas
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-secondary-700 rounded-lg font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                "Create Drive"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDriveForm;
