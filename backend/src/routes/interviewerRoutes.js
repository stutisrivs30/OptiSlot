
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

router.post("/", async (req, res) => {
    const { fullName, email, password, department } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
        return res.status(400).json({
            status: "ERROR",
            message: "Name, email and password are required"
        });
    }

    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const bcrypt = require("bcryptjs");
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await client.query(
            `INSERT INTO users (full_name, email, password_hash, role)
             VALUES ($1, $2, $3, 'interviewer')
             RETURNING id, full_name, email`,
            [
                fullName.trim(),
                email.trim().toLowerCase(),
                passwordHash
            ]
        );

        const interviewer = result.rows[0];

        await client.query(
            `INSERT INTO interviewer_profiles (user_id, department)
             VALUES ($1, $2)`,
            [
                interviewer.id,
                department?.trim() || null
            ]
        );

        await client.query("COMMIT");

        res.status(201).json({
            status: "OK",
            message: "Interviewer registered successfully",
            interviewer
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error("Interviewer registration failed:", error.message);

        res.status(error.code === "23505" ? 409 : 500).json({
            status: "ERROR",
            message:
                error.code === "23505"
                    ? "This email is already registered"
                    : "Interviewer registration failed"
        });

    } finally {
        if (client) {
            client.release();
        }
    }
});
// POST - Save interviewer skills
router.post("/:id/skills", async (req, res) => {
    const interviewerId = Number(req.params.id);
    const { skillIds } = req.body;

    if (
        !Number.isInteger(interviewerId) ||
        interviewerId <= 0 ||
        !Array.isArray(skillIds) ||
        skillIds.length === 0 ||
        !skillIds.every(
            (id) => Number.isInteger(id) && id > 0
        )
    ) {
        return res.status(400).json({
            status: "ERROR",
            message: "Valid interviewer ID and skill IDs are required"
        });
    }

    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const interviewer = await client.query(
            `SELECT user_id
             FROM interviewer_profiles
             WHERE user_id = $1`,
            [interviewerId]
        );

        if (interviewer.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                status: "ERROR",
                message: "Interviewer not found"
            });
        }

        const uniqueSkillIds = [...new Set(skillIds)];

        const validSkills = await client.query(
            `SELECT id
             FROM skills
             WHERE id = ANY($1::bigint[])`,
            [uniqueSkillIds]
        );

        if (validSkills.rows.length !== uniqueSkillIds.length) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                status: "ERROR",
                message: "One or more skills do not exist"
            });
        }

        await client.query(
            `DELETE FROM interviewer_skills
             WHERE interviewer_id = $1`,
            [interviewerId]
        );

        for (const skillId of uniqueSkillIds) {
            await client.query(
                `INSERT INTO interviewer_skills
                    (interviewer_id, skill_id)
                 VALUES ($1, $2)`,
                [interviewerId, skillId]
            );
        }

        await client.query("COMMIT");

        res.json({
            status: "OK",
            message: "Interviewer skills saved successfully",
            skillIds: uniqueSkillIds
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error(
            "Failed to save interviewer skills:",
            error.message
        );

        res.status(500).json({
            status: "ERROR",
            message: "Could not save interviewer skills"
        });

    } finally {
        if (client) {
            client.release();
        }
    }
});
module.exports = router;
