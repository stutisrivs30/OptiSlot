
import { useEffect, useState } from "react";
import { Users, CalendarDays, Clock3 } from "lucide-react";
import { apiRequest } from "../services/api";

export default function InterviewerDashboard() {
  const [interviewers, setInterviewers] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [interviewerData, scheduleData] = await Promise.all([
          apiRequest("/interviewers"),
          apiRequest("/schedule"),
        ]);

        const people = Array.isArray(interviewerData)
          ? interviewerData
          : interviewerData?.interviewers ?? [];

        const bookings = Array.isArray(scheduleData)
          ? scheduleData
          : scheduleData?.interviews ?? [];

        setInterviewers(people);
        setInterviews(bookings);

        if (people.length) setSelectedId(String(people[0].id));
      } catch (err) {
        setError("Live data unavailable. Start the backend to load interviews.");
      }
    }

    loadData();
  }, []);

  const assigned = interviews.filter(
    (item) => String(item.interviewerId) === selectedId
  );

  const upcoming = assigned.filter(
    (item) =>
      item.start &&
      new Date(item.start) >= new Date() &&
      String(item.status).toLowerCase() === "scheduled"
  );

  return (
    <div>
      <p className="eyebrow">INTERVIEWER WORKSPACE</p>
      <h1>Interviewer Dashboard</h1>
      <p className="subtitle">
        Manage assigned interviews and upcoming sessions.
      </p>

      <section className="panel" style={{ padding: 24, marginTop: 24 }}>
        <h2>Select Interviewer</h2>
        <p>Demo mode: choose an interviewer to view their schedule.</p>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ padding: 12, marginTop: 12, width: "100%", maxWidth: 360 }}
        >
          <option value="">Select interviewer</option>
          {interviewers.map((person) => (
            <option key={person.id} value={String(person.id)}>
              {person.name || person.fullName || `Interviewer ${person.id}`}
            </option>
          ))}
        </select>
      </section>

      {error && <p className="error-message">{error}</p>}

      <div className="stats-grid" style={{ marginTop: 24 }}>
        <div className="stat-card">
          <Users size={22} />
          <h2>{assigned.length}</h2>
          <p>Total assigned interviews</p>
        </div>

        <div className="stat-card">
          <CalendarDays size={22} />
          <h2>{upcoming.length}</h2>
          <p>Upcoming interviews</p>
        </div>

        <div className="stat-card">
          <Clock3 size={22} />
          <h2>{assigned.filter((i) => i.status === "completed").length}</h2>
          <p>Completed interviews</p>
        </div>
      </div>

      <section className="panel" style={{ padding: 24, marginTop: 24 }}>
        <h2>My Interview Schedule</h2>

        {assigned.length === 0 ? (
          <p style={{ marginTop: 16 }}>No assigned interviews to display.</p>
        ) : (
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Round</th>
                  <th>Date & Time (IST)</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assigned.map((item) => (
                  <tr key={item.id}>
                    <td>{item.candidateName || item.candidateId}</td>
                    <td>{item.roundName || item.roundId}</td>
                    <td>
                      {item.start
                        ? new Date(item.start).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                          })
                        : "Not scheduled"}
                    </td>
                    <td>{item.roomName || "TBD"}</td>
                    <td>{item.status || "Unknown"}</td>
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
