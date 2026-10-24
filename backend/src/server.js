
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const roundRoutes = require("./routes/roundRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const interviewerRoutes = require("./routes/interviewerRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const roomRoutes = require("./routes/roomRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rounds", roundRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/interviewers", interviewerRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/schedule", scheduleRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the OptiSlot API"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "OptiSlot backend is running"
    });
});

app.get("/api/db-health", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database, NOW() AS server_time"
        );

        res.json({
            status: "OK",
            message: "PostgreSQL connected successfully",
            database: result.rows[0].database,
            serverTime: result.rows[0].server_time
        });
    } catch (err) {
        console.error("Database connection failed:", err.message);

        res.status(500).json({
            status: "ERROR",
            message: "Could not connect to PostgreSQL"
        });
    }
});

const PORT = Number(process.env.PORT || 5000);


app.listen(PORT, () => {
    console.log(`OptiSlot API running at http://localhost:${PORT}`);
});
