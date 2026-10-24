
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



module.exports = router;
