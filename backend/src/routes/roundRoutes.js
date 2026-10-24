
const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                r.id,
                r.name,
                r.duration_minutes,
                r.required_room_capacity,
                r.sort_order,
                COALESCE(
                    ARRAY_AGG(s.name ORDER BY s.name)
                    FILTER (WHERE s.name IS NOT NULL),
                    ARRAY[]::VARCHAR[]
                ) AS required_skills
            FROM interview_rounds r
            LEFT JOIN round_required_skills rrs
                ON r.id = rrs.round_id
            LEFT JOIN skills s
                ON rrs.skill_id = s.id
            WHERE r.is_active = TRUE
            GROUP BY
                r.id,
                r.name,
                r.duration_minutes,
                r.required_room_capacity,
                r.sort_order
            ORDER BY r.sort_order;
        `);

        res.json({
            status: "OK",
            count: result.rows.length,
            rounds: result.rows
        });
    } catch (err) {
        console.error("Failed to fetch interview rounds:", err.message);

        res.status(500).json({
            status: "ERROR",
            message: "Could not retrieve interview rounds"
        });
    }
});

module.exports = router;
