import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

function CompanyDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/applications/company/${user._id}`
      );
      setApplications(res.data);
    } catch (error) {
      console.error("Error fetching applications", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/status/${applicationId}`,
        { status }
      );

      // Update UI instantly (no refetch)
      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId
            ? { ...app, status }
            : app
        )
      );
    } catch (error) {
      alert("Error updating status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-indigo-600">
          Recruiter Dashboard
        </h2>

        {loading && (
          <p className="text-gray-500">Loading applications...</p>
        )}

        {!loading && applications.length === 0 && (
          <p className="text-gray-500">
            No applications received yet.
          </p>
        )}

        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center md:justify-between hover:shadow-lg transition"
            >
              {/* Student Info */}
              <div>
                <h3 className="text-xl font-semibold">
                  {app.student.name}
                </h3>
                <p className="text-gray-600">
                  Match Score:{" "}
                  <span className="font-bold text-indigo-600">
                    {app.matchScore}%
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className="font-semibold">
                    {app.status}
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 md:mt-0 space-x-3">
                <button
                  onClick={() =>
                    updateStatus(app._id, "shortlisted")
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  disabled={app.status === "shortlisted"}
                >
                  Shortlist
                </button>

                <button
                  onClick={() =>
                    updateStatus(app._id, "rejected")
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  disabled={app.status === "rejected"}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;