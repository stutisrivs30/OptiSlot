const portals = [
  {
    title: "Candidate Portal",
    description: "Register and manage your interview details.",
    href: "/candidate",
  },
  {
    title: "Interviewer Portal",
    description: "Manage your interviewer profile and availability.",
    href: "/interviewer",
  },
  {
    title: "Administrator Portal",
    description: "Manage candidates, interviewers, rooms and schedules.",
    href: "/admin",
  },
];

export default function PortalHome() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "70px 20px",
        color: "#172033",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: 38 }}>
          Welcome to OptiSlot
        </h1>

        <p style={{ textAlign: "center", marginBottom: 40 }}>
          Intelligent Interview Scheduling — Choose your portal
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
          }}
        >
          {portals.map((portal) => (
            <a
              key={portal.href}
              href={portal.href}
              style={{
                display: "block",
                padding: 30,
                background: "white",
                borderRadius: 16,
                color: "inherit",
                textDecoration: "none",
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              }}
            >
              <h2>{portal.title}</h2>
              <p>{portal.description}</p>
              <strong style={{ color: "#4f46e5" }}>
                Open Portal →
              </strong>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}