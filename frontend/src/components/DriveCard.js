function DriveCard({ drive, onApply }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition">
      <h3 className="text-xl font-bold mb-2">{drive.companyName}</h3>
      <p className="text-gray-600">Min CGPA: {drive.minCGPA}</p>
      <p className="text-gray-600">Package: {drive.package} LPA</p>

      {onApply && (
        <button
          onClick={() => onApply(drive._id)}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Apply
        </button>
      )}
    </div>
  );
}

export default DriveCard;