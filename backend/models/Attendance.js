
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    guardId: { type: String, required: true },
    guardName: { type: String, required: true },
    site: { type: String, required: true },
    date: { type: String, required: true },
    shift: { type: String, default: "Day / दिवस" },
    checkIn: { type: String, default: "" },
    checkOut: { type: String, default: "" },
    status: { type: String, required: true },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    remarks: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
