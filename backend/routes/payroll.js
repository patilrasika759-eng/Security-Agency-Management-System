
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const payrollSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        guardId: {
            type: String,
            required: true,
            trim: true
        },
        guardName: {
            type: String,
            required: true,
            trim: true
        },
        month: {
            type: String,
            required: true
        },
        days: {
            type: Number,
            required: true,
            min: 0,
            max: 31
        },
        rate: {
            type: Number,
            required: true,
            min: 0
        },
        allowance: {
            type: Number,
            default: 0,
            min: 0
        },
        deduction: {
            type: Number,
            default: 0,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            default: "Draft / मसुदा"
        }
    },
    {
        timestamps: true
    }
);

const Payroll = mongoose.models.Payroll ||
    mongoose.model("Payroll", payrollSchema);

// GET: सर्व Payroll नोंदी मिळवा
router.get("/", async (req, res) => {
    try {
        const records = await Payroll.find().sort({ createdAt: -1 });
        res.json({ payroll: records });
    } catch (error) {
        res.status(500).json({
            message: "Payroll records मिळाले नाहीत.",
            error: error.message
        });
    }
});

// POST: नवीन Payroll नोंद Save करा
router.post("/", async (req, res) => {
    try {
        const {
            id,
            guardId,
            guardName,
            month,
            days,
            rate,
            allowance = 0,
            deduction = 0,
            status
        } = req.body;

        if (
            !id ||
            !guardId ||
            !guardName ||
            !month ||
            days === undefined ||
            rate === undefined
        ) {
            return res.status(400).json({
                message: "सर्व आवश्यक माहिती भरा."
            });
        }

        const workedDays = Number(days);
        const dailyRate = Number(rate);
        const extra = Number(allowance);
        const less = Number(deduction);

        if (
            !Number.isFinite(workedDays) ||
            !Number.isFinite(dailyRate) ||
            !Number.isFinite(extra) ||
            !Number.isFinite(less) ||
            workedDays < 0 ||
            workedDays > 31 ||
            dailyRate < 0 ||
            extra < 0 ||
            less < 0
        ) {
            return res.status(400).json({
                message: "पगाराची माहिती योग्य भरा."
            });
        }

        const total = Math.max(
            0,
            workedDays * dailyRate + extra - less
        );

        const record = await Payroll.create({
            id,
            guardId,
            guardName,
            month,
            days: workedDays,
            rate: dailyRate,
            allowance: extra,
            deduction: less,
            total,
            status
        });

        res.status(201).json({
            message: "Payroll यशस्वीपणे Save झाला.",
            data: record
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "हा Payroll ID आधीच वापरला आहे."
            });
        }

        res.status(500).json({
            message: "Payroll Save झाला नाही.",
            error: error.message
        });
    }
});

module.exports = router;
