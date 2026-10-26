
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Download, UserRound } from "lucide-react";
import { apiRequest } from "../services/api";

function formatDate(value) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function escapeCalendarText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function calendarDate(value) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function downloadCalendar(interview) {
  if (!interview.start || !interview.end) {
    alert("This interview does not have a valid schedule.");
    return;
  }

  const title = `${interview.roundName || "Interview"} - OptiSlot`;

  const description = [
    `Candidate: ${interview.candidateName || interview.candidateId}`,
    `Interviewer: ${interview.interviewerName || "Assigned interviewer"}`,
    `Room: ${interview.roomName || "To be confirmed"}`,
  ].join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OptiSlot//Interview Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:optislot-${interview.id}@optislot.local`,
    `DTSTAMP:${calendarDate(new Date())}`,
    `DTSTART:${calendarDate(interview.start)}`,
    `DTEND:${calendarDate(interview.end)}`,
    `SUMMARY:${escapeCalendarText(title)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    `LOCATION:${escapeCalendarText(interview.roomName || "Online / TBD")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const content = lines.join("\r\n") + "\r\n";
  const blob = new Blob([content], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `optislot-interview-${interview.id}.ics`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function CandidateDashboard() {
    
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [candidateResponse, scheduleResponse] =
          await Promise.all([
            apiRequest("/candidates"),
            apiRequest("/schedule"),
          ]);

        const candidateList = Array.isArray(candidateResponse)
            ? candidateResponse
            : candidateResponse?.candidates ?? [];

        const interviewList = Array.isArray(scheduleResponse)
            ? scheduleResponse
            : scheduleResponse?.interviews ?? [];

        setCandidates(candidateList);
        setInterviews(interviewList);

        if (candidateList.length > 0) {
          setSelectedCandidate(String(candidateList[0].id));
        }
      } catch (err) {
        setError(err.message || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const candidateInterviews = interviews.filter(
    (interview) =>
      String(interview.candidateId) === selectedCandidate
  );

  const upcomingInterviews = candidateInterviews.filter(
    (interview) =>
      interview.start &&
      new Date(interview.start) >= new Date() &&
      String(interview.status).toLowerCase() === "scheduled"
  );

  return (
    <div className="candidate-dashboard">
      <div style={{ marginBottom: 24 }}>
        <p className="eyebrow">CANDIDATE WORKSPACE</p>
        <h1>Candidate Dashboard</h1>
        <p className="subtitle">
          View your interview schedule, progress, and calendar files.
        </p>
      </div>
              
      <section className="panel" style={{ padding: 24, marginBottom: 24 }}>
        <h2>Demo Candidate Selection</h2>
        <p style={{ marginBottom: 12 }}>
          Select a candidate to preview their dashboard.
        </p>

        <select
          value={selectedCandidate}
          onChange={(event) =>
            setSelectedCandidate(event.target.value)
          }
          style={{
            padding: 12,
            borderRadius: 8,
            border: "1px solid #d5d9e5",
            width: "100%",
            maxWidth: 360,
          }}
        >
          {candidates.map((candidate) => (
            <option key={candidate.id} value={String(candidate.id)}>
              {candidate.full_name || candidate.name || candidate.fullName || `Candidate ${candidate.id}`}
            </option>
          ))}
        </select>
      </section>

      {loading && <p>Loading candidate interviews...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
                <UserRound size={22} />
                <h2>{candidates.length}</h2>
                <p>Registered candidates</p>
            </div>
            <div className="stat-card">
              <CalendarDays size={22} />
              <h2>{candidateInterviews.length}</h2>
              <p>Total interview records</p>
            </div>

            <div className="stat-card">
              <Clock3 size={22} />
              <h2>{upcomingInterviews.length}</h2>
              <p>Upcoming interviews</p>
            </div>
          </div>

          <section className="panel" style={{ padding: 24, marginBottom: 24 }}>
            <h2>Upcoming Interviews</h2>

            {upcomingInterviews.length === 0 ? (
              <p style={{ marginTop: 16 }}>
                No upcoming confirmed interviews for this candidate.
              </p>
            ) : (
              <div className="schedule-table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Round</th>
                      <th>Interviewer</th>
                      <th>Date & Time (IST)</th>
                      <th>Room</th>
                      <th>Calendar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingInterviews.map((interview) => (
                      <tr key={interview.id}>
                        <td>{interview.roundName || interview.roundId}</td>
                        <td>
                          <UserRound size={15} style={{ display: "inline" }} />{" "}
                          {interview.interviewerName || "Assigned"}
                        </td>
                        <td>{formatDate(interview.start)}</td>
                        <td>{interview.roomName || "TBD"}</td>
                        <td>
                          <button
                            className="secondary-button"
                            onClick={() => downloadCalendar(interview)}
                          >
                            <Download size={16} />
                            Download .ics
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel" style={{ padding: 24 }}>
            <h2>Interview Progress</h2>

            {candidateInterviews.length === 0 ? (
              <p style={{ marginTop: 16 }}>
                No interview records yet.
              </p>
            ) : (
              <div className="schedule-table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Round</th>
                      <th>Status</th>
                      <th>Scheduled Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidateInterviews.map((interview) => (
                      <tr key={interview.id}>
                        <td>{interview.roundName || interview.roundId}</td>
                        <td>{interview.status || "Unknown"}</td>
                        <td>{formatDate(interview.start)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
