
const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

// सर्व Attendance Records मिळवणे
router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// नवीन Attendance सेव्ह करणे
router.post("/", async (req, res) => {
  try {
    const record = await Attendance.create(req.body);
    res.status(201).json({
      success: true,
      message: "Attendance saved successfully",
      data: record
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
