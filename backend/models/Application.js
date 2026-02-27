const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  drive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Drive"
  },
  matchScore: Number,
  status: {
    type: String,
    default: "Applied"
  }
});

module.exports = mongoose.model("Application", applicationSchema);