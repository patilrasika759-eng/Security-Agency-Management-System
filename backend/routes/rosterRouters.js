
const express = require("express");
const router = express.Router();
const Roster = require("../models/Roster");

router.get("/", async (req, res) => {
  try {
    const data = await Roster.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const roster = await Roster.create(req.body);
    res.status(201).json({
      success: true,
      message: "Roster saved successfully",
      data: roster
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
