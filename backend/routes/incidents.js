
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
    {
        id: { type: String, required: true, trim: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        site: { type: String, required: true, trim: true },
        reportedBy: { type: String, required: true, trim: true },
        guardId: { type: String, default: "" },
        type: { type: String, required: true },
        priority: { type: String, default: "Medium / मध्यम" },
        status: { type: String, default: "Open / सुरू" },
        details: { type: String, required: true },
        action: { type: String, default: "" }
    },
    { timestamps: true }
);

const Incident =
    mongoose.models.Incident ||
    mongoose.model("Incident", incidentSchema);

// GET: सर्व Incident records
router.get("/", async (req, res) => {
    try {
        const incidents = await Incident.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: incidents
        });
    } catch (error) {
        console.error("Load incidents error:", error);
        res.status(500).json({
            success: false,
            message: "Incident records load करता आले नाहीत."
        });
    }
});

// POST: नवीन Incident सेव्ह करा
router.post("/", async (req, res) => {
    try {
        const {
            id, date, time, site, reportedBy,
            guardId, type, priority, status, details, action
        } = req.body;

        if (!id || !date || !time || !site ||
            !reportedBy || !type || !details) {
            return res.status(400).json({
                success: false,
                message: "सर्व आवश्यक माहिती भरा."
            });
        }

        const existing = await Incident.findOne({ id: id.trim() });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "हा Incident ID आधीच वापरला आहे."
            });
        }

        const incident = await Incident.create({
            id: id.trim(),
            date,
            time,
            site,
            reportedBy,
            guardId,
            type,
            priority,
            status,
            details,
            action
        });

        res.status(201).json({
            success: true,
            message: "Incident successfully saved.",
            data: incident
        });
    } catch (error) {
        console.error("Save incident error:", error);
        res.status(500).json({
            success: false,
            message: "Incident save करता आला नाही."
        });
    }
});

module.exports = router;
