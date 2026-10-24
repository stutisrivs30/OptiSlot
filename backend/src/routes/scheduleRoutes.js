
const express = require("express");
const pool = require("../db");
const { loadSchedulerData } = require("../scheduler/loadSchedulerData");
const {
    generateSchedule,
    getAvailableSlots
} = require("../scheduler/scheduler");

const router = express.Router();

async function getExistingSchedule(db = pool) {
    const result = await db.query(`
        SELECT
            i.id AS "databaseId",
            i.candidate_id AS "candidateId",
            i.interviewer_id AS "interviewerId",
            i.room_id AS "roomId",
            i.round_id AS "roundId",
            i.start_time AS start,
            i.end_time AS "end"
        FROM interviews i
        WHERE i.status = 'scheduled'
          AND i.start_time IS NOT NULL
          AND i.end_time IS NOT NULL
    `);

    return result.rows.map(row => ({
        interviewId: String(row.databaseId),
        candidateId: String(row.candidateId),
        interviewerId: String(row.interviewerId),
        roomId: row.roomId == null ? null : String(row.roomId),
        roundId: row.roundId,
        start: new Date(row.start).toISOString(),
        end: new Date(row.end).toISOString()
    }));
}

// Generate a schedule preview without saving it.
router.post("/generate", async (req, res) => {
    try {
        const data = await loadSchedulerData();
        const existingSchedule = await getExistingSchedule();

        const result = generateSchedule({
            ...data,
            existingSchedule
        });

        if (!result.success) {
            return res.status(422).json(result);
        }

        const existingIds = new Set(
            existingSchedule.map(item => item.interviewId)
        );

        const newBookings = result.schedule.filter(
            item => !existingIds.has(item.interviewId)
        );

        res.json({
            success: true,
            message: "Schedule preview generated.",
            nodesVisited: result.nodesVisited,
            count: newBookings.length,
            schedule: newBookings
        });
    } catch (error) {
        console.error("Schedule generation failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not generate the schedule."
        });
    }
});

// Retrieve saved interviews.
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                i.id,
                i.candidate_id AS "candidateId",
                cu.full_name AS "candidateName",
                i.interviewer_id AS "interviewerId",
                iu.full_name AS "interviewerName",
                i.round_id AS "roundId",
                r.name AS "roundName",
                i.room_id AS "roomId",
                rm.name AS "roomName",
                i.start_time AS start,
                i.end_time AS "end",
                i.status,
                i.meeting_link AS "meetingLink",
                i.notes
            FROM interviews i
            JOIN users cu ON cu.id = i.candidate_id
            JOIN users iu ON iu.id = i.interviewer_id
            LEFT JOIN interview_rounds r ON r.id = i.round_id
            LEFT JOIN rooms rm ON rm.id = i.room_id
            ORDER BY i.start_time NULLS LAST, i.id
        `);

        res.json({
            success: true,
            count: result.rows.length,
            interviews: result.rows
        });
    } catch (error) {
        console.error("Fetching interviews failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not fetch interviews."
        });
    }
});

// Get valid choices for a candidate's current round.
router.get("/candidates/:candidateId/slots", async (req, res) => {
    try {
        const data = await loadSchedulerData();
        const existingSchedule = await getExistingSchedule();

        const result = getAvailableSlots(
            String(req.params.candidateId),
            {
                ...data,
                schedule: existingSchedule
            }
        );

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error("Fetching candidate slots failed:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not fetch available slots."
        });
    }
});

// Confirm and save a schedule preview.
router.post("/confirm", async (req, res) => {
    const bookings = req.body.schedule;

    if (!Array.isArray(bookings) || bookings.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Provide a non-empty schedule array."
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Serialize schedule confirmations to reduce race conditions.
        await client.query(
            "SELECT pg_advisory_xact_lock($1)",
            [729104]
        );

        const saved = [];

        for (const booking of bookings) {
            const candidateId = Number(booking.candidateId);
            const interviewerId = Number(booking.interviewerId);
            const roomId = Number(booking.roomId);
            const start = new Date(booking.start);
            const end = new Date(booking.end);

            if (
                !Number.isSafeInteger(candidateId) ||
                !Number.isSafeInteger(interviewerId) ||
                !Number.isSafeInteger(roomId) ||
                !booking.roundId ||
                !Number.isFinite(start.getTime()) ||
                !Number.isFinite(end.getTime()) ||
                start >= end
            ) {
                throw new Error("Invalid booking data.");
            }

            // Lock the related resource records during validation.
            const candidate = await client.query(
                `SELECT user_id FROM candidate_profiles
                 WHERE user_id = $1 FOR UPDATE`,
                [candidateId]
            );
            const interviewer = await client.query(
                `SELECT user_id FROM interviewer_profiles
                 WHERE user_id = $1 FOR UPDATE`,
                [interviewerId]
            );
            const room = await client.query(
                `SELECT id FROM rooms WHERE id = $1 FOR UPDATE`,
                [roomId]
            );

            if (
                !candidate.rowCount ||
                !interviewer.rowCount ||
                !room.rowCount
            ) {
                throw new Error(
                    "Candidate, interviewer, or room does not exist."
                );
            }

            const roundResult = await client.query(
                `SELECT duration_minutes, required_room_capacity
                 FROM interview_rounds
                 WHERE id = $1 AND is_active = TRUE`,
                [booking.roundId]
            );

            if (!roundResult.rowCount) {
                throw new Error("The selected round is not active.");
            }

            const round = roundResult.rows[0];
            const duration = Number(round.duration_minutes) * 60000;

            if (end.getTime() - start.getTime() !== duration) {
                throw new Error("Booking duration does not match the round.");
            }

            const capacity = await client.query(
                "SELECT capacity FROM rooms WHERE id = $1",
                [roomId]
            );

            if (
                Number(capacity.rows[0].capacity) <
                Number(round.required_room_capacity)
            ) {
                throw new Error("The selected room is too small.");
            }

            // Recheck skills in the database instead of trusting the client.
            const skills = await client.query(`
                SELECT
                    NOT EXISTS (
                        SELECT 1
                        FROM round_required_skills required
                        WHERE required.round_id = $1
                          AND NOT EXISTS (
                              SELECT 1
                              FROM interviewer_skills assigned
                              JOIN skills s ON s.id = assigned.skill_id
                              WHERE assigned.interviewer_id = $2
                                AND s.id = required.skill_id
                          )
                    ) AS valid
            `, [booking.roundId, interviewerId]);

            if (!skills.rows[0].valid) {
                throw new Error(
                    "The interviewer does not have all required skills."
                );
            }

            // Check that this candidate is still waiting for this round.
            const progress = await client.query(`
                SELECT status
                FROM candidate_round_progress
                WHERE candidate_id = $1 AND round_id = $2
                FOR UPDATE
            `, [candidateId, booking.roundId]);

            if (
                progress.rowCount &&
                !["pending", "in_progress"].includes(progress.rows[0].status)
            ) {
                throw new Error(
                    "The candidate is not eligible for this round."
                );
            }

            const activeInterview = await client.query(`
                SELECT id
                FROM interviews
                WHERE status = 'scheduled'
                  AND start_time < $2
                  AND end_time > $1
                  AND (
                      candidate_id = $3
                      OR interviewer_id = $4
                      OR room_id = $5
                  )
                LIMIT 1
            `, [
                start.toISOString(),
                end.toISOString(),
                candidateId,
                interviewerId,
                roomId
            ]);

            if (activeInterview.rowCount) {
                throw new Error(
                    "A candidate, interviewer, or room is already booked."
                );
            }

            // Availability windows must fully contain the requested time.
            const availability = await client.query(`
                SELECT
                    EXISTS (
                        SELECT 1 FROM candidate_availability
                        WHERE candidate_id = $1
                          AND start_time <= $2 AND end_time >= $3
                    ) AS candidate_available,
                    EXISTS (
                        SELECT 1 FROM availability_slots
                        WHERE interviewer_id = $4
                          AND status = 'available'
                          AND start_time <= $2 AND end_time >= $3
                    ) AS interviewer_available,
                    EXISTS (
                        SELECT 1 FROM room_availability
                        WHERE room_id = $5
                          AND start_time <= $2 AND end_time >= $3
                    ) AS room_available
            `, [
                candidateId,
                start.toISOString(),
                end.toISOString(),
                interviewerId,
                roomId
            ]);

            const available = availability.rows[0];

            if (
                !available.candidate_available ||
                !available.interviewer_available ||
                !available.room_available
            ) {
                throw new Error(
                    "The selected time is outside an availability window."
                );
            }

            // Reuse an existing available slot, or create one if none exists.
const slot = await client.query(`
    INSERT INTO availability_slots
        (interviewer_id, start_time, end_time, status)
    VALUES ($1, $2, $3, 'booked')
    ON CONFLICT (interviewer_id, start_time, end_time)
    DO UPDATE SET status = 'booked'
    WHERE availability_slots.status = 'available'
    RETURNING id
`, [interviewerId, start.toISOString(), end.toISOString()]);

if (!slot.rowCount) {
    throw new Error("The selected interviewer slot is no longer available.");
}

            const interview = await client.query(`
                INSERT INTO interviews
                    (
                        candidate_id, interviewer_id, slot_id,
                        status, round_id, room_id, start_time, end_time
                    )
                VALUES ($1, $2, $3, 'scheduled', $4, $5, $6, $7)
                RETURNING id
            `, [
                candidateId,
                interviewerId,
                slot.rows[0].id,
                booking.roundId,
                roomId,
                start.toISOString(),
                end.toISOString()
            ]);

            await client.query(`
                INSERT INTO candidate_round_progress
                    (candidate_id, round_id, status, updated_at)
                VALUES ($1, $2, 'in_progress', NOW())
                ON CONFLICT (candidate_id, round_id)
                DO UPDATE SET status = 'in_progress', updated_at = NOW()
            `, [candidateId, booking.roundId]);

            saved.push({
                id: interview.rows[0].id,
                candidateId,
                interviewerId,
                roomId,
                roundId: booking.roundId,
                start: start.toISOString(),
                end: end.toISOString()
            });
        }

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Schedule confirmed and saved.",
            count: saved.length,
            interviews: saved
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Confirming schedule failed:", error.message);

        res.status(400).json({
            success: false,
            message: error.message || "Could not confirm the schedule."
        });
    } finally {
        client.release();
    }
});

// Record the outcome of a completed interview.
router.patch("/:interviewId/result", async (req, res) => {
    const outcome = req.body.outcome;

    if (!["pass", "fail"].includes(outcome)) {
        return res.status(400).json({
            success: false,
            message: 'Outcome must be "pass" or "fail".'
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const interviewResult = await client.query(`
            SELECT id, candidate_id, round_id, status
            FROM interviews
            WHERE id = $1
            FOR UPDATE
        `, [req.params.interviewId]);

        if (!interviewResult.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Interview not found."
            });
        }

        const interview = interviewResult.rows[0];

        if (
            interview.status !== "scheduled" ||
            !interview.round_id
        ) {
            await client.query("ROLLBACK");
            return res.status(409).json({
                success: false,
                message: "Interview is not eligible for a result."
            });
        }

        await client.query(`
            UPDATE interviews
            SET status = 'completed'
            WHERE id = $1
        `, [interview.id]);

        await client.query(`
            INSERT INTO candidate_round_progress
                (candidate_id, round_id, status, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (candidate_id, round_id)
            DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
        `, [
            interview.candidate_id,
            interview.round_id,
            outcome === "pass" ? "passed" : "failed"
        ]);

        let nextRound = null;

        if (outcome === "pass") {
            const next = await client.query(`
                SELECT id, name
                FROM interview_rounds
                WHERE is_active = TRUE
                  AND sort_order > (
                      SELECT sort_order
                      FROM interview_rounds
                      WHERE id = $1
                  )
                ORDER BY sort_order
                LIMIT 1
            `, [interview.round_id]);

            if (next.rowCount) {
                nextRound = next.rows[0];

                await client.query(`
                    INSERT INTO candidate_round_progress
                        (candidate_id, round_id, status, updated_at)
                    VALUES ($1, $2, 'pending', NOW())
                    ON CONFLICT (candidate_id, round_id) DO NOTHING
                `, [interview.candidate_id, nextRound.id]);
            }
        }

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Interview result recorded.",
            outcome,
            nextRound
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Recording result failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not record interview result."
        });
    } finally {
        client.release();
    }
});

// Cancel a scheduled interview.
router.patch("/:interviewId/cancel", async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await client.query(`
            SELECT id, slot_id
            FROM interviews
            WHERE id = $1 AND status = 'scheduled'
            FOR UPDATE
        `, [req.params.interviewId]);

        if (!result.rowCount) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                success: false,
                message: "Scheduled interview not found."
            });
        }

        await client.query(`
            UPDATE interviews
            SET status = 'cancelled'
            WHERE id = $1
        `, [result.rows[0].id]);

        await client.query(`
            UPDATE availability_slots
            SET status = 'available'
            WHERE id = $1
        `, [result.rows[0].slot_id]);

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Interview cancelled."
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Cancelling interview failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not cancel interview."
        });
    } finally {
        client.release();
    }
});

module.exports = router;
