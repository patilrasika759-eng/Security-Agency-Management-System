
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
    {
        clientId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        contactPerson: {
            type: String,
            trim: true,
            default: ""
        },
        phone: {
            type: String,
            trim: true,
            default: ""
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: ""
        },
        address: {
            type: String,
            trim: true,
            default: ""
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
