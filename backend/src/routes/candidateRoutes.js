
const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all candidate profiles
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.full_name,
                u.email,
                cp.application_number,
                cp.resume_url
            FROM users u
            INNER JOIN candidate_profiles cp
                ON cp.user_id = u.id
            WHERE u.role = 'candidate'
            ORDER BY u.id;
        `);

        res.json({
            status: "OK",
            count: result.rows.length,
            candidates: result.rows
        });
    } catch (err) {
        console.error("Failed to fetch candidates:", err.message);

        res.status(500).json({
            status: "ERROR",
            message: "Could not retrieve candidates"
        });
    }
});

module.exports = router;
