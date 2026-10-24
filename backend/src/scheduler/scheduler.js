
function overlaps(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

function hasRequiredSkills(interviewer, round) {
  return round.requiredSkills.every(skill =>
    interviewer.skills.includes(skill)
  );
}

function findCandidateRound(candidate, roundDefinitions) {
  return roundDefinitions.find(
    round => round.id === candidate.currentRound
  );
}

function isAlreadyScheduled(candidate, round, schedule) {
  return schedule.some(booking =>
    booking.candidateId === candidate.id &&
    booking.roundId === round.id
  );
}

// Build requests from active candidates.
// No candidate-interviewer assignment is supplied beforehand.
function buildPendingTasks(candidates, roundDefinitions, schedule) {
  const tasks = [];

  for (const candidate of candidates) {
    if (candidate.status !== "active" || !candidate.currentRound) {
      continue;
    }

    const round = findCandidateRound(candidate, roundDefinitions);

    if (!round) {
      throw new Error(
        `Unknown round ${candidate.currentRound} for ${candidate.id}`
      );
    }

    if (isAlreadyScheduled(candidate, round, schedule)) {
      continue;
    }

    tasks.push({
      id: `${candidate.id}-${round.id}`,
      candidate,
      round
    });
  }

  return tasks;
}

function getValidOptions(task, context) {
  const {
    interviewers,
    rooms,
    schedule,
    stepMinutes
  } = context;

  const { candidate, round } = task;
  const options = [];
  console.log("DEBUG: getValidOptions was called");
  console.log("DEBUG stepMinutes:", stepMinutes);
  console.log("DEBUG candidate:", candidate.id, candidate.status);
  console.log("DEBUG candidate availability:", candidate.availability);
  console.log("DEBUG interviewers:", interviewers.map(i => ({
  id: i.id,
  skills: i.skills,
  availability: i.availability
})));
console.log("DEBUG rooms:", rooms.map(r => ({
  id: r.id,
  capacity: r.capacity,
  availability: r.availability
})));
console.log("DEBUG schedule:", schedule);
  const seen = new Set();
  const stepMs = stepMinutes * 60_000;
  const durationMs = round.durationMinutes * 60_000;

  for (const interviewer of interviewers) {
    // Hard constraint: interviewer must have every required skill.
    if (!hasRequiredSkills(interviewer, round)) {
      continue;
    }

    for (const room of rooms) {
      if (room.capacity < round.requiredRoomCapacity) {
        continue;
      }

      for (const candidateWindow of candidate.availability) {
        for (const interviewerWindow of interviewer.availability) {
          for (const roomWindow of room.availability) {
            // The slot must fit within all three availability windows.
            const startWindow = Math.max(
              Date.parse(candidateWindow.start),
              Date.parse(interviewerWindow.start),
              Date.parse(roomWindow.start)
            );

            const endWindow = Math.min(
              Date.parse(candidateWindow.end),
              Date.parse(interviewerWindow.end),
              Date.parse(roomWindow.end)
            );

            // Align possible start times to the chosen step interval.
            const firstStart =
              Math.ceil(startWindow / stepMs) * stepMs;

            for (
              let start = firstStart;
              start + durationMs <= endWindow;
              start += stepMs
            ) {
              const end = start + durationMs;

              // No candidate, interviewer, or room can be double-booked.
              const conflict = schedule.some(booking => {
                const bookingStart = Date.parse(booking.start);
                const bookingEnd = Date.parse(booking.end);

                return (
                  overlaps(start, end, bookingStart, bookingEnd) &&
                  (
                    booking.candidateId === candidate.id ||
                    booking.interviewerId === interviewer.id ||
                    booking.roomId === room.id
                  )
                );
              });

              if (conflict) continue;

              const option = {
                interviewId: task.id,
                candidateId: candidate.id,
                roundId: round.id,
                roundName: round.name,
                interviewerId: interviewer.id,
                roomId: room.id,
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString()
              };

              const key = [
                option.interviewerId,
                option.roomId,
                option.start,
                option.end
              ].join("|");

              if (!seen.has(key)) {
                seen.add(key);
                options.push(option);
              }
            }
          }
        }
      }
    }
  }

  // Greedy heuristic: earliest time first, then stable ID ordering.
  options.sort((a, b) =>
    a.start.localeCompare(b.start) ||
    a.interviewerId.localeCompare(b.interviewerId) ||
    a.roomId.localeCompare(b.roomId)
  );

  console.log("DEBUG round:", round);
  console.log("DEBUG interviewer availability:", JSON.stringify(interviewers[0]?.availability, null, 2));
  console.log("DEBUG room availability:", JSON.stringify(rooms[0]?.availability, null, 2));

  console.log("Available options found:", options.length);
  
  return options;
}

// AUTOMATIC SCHEDULING
function generateSchedule({
  candidates,
  interviewers,
  rooms,
  roundDefinitions,
  existingSchedule = [],
  stepMinutes = 30,
  maxNodes = 20000
}) {
  if (
    !Array.isArray(candidates) ||
    !Array.isArray(interviewers) ||
    !Array.isArray(rooms) ||
    !Array.isArray(roundDefinitions) ||
    !Array.isArray(existingSchedule) ||
    !Number.isInteger(stepMinutes) ||
    stepMinutes <= 0 ||
    !Number.isInteger(maxNodes) ||
    maxNodes <= 0
  ) {
    return { success: false, message: "Invalid scheduling input." };
  }

  for (const person of [...candidates, ...interviewers]) {
    if (
      !Array.isArray(person.skills) ||
      !Array.isArray(person.availability) ||
      person.availability.some(window =>
        !Number.isFinite(Date.parse(window.start)) ||
        !Number.isFinite(Date.parse(window.end)) ||
        Date.parse(window.start) >= Date.parse(window.end)
      )
    ) {
      return {
        success: false,
        message: `Invalid skills or availability for ${person.id}.`
      };
    }
  }

  for (const room of rooms) {
    if (
      !Number.isFinite(room.capacity) ||
      !Array.isArray(room.availability) ||
      room.availability.some(window =>
        !Number.isFinite(Date.parse(window.start)) ||
        !Number.isFinite(Date.parse(window.end)) ||
        Date.parse(window.start) >= Date.parse(window.end)
      )
    ) {
      return {
        success: false,
        message: `Invalid room data for ${room.id}.`
      };
    }
  }

  for (const round of roundDefinitions) {
    if (
      !round.id ||
      !Array.isArray(round.requiredSkills) ||
      !Number.isFinite(round.durationMinutes) ||
      round.durationMinutes <= 0 ||
      !Number.isFinite(round.requiredRoomCapacity) ||
      round.requiredRoomCapacity <= 0
    ) {
      return {
        success: false,
        message: `Invalid round definition: ${round.id || "unknown"}.`
      };
    }
  }

  const roundIds = roundDefinitions.map(round => round.id);
  if (new Set(roundIds).size !== roundIds.length) {
    return { success: false, message: "Duplicate round IDs." };
  }

  const context = {
    candidates,
    interviewers,
    rooms,
    roundDefinitions,
    schedule: [...existingSchedule],
    stepMinutes
  };

  let tasks;

  try {
    tasks = buildPendingTasks(candidates, roundDefinitions, context.schedule);
  } catch (error) {
    return { success: false, message: error.message };
  }

  let nodesVisited = 0;
  let searchLimitReached = false;

  function backtrack(remaining) {
    if (remaining.length === 0) return true;

    let bestTask = null;
    let bestOptions = null;

    // MRV: choose the task with the fewest valid options.
    for (const task of remaining) {
      const options = getValidOptions(task, context);

      // Forward checking: this branch cannot produce a full schedule.
      if (options.length === 0) return false;

      if (
        bestOptions === null ||
        options.length < bestOptions.length ||
        (
          options.length === bestOptions.length &&
          task.round.durationMinutes > bestTask.round.durationMinutes
        )
      ) {
        bestTask = task;
        bestOptions = options;
      }
    }

    const nextRemaining = remaining.filter(
      task => task.id !== bestTask.id
    );

    // Try each valid assignment; undo it if later tasks cannot fit.
    for (const option of bestOptions) {
      if (nodesVisited >= maxNodes) {
        searchLimitReached = true;
        return false;
      }

      nodesVisited++;
      context.schedule.push(option);

      if (backtrack(nextRemaining)) return true;

      context.schedule.pop();

      if (searchLimitReached) return false;
    }

    return false;
  }

  const success = backtrack(tasks);

  if (!success) {
    return {
      success: false,
      message: searchLimitReached
        ? "Search limit reached; impossibility is not confirmed."
        : "No valid complete schedule exists for the pending requests.",
      nodesVisited
    };
  }

  context.schedule.sort((a, b) =>
    a.start.localeCompare(b.start)
  );

  return {
    success: true,
    schedule: context.schedule,
    nodesVisited
  };
}

// SELF-BOOKING: return valid choices for one candidate's current round.
function getAvailableSlots(candidateId, context) {
  const candidate = context.candidates.find(
    person => String(person.id) === String(candidateId)
  );

  if (!candidate || candidate.status !== "active") {
    return {
      success: false,
      message: "Candidate is not eligible."
    };
  }

  const round = findCandidateRound(
    candidate,
    context.roundDefinitions
  );

  if (!round) {
    return {
      success: false,
      message: "No active interview round."
    };
  }

  if (isAlreadyScheduled(candidate, round, context.schedule)) {
    return {
      success: false,
      message: "This round is already booked."
    };
  }

  const task = {
    id: `${candidate.id}-${round.id}`,
    candidate,
    round
  };

  const slots = getValidOptions(task, {
    ...context,
    stepMinutes: context.stepMinutes || 30
  });

  return {
    success: true,
    roundId: round.id,
    slots
  };
}

// Confirm a choice only if it is still valid in the current schedule.
function bookSelectedSlot(candidateId, selectedSlot, context) {
  const result = getAvailableSlots(candidateId, context);

  if (!result.success) return result;

  const booking = result.slots.find(slot =>
    slot.interviewerId === selectedSlot.interviewerId &&
    slot.roomId === selectedSlot.roomId &&
    slot.start === selectedSlot.start &&
    slot.end === selectedSlot.end
  );

  if (!booking) {
    return {
      success: false,
      message: "That slot is no longer available. Refresh the choices."
    };
  }

  return {
    success: true,
    booking,
    schedule: [...context.schedule, booking]
  };
}

// Move the candidate to the next round after a pass/fail decision.
function recordRoundResult(candidateId, outcome, candidates, roundDefinitions) {
  if (!["pass", "fail"].includes(outcome)) {
    return { success: false, message: "Outcome must be pass or fail." };
  }

  const candidate = candidates.find(person => person.id === candidateId);

  if (!candidate || candidate.status !== "active") {
    return { success: false, message: "Candidate is not active." };
  }

  const currentIndex = roundDefinitions.findIndex(
    round => round.id === candidate.currentRound
  );

  if (currentIndex < 0) {
    return { success: false, message: "Current round was not found." };
  }

  const updatedCandidate = { ...candidate };

  if (outcome === "fail") {
    updatedCandidate.status = "rejected";
    updatedCandidate.currentRound = null;
  } else if (currentIndex === roundDefinitions.length - 1) {
    updatedCandidate.status = "completed";
    updatedCandidate.currentRound = null;
  } else {
    updatedCandidate.currentRound =
      roundDefinitions[currentIndex + 1].id;
  }

  return {
    success: true,
    candidates: candidates.map(person =>
      person.id === candidateId ? updatedCandidate : person
    ),
    updatedCandidate
  };
}

module.exports = {
  generateSchedule,
  getAvailableSlots,
  bookSelectedSlot,
  recordRoundResult
};
