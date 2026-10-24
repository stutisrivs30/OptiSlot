
const candidates = [
  {
    id: "C1",
    name: "Candidate 1",
    skills: ["JavaScript", "React"],
    currentRound: "CODING",
    status: "active",
    availability: [
      {
        start: "2026-10-26T09:00:00Z",
        end: "2026-10-26T12:00:00Z"
      }
    ]
  },
  {
    id: "C2",
    name: "Candidate 2",
    skills: ["Python", "SQL"],
    currentRound: "CODING",
    status: "active",
    availability: [
      {
        start: "2026-10-26T09:00:00Z",
        end: "2026-10-26T12:00:00Z"
      }
    ]
  },
  {
    id: "C3",
    name: "Candidate 3",
    skills: ["JavaScript", "React"],
    currentRound: "CODING",
    status: "active",
    availability: [
      {
        start: "2026-10-26T10:00:00Z",
        end: "2026-10-26T13:00:00Z"
      }
    ]
  }
];

const interviewers = [
  {
    id: "I1",
    skills: ["JavaScript", "Algorithms"],
    availability: [
      {
        start: "2026-10-26T09:00:00Z",
        end: "2026-10-26T12:00:00Z"
      }
    ]
  },
  {
    id: "I2",
    skills: ["JavaScript", "System Design"],
    availability: [
      {
        start: "2026-10-26T09:00:00Z",
        end: "2026-10-26T13:00:00Z"
      }
    ]
  },
  {
    id: "I3",
    skills: ["Communication", "HR"],
    availability: [
      {
        start: "2026-10-26T09:00:00Z",
        end: "2026-10-26T13:00:00Z"
      }
    ]
  }
];

const rooms = [
  {
    id: "R1",
    capacity: 2,
    availability: [
      {
        start: "2026-10-26T09:00:00Z",
        end: "2026-10-26T13:00:00Z"
      }
    ]
  },
  {
    id: "R2",
    capacity: 2,
    availability: [
      {
        start: "2026-10-26T09:00:00Z",
        end: "2026-10-26T13:00:00Z"
      }
    ]
  }
];

// These definitions describe each stage, not individual assignments.
const roundDefinitions = [
  {
    id: "CODING",
    name: "Coding",
    requiredSkills: ["JavaScript", "Algorithms"],
    durationMinutes: 60,
    requiredRoomCapacity: 2
  },
  {
    id: "TECHNICAL",
    name: "Technical",
    requiredSkills: ["JavaScript", "System Design"],
    durationMinutes: 60,
    requiredRoomCapacity: 2
  },
  {
    id: "HR",
    name: "HR",
    requiredSkills: ["Communication", "HR"],
    durationMinutes: 30,
    requiredRoomCapacity: 2
  }
];

module.exports = {
  candidates,
  interviewers,
  rooms,
  roundDefinitions
};
