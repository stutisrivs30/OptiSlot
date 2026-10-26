
const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all interviewer availability slots
router.get("/interviewers", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id AS slot_id,
                a.interviewer_id,
                u.full_name AS interviewer_name,
                a.start_time,
                a.end_time,
                a.status
            FROM availability_slots a
            INNER JOIN interviewer_profiles ip
                ON ip.user_id = a.interviewer_id
            INNER JOIN users u
                ON u.id = ip.user_id
            ORDER BY a.start_time;
        `);

        res.json({
            status: "OK",
            count: result.rows.length,
            availability: result.rows
        });
    } catch (err) {
        console.error("Failed to fetch interviewer availability:", err.message);

        res.status(500).json({
            status: "ERROR",
            message: "Could not retrieve interviewer availability"
        });
    }
});


router.get("/candidates", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                ca.id AS availability_id,
                ca.candidate_id,
                u.full_name AS candidate_name,
                ca.start_time,
                ca.end_time
            FROM candidate_availability ca
            INNER JOIN candidate_profiles cp
                ON cp.user_id = ca.candidate_id
            INNER JOIN users u
                ON u.id = cp.user_id
            ORDER BY ca.start_time;
        `);

        res.json({
            status: "OK",
            count: result.rows.length,
            availability: result.rows
        });
    } catch (err) {
        console.error("Failed to fetch candidate availability:", err.message);

        res.status(500).json({
            status: "ERROR",
            message: "Could not retrieve candidate availability"
        });
    }
});

// POST - Add interviewer availability
router.post("/interviewers", async (req, res) => {
    const { interviewerId, startTime, endTime } = req.body;

    if (!interviewerId || !startTime || !endTime) {
        return res.status(400).json({
            status: "ERROR",
            message: "Interviewer ID, start time and end time are required"
        });
    }

    if (
        !Number.isInteger(Number(interviewerId)) ||
        Number(interviewerId) <= 0 ||
        !Number.isFinite(Date.parse(startTime)) ||
        !Number.isFinite(Date.parse(endTime)) ||
        new Date(startTime) >= new Date(endTime)
    ) {
        return res.status(400).json({
            status: "ERROR",
            message: "Please provide a valid interviewer ID and time range"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO availability_slots
                (interviewer_id, start_time, end_time, status)
             VALUES ($1, $2, $3, 'available')
             RETURNING *`,
            [
                Number(interviewerId),
                startTime,
                endTime
            ]
        );

        res.status(201).json({
            status: "OK",
            message: "Interviewer availability saved successfully",
            availability: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Failed to save interviewer availability:",
            error.message
        );

        res.status(500).json({
            status: "ERROR",
            message: "Could not save interviewer availability"
        });
    }
});
// POST - Save candidate availability
router.post("/candidates", async (req, res) => {
    const { candidateId, startTime, endTime } = req.body;

    if (!candidateId || !startTime || !endTime) {
        return res.status(400).json({
            status: "ERROR",
            message: "Candidate ID, start time and end time are required"
        });
    }

    if (
        !Number.isInteger(Number(candidateId)) ||
        Number(candidateId) <= 0 ||
        !Number.isFinite(Date.parse(startTime)) ||
        !Number.isFinite(Date.parse(endTime)) ||
        new Date(startTime) >= new Date(endTime)
    ) {
        return res.status(400).json({
            status: "ERROR",
            message: "Please provide a valid candidate ID and time range"
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO candidate_availability
                (candidate_id, start_time, end_time)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                Number(candidateId),
                startTime,
                endTime
            ]
        );

        res.status(201).json({
            status: "OK",
            message: "Candidate availability saved successfully",
            availability: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Failed to save candidate availability:",
            error.message
        );

        res.status(500).json({
            status: "ERROR",
            message: "Could not save candidate availability"
        });
    }
});
module.exports = router;
