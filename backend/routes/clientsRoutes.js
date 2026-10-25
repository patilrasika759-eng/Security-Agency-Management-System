
const express = require("express");
const router = express.Router();
const Client = require("../models/Clients");

// Get all clients
router.get("/", async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        res.json({ success: true, data: clients });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add a client
router.post("/", async (req, res) => {
    try {
        const client = await Client.create(req.body);
        res.status(201).json({
            success: true,
            message: "Client added successfully",
            data: client
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Update a client
router.put("/:id", async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }

        res.json({
            success: true,
            message: "Client updated successfully",
            data: client
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Delete a client
router.delete("/:id", async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Client not found"
            });
        }

        res.json({
            success: true,
            message: "Client deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
