const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema({
  companyName: String,
  requiredSkills: [String],
  minCGPA: Number,
  package: Number,
  deadline: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Drive", driveSchema);