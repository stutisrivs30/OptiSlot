
import { useEffect, useState } from "react";useEffect
import { apiRequest } from "./services/api";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserRoundCheck,
  DoorOpen,
  Settings,
  Bell,
  Search,
  Plus,
  Zap,
  ChevronDown,
  Clock3,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import "./App.css";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Schedule", icon: CalendarDays },
  { label: "Candidates", icon: Users },
  { label: "Interviewers", icon: UserRoundCheck },
  { label: "Rooms", icon: DoorOpen },
];

export default function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [apiStatus, setApiStatus] = useState("Checking backend...");
  const [candidates, setCandidates] = useState([]);
const [interviewers, setInterviewers] = useState([]);
const [rooms, setRooms] = useState([]);
const [interviews, setInterviews] = useState([]);
const [dataLoading, setDataLoading] = useState(true);
const [dataError, setDataError] = useState("");
const [schedulePreview, setSchedulePreview] = useState([]);
const [generatingSchedule, setGeneratingSchedule] = useState(false);
const [scheduleError, setScheduleError] = useState("");
const [scheduleMessage, setScheduleMessage] = useState("");

(() => {
  async function loadDashboard() {
    try {
      setDataLoading(true);
      setDataError("");

      const [candidateData, interviewerData, roomData, interviewData] =
        await Promise.all([
          apiRequest("/candidates"),
          apiRequest("/interviewers"),
          apiRequest("/rooms"),
          apiRequest("/schedule"),
        ]);

      setCandidates(candidateData);
      setInterviewers(interviewerData);
      setRooms(roomData);
      setInterviews(interviewData);
    } catch (error) {
      console.error("Dashboard loading failed:", error);
      setDataError(error.message);
    } finally {
      setDataLoading(false);
    }
  }

  loadDashboard();
}, []);

useEffect(() => {
  apiRequest("/rounds")
    .then((data) => {
      console.log("OptiSlot rounds:", data);
      setApiStatus("Backend connected");
    })
    .catch((error) => {
      console.error("API connection failed:", error);
      setApiStatus("Backend connection failed");
    });
}, []);

useEffect(() => {
  async function loadDashboard() {
    try {
      setDataLoading(true);
      setDataError("");

      const [candidateData, interviewerData, roomData, interviewData] =
        await Promise.all([
          apiRequest("/candidates"),
          apiRequest("/interviewers"),
          apiRequest("/rooms"),
          apiRequest("/schedule"),
        ]);

      console.log("Candidates response:", candidateData);
      console.log("Interviewers response:", interviewerData);
      console.log("Rooms response:", roomData);
      console.log("Interviews response:", interviewData);

      setCandidates(
        Array.isArray(candidateData)
          ? candidateData
          : candidateData.candidates || []
      );

      setInterviewers(
        Array.isArray(interviewerData)
          ? interviewerData
          : interviewerData.interviewers || []
      );

      setRooms(
        Array.isArray(roomData)
          ? roomData
          : roomData.rooms || []
      );

      setInterviews(
        Array.isArray(interviewData)
          ? interviewData
          : interviewData.interviews || []
      );
    } catch (error) {
      console.error("Dashboard loading failed:", error);
      setDataError(error.message);
    } finally {
      setDataLoading(false);
    }
  }

  loadDashboard();
}, []);

async function handleGenerateSchedule() {
  try {
    setGeneratingSchedule(true);
    setScheduleError("");
    setScheduleMessage("");
    setSchedulePreview([]);

    const result = await apiRequest("/schedule/generate", {
      method: "POST",
    });

    if (!result.success) {
      throw new Error(result.message || "Schedule generation failed.");
    }

    setSchedulePreview(result.schedule || []);
    setScheduleMessage(
      `${result.count ?? result.schedule?.length ?? 0} new bookings proposed.`
    );

    console.log("Schedule preview:", result);
  } catch (error) {
    console.error("Schedule generation failed:", error);
    setScheduleError(error.message);
  } finally {
    setGeneratingSchedule(false);
  }
}

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><CalendarDays size={22} /></div>
          <div>
            <h2>OptiSlot</h2>
            <span>Interview management</span>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <nav>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activePage === label ? "active" : ""}`}
              onClick={() => setActivePage(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={19} /><span>Settings</span>
          </button>
          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>Coordinator</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace / </span>
            <strong>{activePage}</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Search">
              <Search size={19} />
            </button>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} />
            </button>
            <div className="avatar small">A</div>
          </div>
        </header>
        <div className="connection-status">
  <span className={apiStatus === "Backend connected" ? "status-dot online" : "status-dot"} />
  {apiStatus}
</div>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR INTERVIEW WORKSPACE</p>
              <h1>{activePage === "Overview" ? "Dashboard overview" : activePage}</h1>
              <p className="subtitle">
                Manage interviews, availability and scheduling in one place.
              </p>
            </div>
            <button
  className="primary-button"
  onClick={handleGenerateSchedule}
  disabled={generatingSchedule}
>
  <Zap size={17} />
  {generatingSchedule ? "Generating..." : "Generate schedule"}
</button>
          </div>

          <div className="stats-grid">
  <StatCard
    title="Candidates"
    value={dataLoading ? "…" : candidates.length}
    detail="Registered candidates"
    icon={Users}
  />

  <StatCard
    title="Interviewers"
    value={dataLoading ? "…" : interviewers.length}
    detail="Registered interviewers"
    icon={UserRoundCheck}
  />

  <StatCard
    title="Interviews"
    value={dataLoading ? "…" : interviews.length}
    detail="Interview records"
    icon={CalendarDays}
  />

  <StatCard
    title="Rooms"
    value={dataLoading ? "…" : rooms.length}
    detail="Available room records"
    icon={DoorOpen}
  />
</div>

{scheduleError && (
  <p className="error-message">{scheduleError}</p>
)}

{scheduleMessage && (
  <p className="success-message">{scheduleMessage}</p>
)}

{schedulePreview.length > 0 && (
  <section className="schedule-preview">
    <h2>Proposed Schedule</h2>
    <p>Review the booking details before confirming.</p>

    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Candidate ID</th>
            <th>Round</th>
            <th>Interviewer ID</th>
            <th>Room ID</th>
            <th>Start (IST)</th>
            <th>End (IST)</th>
          </tr>
        </thead>
        <tbody>
          {schedulePreview.map((item) => (
            <tr key={item.interviewId}>
              <td>{item.candidateId}</td>
              <td>{item.roundName || item.roundId}</td>
              <td>{item.interviewerId}</td>
              <td>{item.roomId}</td>
              <td>
                {new Date(item.start).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
              <td>
                {new Date(item.end).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)}


{dataError && (
  <p className="error-message">
    Could not load dashboard data: {dataError}
  </p>
)}

          <div className="content-grid">
            <section className="panel schedule-panel">
              <div className="panel-header">
                <div>
                  <h2>Interview schedule</h2>
                  <p>Review and manage upcoming interviews</p>
                </div>
                <button className="secondary-button" onClick={() => setActivePage("Schedule")}>
                  View schedule
                </button>
              </div>

              
{dataLoading ? (
  <div className="empty-state">
    <p>Loading interviews...</p>
  </div>
) : interviews.length === 0 ? (
  <div className="empty-state">
    <div className="empty-icon">
      <CalendarDays size={26} />
    </div>
    <h3>No interviews found</h3>
    <p>Generate a schedule to get started.</p>
  </div>
) : (
  <div className="schedule-table-wrapper">
    <table className="schedule-table">
      <thead>
        <tr>
          <th>Candidate</th>
          <th>Interview round</th>
          <th>Interviewer</th>
          <th>Date & time</th>
          <th>Room</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {interviews.map((interview) => (
          <tr key={interview.id}>
            <td>
              <strong>
                {interview.candidateName || "Unassigned"}
              </strong>
            </td>

            <td>{interview.roundName || "Not assigned"}</td>

            <td>{interview.interviewerName || "Unassigned"}</td>

            <td>
              <div>
                {interview.start
                  ? new Date(interview.start).toLocaleDateString()
                  : "Not scheduled"}
              </div>
              <small>
                {interview.start
                  ? new Date(interview.start).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
                {interview.end
                  ? ` – ${new Date(interview.end).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : ""}
              </small>
            </td>

            <td>{interview.roomName || "Not assigned"}</td>

            <td>
              <span
                className={`status-badge status-${(
                  interview.status || "unknown"
                ).toLowerCase()}`}
              >
                {interview.status || "Unknown"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

            </section>

{scheduleMessage && (
  <p className="success-message">{scheduleMessage}</p>
)}

{scheduleError && (
  <p className="error-message">{scheduleError}</p>
)}

{schedulePreview.length > 0 && (
  <section className="panel preview-panel">
    <div className="panel-header">
      <div>
        <h2>Generated schedule preview</h2>
        <p>Review these proposed bookings before confirming them.</p>
      </div>
      <span className="preview-count">
        {schedulePreview.length} proposed
      </span>
    </div>

    <div className="schedule-table-wrapper">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Round</th>
            <th>Interviewer</th>
            <th>Start</th>
            <th>End</th>
            <th>Room</th>
          </tr>
        </thead>
        <tbody>
          {schedulePreview.map((item, index) => (
            <tr key={item.interviewId ?? item.id ?? index}>
              <td>{item.candidateName || item.candidateId || "—"}</td>
              <td>{item.roundName || item.roundId || "—"}</td>
              <td>{item.interviewerName || item.interviewerId || "—"}</td>
              <td>
                {item.start
                  ? new Date(item.start).toLocaleString()
                  : item.startTime
                    ? new Date(item.startTime).toLocaleString()
                    : "—"}
              </td>
              <td>
                {item.end
                  ? new Date(item.end).toLocaleTimeString()
                  : item.endTime
                    ? new Date(item.endTime).toLocaleTimeString()
                    : "—"}
              </td>
              <td>{item.roomName || item.roomId || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)}

            <section className="panel activity-panel">
              <div className="panel-header">
                <div>
                  <h2>Quick actions</h2>
                  <p>Common coordinator tasks</p>
                </div>
              </div>
              <button className="action-row" onClick={() => setActivePage("Candidates")}>
                <span className="action-icon"><Users size={18} /></span>
                <span><strong>View candidates</strong><small>Review candidate records</small></span>
                <Plus size={17} />
              </button>
              <button className="action-row" onClick={() => setActivePage("Interviewers")}>
                <span className="action-icon"><UserRoundCheck size={18} /></span>
                <span><strong>View interviewers</strong><small>Review interviewer records</small></span>
                <Plus size={17} />
              </button>
              <button className="action-row" onClick={() => setActivePage("Rooms")}>
                <span className="action-icon"><DoorOpen size={18} /></span>
                <span><strong>Manage rooms</strong><small>Review available rooms</small></span>
                <Plus size={17} />
              </button>
              <div className="tip-box">
                <Clock3 size={18} />
                <p><strong>Smart scheduling</strong><br />OptiSlot checks constraints before confirming interview slots.</p>
              </div>
            </section>
          </div>

          <div className="bottom-note">
            <CheckCircle2 size={16} />
            <span>OptiSlot workspace</span>
            <span className="note-divider">•</span>
            <span>Frontend development mode</span>
            <CircleAlert size={15} />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, detail, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon"><Icon size={20} /></div>
      </div>
      <h2>{value}</h2>
      <p>{detail}</p>
    </article>
  );
}
