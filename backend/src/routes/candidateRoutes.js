
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

// POST - Register a new candidate
router.post("/", async (req, res) => {
    const { fullName, email, password, applicationNumber } = req.body;

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
             VALUES ($1, $2, $3, 'candidate')
             RETURNING id, full_name, email`,
            [fullName.trim(), email.trim().toLowerCase(), passwordHash]
        );

        const candidate = result.rows[0];

        await client.query(
            `INSERT INTO candidate_profiles (user_id, application_number)
             VALUES ($1, $2)`,
            [candidate.id, applicationNumber?.trim() || null]
        );

        await client.query("COMMIT");

        res.status(201).json({
            status: "OK",
            message: "Candidate registered successfully",
            candidate
        });

    } catch (error) {
        if (client) await client.query("ROLLBACK");

        console.error("Registration failed:", error.message);

        res.status(error.code === "23505" ? 409 : 500).json({
            status: "ERROR",
            message: error.code === "23505"
                ? "Email or application number already exists"
                : "Candidate registration failed"
        });

    } finally {
        if (client) client.release();
    }
});
// POST - Save candidate skills
router.post("/:id/skills", async (req, res) => {
    const candidateId = Number(req.params.id);
    const { skillIds } = req.body;

    if (
        !Number.isInteger(candidateId) ||
        candidateId <= 0 ||
        !Array.isArray(skillIds) ||
        skillIds.length === 0 ||
        !skillIds.every(
            (id) => Number.isInteger(id) && id > 0
        )
    ) {
        return res.status(400).json({
            status: "ERROR",
            message: "Valid candidate ID and skill IDs are required"
        });
    }

    let client;

    try {
        client = await pool.connect();
        await client.query("BEGIN");

        const candidate = await client.query(
            `SELECT user_id
             FROM candidate_profiles
             WHERE user_id = $1`,
            [candidateId]
        );

        if (candidate.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                status: "ERROR",
                message: "Candidate not found"
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
            `DELETE FROM candidate_skills
             WHERE candidate_id = $1`,
            [candidateId]
        );

        for (const skillId of uniqueSkillIds) {
            await client.query(
                `INSERT INTO candidate_skills
                    (candidate_id, skill_id)
                 VALUES ($1, $2)`,
                [candidateId, skillId]
            );
        }

        await client.query("COMMIT");

        res.json({
            status: "OK",
            message: "Candidate skills saved successfully",
            skillIds: uniqueSkillIds
        });

    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
        }

        console.error(
            "Failed to save candidate skills:",
            error.message
        );

        res.status(500).json({
            status: "ERROR",
            message: "Could not save candidate skills"
        });

    } finally {
        if (client) {
            client.release();
        }
    }
});
module.exports = router;
