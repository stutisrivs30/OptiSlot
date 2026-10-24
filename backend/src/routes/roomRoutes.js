
const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET all rooms
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                r.id,
                r.name,
                r.capacity
            FROM rooms r
            ORDER BY r.id;
        `);

        res.json({
            status: "OK",
            count: result.rows.length,
            rooms: result.rows
        });
    } catch (err) {
        console.error("Failed to fetch rooms:", err.message);

        res.status(500).json({
            status: "ERROR",
            message: "Could not retrieve rooms"
        });
    }
});

module.exports = router;
