const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["student", "admin"]
  },
  branch: String,
  cgpa: Number,
  skills: [String]
});

module.exports = mongoose.model("User", userSchema);