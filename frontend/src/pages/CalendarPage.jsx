
import { useEffect, useState } from "react";
import { CalendarDays, Download, RefreshCw } from "lucide-react";
import { apiRequest } from "../services/api";

function formatIST(date) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toICSDate(date) {
  return new Date(date)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeICS(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function downloadICS(interview) {
  if (!interview.start || !interview.end) return;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OptiSlot//Interview Calendar//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:optislot-${interview.id}@optislot.local`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(interview.start)}`,
    `DTEND:${toICSDate(interview.end)}`,
    `SUMMARY:${escapeICS(`OptiSlot - ${interview.roundName || "Interview"}`)}`,
    `DESCRIPTION:${escapeICS(`Candidate: ${interview.candidateName || interview.candidateId}\nInterviewer: ${interview.interviewerName || interview.interviewerId}`)}`,
    `LOCATION:${escapeICS(interview.roomName || "Online / TBD")}`,
    ...(interview.meetingLink
      ? [`URL:${interview.meetingLink}`]
      : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n") + "\r\n"], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `optislot-interview-${interview.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function CalendarPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadInterviews() {
    try {
      setLoading(true);
      setError("");

      const response = await apiRequest("/schedule");
      const records = Array.isArray(response)
        ? response
        : response?.interviews ?? [];

      setInterviews(records);
    } catch (err) {
      setError(err.message || "Could not load interviews.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInterviews();
  }, []);

  const scheduled = interviews.filter(
    (item) =>
      item.start &&
      item.end &&
      String(item.status).toLowerCase() === "scheduled"
  );

  return (
    <div>
      <p className="eyebrow">INTERVIEW CALENDAR</p>
      <h1>Calendar & Events</h1>
      <p className="subtitle">
        View confirmed interviews and export calendar files.
      </p>

      <section
        className="panel"
        style={{ padding: 24, marginTop: 24 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2>Scheduled Interviews</h2>
            <p>Download an .ics file for each confirmed booking.</p>
          </div>

          <button
            className="secondary-button"
            onClick={loadInterviews}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <p className="error-message" style={{ marginTop: 16 }}>
            {error}
          </p>
        )}

        {!error && !loading && scheduled.length === 0 && (
          <div className="empty-state" style={{ marginTop: 24 }}>
            <CalendarDays size={32} />
            <h3>No confirmed interviews yet</h3>
            <p>
              Confirm a generated schedule in the coordinator dashboard,
              then refresh this page.
            </p>
          </div>
        )}

        {scheduled.length > 0 && (
          <div
            className="schedule-table-wrapper"
            style={{ marginTop: 24 }}
          >
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Round</th>
                  <th>Interviewer</th>
                  <th>Date & Time (IST)</th>
                  <th>Room</th>
                  <th>Calendar File</th>
                </tr>
              </thead>
              <tbody>
                {scheduled.map((interview) => (
                  <tr key={interview.id}>
                    <td>
                      {interview.candidateName ||
                        interview.candidateId}
                    </td>
                    <td>
                      {interview.roundName || interview.roundId}
                    </td>
                    <td>
                      {interview.interviewerName ||
                        interview.interviewerId}
                    </td>
                    <td>{formatIST(interview.start)}</td>
                    <td>{interview.roomName || "TBD"}</td>
                    <td>
                      <button
                        className="secondary-button"
                        onClick={() => downloadICS(interview)}
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
    </div>
  );
}
