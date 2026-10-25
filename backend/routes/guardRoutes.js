
const express = require("express");
const router = express.Router();
const Guard = require("../models/Guard");

// Get all guards
router.get("/", async (req, res) => {
    try {
        const guards = await Guard.find().sort({ createdAt: -1 });
        res.json({ success: true, data: guards });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add a guard
router.post("/", async (req, res) => {
    try {
        const guard = await Guard.create(req.body);
        res.status(201).json({
            success: true,
            message: "Guard added successfully",
            data: guard
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Update a guard
router.put("/:id", async (req, res) => {
    try {
        const guard = await Guard.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!guard) {
            return res.status(404).json({
                success: false,
                message: "Guard not found"
            });
        }

        res.json({
            success: true,
            message: "Guard updated successfully",
            data: guard
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a guard
router.delete("/:id", async (req, res) => {
    try {
        const guard = await Guard.findByIdAndDelete(req.params.id);

        if (!guard) {
            return res.status(404).json({
                success: false,
                message: "Guard not found"
            });
        }

        res.json({
            success: true,
            message: "Guard deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
