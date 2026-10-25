
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const app = express();

/* =====================================
   ENVIRONMENT CONFIGURATION
===================================== */

const envPath = path.join(__dirname, ".env");

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("ERROR: backend/.env file not found.");
    process.exit(1);
}

/* =====================================
   MIDDLEWARE
===================================== */

app.use(cors());
app.use(express.json());

/* =====================================
   API ROUTES
===================================== */

app.use("/api/guards", require("./routes/guardRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/rosters", require("./routes/rosterRouters"));
app.use("/api/clients", require("./routes/clientsRoutes"));
app.use("/api/incidents", require("./routes/incidents"));
app.use("/api/payroll", require("./routes/payroll"));

/* =====================================
   DEMO USERS
===================================== */

const demoUsers = {
    Admin: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
    },
    Staff: {
        email: process.env.STAFF_EMAIL,
        password: process.env.STAFF_PASSWORD
    },
    Client: {
        email: process.env.CLIENT_EMAIL,
        password: process.env.CLIENT_PASSWORD
    }
};

/* =====================================
   TOKEN CREATION
===================================== */

function createToken(user) {
    const payload = {
        id: String(user._id || user.email),
        email: user.email,
        role: user.role,
        time: Date.now()
    };

    const encodedPayload = Buffer
        .from(JSON.stringify(payload))
        .toString("base64url");

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is missing in backend/.env");
    }

    const signature = crypto
        .createHmac("sha256", secret)
        .update(encodedPayload)
        .digest("base64url");

    return `${encodedPayload}.${signature}`;
}

/* =====================================
   REGISTER
===================================== */

app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Name, email, password and role are required."
            });
        }

        if (!["Staff", "Client"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Only Staff and Client registration is allowed."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash: hashedPassword,
            role
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/* =====================================
   LOGIN
===================================== */

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Email, password and role are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = null;

        if (
            role === "Admin" &&
            normalizedEmail ===
                String(demoUsers.Admin.email || "")
                    .trim()
                    .toLowerCase() &&
            password === demoUsers.Admin.password
        ) {
            user = {
                email: normalizedEmail,
                role: "Admin",
                name: "Admin"
            };
        } else if (["Staff", "Client"].includes(role)) {
            const dbUser = await User.findOne({
                email: normalizedEmail,
                role
            });

            if (dbUser) {
                const passwordMatches = await bcrypt.compare(
                    password,
                    dbUser.passwordHash
                );

                if (passwordMatches) {
                    user = {
                        _id: dbUser._id,
                        email: dbUser.email,
                        role: dbUser.role,
                        name: dbUser.name
                    };
                }
            }

            if (!user) {
                const demo = demoUsers[role];

                if (
                    demo.email &&
                    demo.password &&
                    normalizedEmail ===
                        String(demo.email).trim().toLowerCase() &&
                    password === demo.password
                ) {
                    user = {
                        email: normalizedEmail,
                        role,
                        name: role
                    };
                }
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email, password or role."
            });
        }

        const token = createToken(user);

        return res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id || user.email,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Login failed. Please check backend logs."
        });
    }
});

/* =====================================
   ROOT AND HEALTH CHECK
===================================== */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Security Agency Management System backend is running."
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        mongodb:
            mongoose.connection.readyState === 1
                ? "connected"
                : "disconnected"
    });
});

/* =====================================
   DATABASE AND SERVER STARTUP
===================================== */

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI is missing in backend/.env");
    process.exit(1);
}

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully.");

        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        });
    })
    .catch(error => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
        process.exit(1);
    });
