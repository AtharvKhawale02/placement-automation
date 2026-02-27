const express = require("express");
const Drive = require("../models/Drive");

const router = express.Router();

router.post("/create", async (req, res) => {
  const { companyName, requiredSkills, minCGPA, package, deadline } = req.body;

  const drive = new Drive({
    companyName,
    requiredSkills,
    minCGPA,
    package,
    deadline
  });

  await drive.save();

  res.json({ message: "Drive created successfully", drive });
});

router.get("/all", async (req, res) => {
  const drives = await Drive.find();
  res.json(drives);
});

module.exports = router;