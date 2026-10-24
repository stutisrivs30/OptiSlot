
const { loadSchedulerData } = require("./loadSchedulerData");

async function main() {
    try {
        const data = await loadSchedulerData();

        console.log("Candidates:", data.candidates.length);
        console.log("Interviewers:", data.interviewers.length);
        console.log("Rooms:", data.rooms.length);
        console.log("Rounds:", data.roundDefinitions.length);

        console.log("\nScheduler input:");
        console.dir(data, { depth: null });

        console.log("\nAvailability summary:");
        console.table(data.candidates.map(candidate => ({
            candidate: candidate.name,
            currentRound: candidate.currentRound,
            availabilityWindows: candidate.availability.length
        })));

        console.table(data.interviewers.map(interviewer => ({
            interviewer: interviewer.name,
            skills: interviewer.skills.join(", "),
            availabilityWindows: interviewer.availability.length
        })));

        console.table(data.rooms.map(room => ({
            room: room.name,
            capacity: room.capacity,
            availabilityWindows: room.availability.length
        })));
    } catch (error) {
        console.error("Failed to load scheduler data:", error.message);
        process.exitCode = 1;
    } finally {
        // Close the pool so this one-off script can exit.
        const pool = require("../db");
        await pool.end();
    }
}

main();
