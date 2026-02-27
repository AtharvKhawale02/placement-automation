import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between">
      <h1 className="font-bold text-xl text-indigo-600">
        PlacementAI
      </h1>

      <div className="space-x-4">
        <Link to="/dashboard" className="hover:text-indigo-600">
          Dashboard
        </Link>
        <Link to="/" className="hover:text-red-500">
          Logout
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;