
const {
  candidates,
  interviewers,
  rooms,
  roundDefinitions
} = require("./sampleData");

const {
  generateSchedule,
  getAvailableSlots,
  bookSelectedSlot,
  recordRoundResult
} = require("./scheduler");

const baseContext = {
  candidates,
  interviewers,
  rooms,
  roundDefinitions,
  stepMinutes: 30
};

// TEST 1: Automatically schedule the pending rounds.
console.log("\n=== AUTOMATIC SCHEDULING ===");

const automaticResult = generateSchedule(baseContext);

if (!automaticResult.success) {
  console.log(automaticResult.message);
  process.exitCode = 1;
} else {
  console.table(automaticResult.schedule.map(booking => ({
    candidate: booking.candidateId,
    round: booking.roundName,
    interviewer: booking.interviewerId,
    room: booking.roomId,
    start: booking.start,
    end: booking.end
  })));

  console.log("Search nodes:", automaticResult.nodesVisited);
}

// TEST 2: Offer choices to a candidate, without auto-assigning them.
console.log("\n=== SELF-BOOKING ===");

const selfBookingContext = {
  ...baseContext,
  schedule: []
};

const choices = getAvailableSlots("C1", selfBookingContext);

if (choices.success && choices.slots.length > 0) {
  console.log("Available choices:", choices.slots.length);

  // Demo only: simulate the candidate choosing the first option.
  const booking = bookSelectedSlot(
    "C1",
    choices.slots[0],
    selfBookingContext
  );

  if (booking.success) {
    selfBookingContext.schedule = booking.schedule;
    console.log("Candidate booked:", booking.booking);
  } else {
    console.log(booking.message);
  }
} else {
  console.log(choices.message || "No available slots.");
}

// TEST 3: Progress a candidate who passed Coding to Technical.
console.log("\n=== ROUND PROGRESSION ===");

if (automaticResult.success) {
  const progression = recordRoundResult(
    "C1",
    "pass",
    candidates,
    roundDefinitions
  );

  if (progression.success) {
    console.log(
      "C1's next round:",
      progression.updatedCandidate.currentRound
    );

    const nextRoundResult = generateSchedule({
      ...baseContext,
      candidates: progression.candidates,
      existingSchedule: automaticResult.schedule
    });

    if (nextRoundResult.success) {
      console.log("Updated schedule:");
      console.table(nextRoundResult.schedule.map(booking => ({
        candidate: booking.candidateId,
        round: booking.roundName,
        interviewer: booking.interviewerId,
        room: booking.roomId,
        start: booking.start,
        end: booking.end
      })));
    } else {
      console.log(nextRoundResult.message);
    }
  }
}
