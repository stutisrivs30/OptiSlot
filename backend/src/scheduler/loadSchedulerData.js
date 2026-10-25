
const pool = require("../db");

async function loadSchedulerData() {
    const [
        candidateResult,
        interviewerResult,
        roomResult,
        roundResult
    ] = await Promise.all([
        pool.query(`
            SELECT
                cp.user_id AS id,
                u.full_name AS name,
                COALESCE(
                    ARRAY_AGG(DISTINCT s.name)
                    FILTER (WHERE s.name IS NOT NULL),
                    ARRAY[]::varchar[]
                ) AS skills
            FROM candidate_profiles cp
            JOIN users u ON u.id = cp.user_id
            LEFT JOIN candidate_skills cs
                ON cs.candidate_id = cp.user_id
            LEFT JOIN skills s ON s.id = cs.skill_id
            GROUP BY cp.user_id, u.full_name
        `),

        pool.query(`
            SELECT
                ip.user_id AS id,
                u.full_name AS name,
                COALESCE(
                    ARRAY_AGG(DISTINCT s.name)
                    FILTER (WHERE s.name IS NOT NULL),
                    ARRAY[]::varchar[]
                ) AS skills
            FROM interviewer_profiles ip
            JOIN users u ON u.id = ip.user_id
            LEFT JOIN interviewer_skills iskill
                ON iskill.interviewer_id = ip.user_id
            LEFT JOIN skills s ON s.id = iskill.skill_id
            GROUP BY ip.user_id, u.full_name
        `),

        pool.query(`
            SELECT id, name, capacity
            FROM rooms
            ORDER BY id
        `),

        pool.query(`
            SELECT
                ir.id,
                ir.name,
                ir.duration_minutes,
                ir.required_room_capacity,
                ir.sort_order,
                COALESCE(
                    ARRAY_AGG(DISTINCT s.name)
                    FILTER (WHERE s.name IS NOT NULL),
                    ARRAY[]::varchar[]
                ) AS required_skills
            FROM interview_rounds ir
            LEFT JOIN round_required_skills rrs
                ON rrs.round_id = ir.id
            LEFT JOIN skills s ON s.id = rrs.skill_id
            WHERE ir.is_active = TRUE
            GROUP BY
                ir.id,
                ir.name,
                ir.duration_minutes,
                ir.required_room_capacity,
                ir.sort_order
            ORDER BY ir.sort_order
        `)
    ]);

    const candidateAvailability = await pool.query(`
        SELECT
            candidate_id,
            start_time,
            end_time
        FROM candidate_availability
        WHERE end_time > NOW()
        ORDER BY start_time
    `);

    const interviewerAvailability = await pool.query(`
        SELECT
            interviewer_id,
            start_time,
            end_time
        FROM availability_slots
        WHERE status = 'available'
          AND end_time > NOW()
        ORDER BY start_time
    `);

    const roomAvailability = await pool.query(`
        SELECT
            room_id,
            start_time,
            end_time
        FROM room_availability
        WHERE end_time > NOW()
        ORDER BY start_time
    `);

    const progressResult = await pool.query(`
        SELECT
            crp.candidate_id,
            crp.round_id,
            crp.status,
            ir.sort_order
        FROM candidate_round_progress crp
        JOIN interview_rounds ir ON ir.id = crp.round_id
        WHERE ir.is_active = TRUE
        ORDER BY ir.sort_order
    `);

    function groupAvailability(rows, idField) {
        const grouped = new Map();

        for (const row of rows) {
            const id = String(row[idField]);

            if (!grouped.has(id)) {
                grouped.set(id, []);
            }

            grouped.get(id).push({
                start: new Date(row.start_time).toISOString(),
                end: new Date(row.end_time).toISOString()
            });
        }

        return grouped;
    }

    const candidateSlots = groupAvailability(
        candidateAvailability.rows,
        "candidate_id"
    );

    const interviewerSlots = groupAvailability(
        interviewerAvailability.rows,
        "interviewer_id"
    );

    const roomSlots = groupAvailability(
        roomAvailability.rows,
        "room_id"
    );

    const progressByCandidate = new Map();

    for (const row of progressResult.rows) {
        const id = String(row.candidate_id);

        if (!progressByCandidate.has(id)) {
            progressByCandidate.set(id, []);
        }

        progressByCandidate.get(id).push(row);
    }

    const roundDefinitions = roundResult.rows.map(round => ({
        id: round.id,
        name: round.name,
        durationMinutes: Number(round.duration_minutes),
        requiredRoomCapacity: Number(round.required_room_capacity),
        requiredSkills: round.required_skills
    }));

    const candidates = candidateResult.rows.map(candidate => {
        const id = String(candidate.id);
        const progress = progressByCandidate.get(id) || [];

        const currentProgress = progress.find(
            item =>
                item.status === "pending" ||
                item.status === "in_progress"
        );

        const hasProgress = progress.length > 0;

        return {
            id,
            name: candidate.name,
            skills: candidate.skills,
            currentRound: currentProgress
                ? currentProgress.round_id
                : hasProgress
                    ? null
                    : roundDefinitions[0]?.id ?? null,
            status: currentProgress || !hasProgress
                ? "active"
                : "inactive",
            availability: candidateSlots.get(id) || []
        };
    });

    const interviewers = interviewerResult.rows.map(interviewer => {
        const id = String(interviewer.id);

        return {
            id,
            name: interviewer.name,
            skills: interviewer.skills,
            availability: interviewerSlots.get(id) || []
        };
    });

    const rooms = roomResult.rows.map(room => {
        const id = String(room.id);

        return {
            id,
            name: room.name,
            capacity: Number(room.capacity),
            availability: roomSlots.get(id) || []
        };
    });

    return {
        candidates: candidates.filter(
        (candidate) => candidate.availability.length > 0
        ),
        interviewers,
        rooms,
        roundDefinitions
    };
}

module.exports = { loadSchedulerData };
