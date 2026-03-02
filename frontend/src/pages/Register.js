import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    cgpa: "",
    branch: "",
    skills: "",
    tenthPercentage: "",
    twelfthPercentage: "",
    diploma: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    { 
      value: "student", 
      label: "Student", 
      description: "Access placement drives and apply"
    },
    { 
      value: "admin", 
      label: "Placement Cell", 
      description: "Manage drives and analytics"
    },
    { 
      value: "company", 
      label: "Company/Recruiter", 
      description: "Post jobs and review candidates"
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = { ...formData };
      
      // For students, convert skills string to array and parse numbers
      if (formData.role === "student") {
        submitData.skills = formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill);
        submitData.cgpa = parseFloat(formData.cgpa) || 0;
        submitData.tenthPercentage = parseFloat(formData.tenthPercentage) || 0;
        submitData.twelfthPercentage = parseFloat(formData.twelfthPercentage) || 0;
      }

      await API.post(
        "/api/auth/register",
        submitData
      );

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-primary-50 to-secondary-50 px-4 py-12">
      {/* Register Form */}
      <div className="w-full max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 md:p-10 rounded-lg shadow-xl border border-gray-100 animate-scale-in"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-600 rounded-lg mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Create Account
            </h2>
            <p className="text-secondary-600">Join the placement automation platform</p>
          </div>

          {/* Error Message */}
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

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Full Name
              </label>
              <input
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-secondary-700 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-200 transition-all"
            />
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-secondary-700 mb-3">
              Select Your Role
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    formData.role === role.value ? 'transform scale-105' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`p-5 rounded-lg border-2 transition-all ${
                      formData.role === role.value
                        ? 'border-accent-500 bg-accent-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-accent-300'
                    }`}
                  >
                    <div className={`w-10 h-10 mb-3 rounded flex items-center justify-center ${
                      formData.role === role.value
                        ? 'bg-accent-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {role.value === 'student' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                      )}
                      {role.value === 'admin' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      )}
                      {role.value === 'company' && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-semibold text-secondary-900 mb-1">{role.label}</h3>
                    <p className="text-xs text-secondary-600">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Fields for Students */}
          {formData.role === "student" && (
            <div className="mb-6 p-6 bg-primary-50 rounded-lg border-2 border-primary-200 animate-fade-in">
              <h3 className="text-lg font-bold text-secondary-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Student Academic Details (Required)
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* CGPA */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    CGPA <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g., 8.5"
                    value={formData.cgpa}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  />
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    Branch <span className="text-red-500">*</span>
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

                {/* 10th Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    10th Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="tenthPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 85.5"
                    value={formData.tenthPercentage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  />
                </div>

                {/* 12th Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    12th Percentage <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="twelfthPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="e.g., 88.0"
                    value={formData.twelfthPercentage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Skills <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="skills"
                  rows="3"
                  placeholder="e.g., Java, Python, React, SQL (comma-separated)"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
                <p className="text-xs text-secondary-500 mt-1">Enter your skills separated by commas</p>
              </div>

              {/* Diploma (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Diploma <span className="text-secondary-500">(Optional)</span>
                </label>
                <input
                  name="diploma"
                  type="text"
                  placeholder="e.g., Diploma in Computer Engineering"
                  value={formData.diploma}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
              </div>
            </div>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-600 hover:bg-accent-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mb-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-secondary-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-secondary-500 hover:text-primary-600 transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;