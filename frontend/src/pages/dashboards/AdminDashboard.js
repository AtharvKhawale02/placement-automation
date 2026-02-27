import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import StatsCard from "../../components/StatsCard";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDrives: 0,
    placedStudents: 0,
  });

  const [drives, setDrives] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchDrives();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/stats"
      );
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats");
    }
  };

  const fetchDrives = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/drives/all"
      );
      setDrives(res.data);
    } catch (error) {
      console.error("Error fetching drives");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-indigo-600">
          Placement Dashboard
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
          />
          <StatsCard
            title="Total Drives"
            value={stats.totalDrives}
          />
          <StatsCard
            title="Placed Students"
            value={stats.placedStudents}
          />
        </div>

        {/* Drives Section */}
        <h3 className="text-2xl font-semibold mb-4">
          Active Placement Drives
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((drive) => (
            <div
              key={drive._id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <h4 className="text-xl font-bold mb-2">
                {drive.companyName}
              </h4>
              <p className="text-gray-600">
                Min CGPA: {drive.minCGPA}
              </p>
              <p className="text-gray-600">
                Package: ₹{drive.package} LPA
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Deadline:{" "}
                {new Date(drive.deadline).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;