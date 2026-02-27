import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

function StudentDashboard() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedDrives, setAppliedDrives] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const drivesRes = await axios.get(
          "http://localhost:5000/api/drives/all"
        );
        setDrives(drivesRes.data);

        const appliedRes = await axios.get(
          `http://localhost:5000/api/applications/student/${user._id}`
        );
        setAppliedDrives(
          appliedRes.data.map((a) => a.drive._id)
        );
      } catch (error) {
        console.error("Error loading student data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id]);

  const applyToDrive = async (driveId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/applications/apply",
        {
          studentId: user._id,
          driveId,
        }
      );

      setAppliedDrives((prev) => [...prev, driveId]);
      alert("Applied successfully");
    } catch (error) {
      alert("Already applied or error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading drives...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-indigo-600">
          Student Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {drives.map((drive) => {
            const alreadyApplied = appliedDrives.includes(
              drive._id
            );

            return (
              <div
                key={drive._id}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition"
              >
                <h3 className="text-xl font-bold mb-2">
                  {drive.companyName}
                </h3>

                <p className="text-gray-500">
                  Min CGPA: {drive.minCGPA}
                </p>

                <p className="text-gray-500">
                  Package: ₹{drive.package} LPA
                </p>

                <button
                  onClick={() => applyToDrive(drive._id)}
                  disabled={alreadyApplied}
                  className={`mt-4 w-full px-4 py-2 rounded-lg text-white transition
                    ${
                      alreadyApplied
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }
                  `}
                >
                  {alreadyApplied ? "Applied" : "Apply"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;