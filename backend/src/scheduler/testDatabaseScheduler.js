
console.log("Database scheduler test started");

const { loadSchedulerData } = require("./loadSchedulerData");
const { generateSchedule } = require("./scheduler");
const pool = require("../db");

async function main() {
    try {
        const data = await loadSchedulerData();

        console.log("Loaded database data:");
        console.log("Candidates:", data.candidates.length);
        console.log("Interviewers:", data.interviewers.length);
        console.log("Rooms:", data.rooms.length);

        const result = generateSchedule({
            ...data,
            existingSchedule: []
        });

        console.log("\nScheduling successful:", result.success);
        console.log("Nodes visited:", result.nodesVisited);

        if (!result.success) {
            console.log("No feasible schedule could be generated.");
            return;
        }

        console.log("\nGenerated schedule from PostgreSQL:");

        console.table(result.schedule.map(item => ({
            candidate: item.candidateId,
            round: item.roundName || item.roundId,
            interviewer: item.interviewerId,
            room: item.roomId,
            start: item.start,
            end: item.end
        })));

        console.log(
            "\nTotal interviews generated:",
            result.schedule.length
        );
    } catch (error) {
        console.error("Scheduling test failed:", error.stack || error.message);
    } finally {
        await pool.end();
    }
}

main();

