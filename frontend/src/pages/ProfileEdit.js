import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ResumeUpload from "../components/ResumeUpload";

function ProfileEdit() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    name: user.name || "",
    cgpa: "",
    skills: "",
    branch: "",
    tenthPercentage: "",
    twelfthPercentage: "",
    diploma: "",
    activeBacklogs: "",
    totalBacklogs: "",
    currentYear: "",
    internships: [],
  });

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [newInternship, setNewInternship] = useState({
    company: "",
    role: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/api/users/profile/${user._id}`);
      setFormData({
        name: res.data.name || "",
        cgpa: res.data.cgpa || "",
        skills: res.data.skills ? res.data.skills.join(", ") : "",
        branch: res.data.branch || "",
        tenthPercentage: res.data.tenthPercentage || "",
        twelfthPercentage: res.data.twelfthPercentage || "",
        diploma: res.data.diploma || "",
        activeBacklogs: res.data.activeBacklogs || "",
        totalBacklogs: res.data.totalBacklogs || "",
        currentYear: res.data.currentYear || "",
        internships: res.data.internships || [],
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResumeKeywordsExtracted = (keywords, text, file) => {
    setExtractedSkills(keywords);
    setResumeFile(file);
    
    // Merge extracted skills with existing skills
    const existingSkills = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [];
    const allSkills = [...new Set([...existingSkills, ...keywords])];
    
    setFormData({
      ...formData,
      skills: allSkills.join(", "),
    });
  };

  const handleAddInternship = () => {
    if (newInternship.company && newInternship.role && newInternship.duration) {
      setFormData({
        ...formData,
        internships: [...formData.internships, newInternship],
      });
      setNewInternship({ company: "", role: "", duration: "", description: "" });
      setShowInternshipForm(false);
    }
  };

  const handleRemoveInternship = (index) => {
    setFormData({
      ...formData,
      internships: formData.internships.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Convert skills string to array
      const skillsArray = formData.skills
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const updateData = {
        name: formData.name,
        cgpa: parseFloat(formData.cgpa),
        skills: skillsArray,
        branch: formData.branch,
        tenthPercentage: parseFloat(formData.tenthPercentage),
        twelfthPercentage: parseFloat(formData.twelfthPercentage),
        diploma: formData.diploma,
        activeBacklogs: parseInt(formData.activeBacklogs) || 0,
        totalBacklogs: parseInt(formData.totalBacklogs) || 0,
        currentYear: parseInt(formData.currentYear) || 1,
        internships: formData.internships,
      };

      // If resume file exists, you can upload it here
      // For now, we'll just save the filename
      if (resumeFile) {
        updateData.resume = resumeFile.name;
      }

      const res = await API.put(
        `/api/users/profile/${user._id}`,
        updateData
      );

      // Update localStorage
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-20 right-6 bg-accent-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-down';
      notification.innerHTML = '<div class="flex items-center"><svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg><span class="font-semibold">Profile updated successfully!</span></div>';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      // Navigate back to dashboard
      setTimeout(() => navigate("/student"), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8 animate-slide-down">
          <button
            onClick={() => navigate("/student")}
            className="flex items-center text-primary-600 hover:text-primary-700 font-semibold mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Edit Profile</h1>
              <p className="text-secondary-600">Update your academic details and skills</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 animate-scale-in">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 text-sm font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Full Name *
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* Resume Upload */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                  <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
                Resume Upload & Auto Skill Extraction
              </h3>
              <p className="text-sm text-secondary-600 mb-4">
                Upload your resume and AI will automatically extract your skills
              </p>
              <ResumeUpload
                onKeywordsExtracted={handleResumeKeywordsExtracted}
                currentResume={user.resume}
              />
            </div>

            {/* CGPA & Branch */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  CGPA *
                </label>
                <input
                  name="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="e.g., 8.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Branch *
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                >
                  <option value="">Select Branch</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Current Year & Backlogs */}
            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Current Year *
                </label>
                <select
                  name="currentYear"
                  value={formData.currentYear}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                >
                  <option value="">Select</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Active Backlogs
                </label>
                <input
                  name="activeBacklogs"
                  type="number"
                  min="0"
                  value={formData.activeBacklogs}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Total Backlogs
                </label>
                <input
                  name="totalBacklogs"
                  type="number"
                  min="0"
                  value={formData.totalBacklogs}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* 10th & 12th Percentage */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  10th Percentage *
                </label>
                <input
                  name="tenthPercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tenthPercentage}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="e.g., 85.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  12th Percentage *
                </label>
                <input
                  name="twelfthPercentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.twelfthPercentage}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  placeholder="e.g., 88.0"
                />
              </div>
            </div>

            {/* Diploma */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Diploma <span className="text-secondary-500">(Optional)</span>
              </label>
              <input
                name="diploma"
                value={formData.diploma}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="e.g., Diploma in Computer Engineering"
              />
            </div>

            {/* Skills */}
            <div>
              <label className="flex text-sm font-semibold text-secondary-700 mb-2 items-center justify-between">
                <span>Skills *</span>
                {extractedSkills.length > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ {extractedSkills.length} skills extracted from resume
                  </span>
                )}
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                placeholder="Enter skills separated by commas (e.g., JavaScript, React, Python, Java)"
              />
              <p className="text-xs text-secondary-500 mt-1">
                These skills will be used for matching with placement drives. Skills from resume are automatically added.
              </p>
            </div>

            {/* Internships Section */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  Internship Experience
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInternshipForm(!showInternshipForm)}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {showInternshipForm ? "Cancel" : "+ Add Internship"}
                </button>
              </div>
              
              {showInternshipForm && (
                <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={newInternship.company}
                      onChange={(e) => setNewInternship({...newInternship, company: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={newInternship.role}
                      onChange={(e) => setNewInternship({...newInternship, role: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Duration (months)"
                    value={newInternship.duration}
                    onChange={(e) => setNewInternship({...newInternship, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newInternship.description}
                    onChange={(e) => setNewInternship({...newInternship, description: e.target.value})}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInternship}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Add Internship
                  </button>
                </div>
              )}

              {formData.internships.length > 0 ? (
                <div className="space-y-2">
                  {formData.internships.map((internship, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-purple-200 flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-secondary-900">{internship.company}</p>
                        <p className="text-sm text-secondary-600">{internship.role} • {internship.duration} months</p>
                        {internship.description && (
                          <p className="text-xs text-secondary-500 mt-1">{internship.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveInternship(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary-600 italic">No internships added yet</p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">📊 How Your Profile is Used</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>CGPA, branch, and year determine eligibility for drives</li>
                    <li>Skills are matched against job requirements (35% weightage)</li>
                    <li>Internships boost your ranking score (15% weightage)</li>
                    <li>Academic consistency (10th & 12th) adds 10% weightage</li>
                    <li>Resume skills are automatically extracted and added</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/student")}
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEdit;
