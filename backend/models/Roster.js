const mongoose = require("mongoose");

const rosterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  guardId: { type: String, required: true },
  guardName: { type: String, required: true },
  client: { type: String, required: true },
  site: { type: String, required: true },
  date: { type: String, required: true },
  shift: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  supervisor: { type: String, required: true },
  status: { type: String, default: "Scheduled / नियोजित" }
}, { timestamps: true });

module.exports = mongoose.model("Roster", rosterSchema);