
const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                u.id,
                u.full_name,
                u.email,
                ip.department,
                COALESCE(
                    ARRAY_AGG(s.name ORDER BY s.name)
                    FILTER (WHERE s.name IS NOT NULL),
                    ARRAY[]::VARCHAR[]
                ) AS skills
            FROM users u
            INNER JOIN interviewer_profiles ip
                ON ip.user_id = u.id
            LEFT JOIN interviewer_skills isk
                ON isk.interviewer_id = ip.user_id
            LEFT JOIN skills s
                ON s.id = isk.skill_id
            WHERE u.role = 'interviewer'
            GROUP BY
                u.id,
                u.full_name,
                u.email,
                ip.department
            ORDER BY u.id;
        `);

        res.json({
            status: "OK",
            count: result.rows.length,
            interviewers: result.rows
        });
    } catch (err) {
        console.error("Failed to fetch interviewers:", err.message);

        res.status(500).json({
            status: "ERROR",
            message: "Could not retrieve interviewers"
        });
    }
});

module.exports = router;
