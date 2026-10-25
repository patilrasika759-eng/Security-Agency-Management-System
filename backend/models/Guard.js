
const mongoose = require("mongoose");

const guardSchema = new mongoose.Schema(
    {
        guardId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        address: {
            type: String,
            trim: true
        },
        joiningDate: {
            type: Date,
            default: Date.now
        },
        salary: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Guard", guardSchema);
