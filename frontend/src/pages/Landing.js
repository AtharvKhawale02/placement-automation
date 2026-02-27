import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
      <div className="flex flex-col items-center justify-center h-screen text-center px-6">
        <h1 className="text-5xl font-bold mb-6">
          Smart Placement Automation Platform
        </h1>

        <p className="text-lg max-w-2xl mb-8">
          Automate placement management with intelligent candidate filtering,
          skill-based ranking, and real-time analytics dashboards.
        </p>

        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-black px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Landing;