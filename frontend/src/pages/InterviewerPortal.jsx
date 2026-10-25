
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

const availableSkills = [
    { id: 1, name: "JavaScript" },
    { id: 2, name: "Algorithms" },
    { id: 3, name: "System Design" },
    { id: 4, name: "Communication" },
    { id: 5, name: "HR" }
];

export default function InterviewerPortal() {
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        department: ""
    });

    const [interviewerId, setInterviewerId] = useState(null);

    const [availability, setAvailability] = useState({
        date: "",
        startTime: "",
        endTime: ""
    });

    const [selectedSkills, setSelectedSkills] = useState([]);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [availabilityMessage, setAvailabilityMessage] = useState("");
    const [availabilityError, setAvailabilityError] = useState("");
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const [skillsMessage, setSkillsMessage] = useState("");
    const [skillsError, setSkillsError] = useState("");
    const [skillsLoading, setSkillsLoading] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function handleAvailabilityChange(event) {
        const { name, value } = event.target;

        setAvailability((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function handleSkillChange(skillId) {
        setSelectedSkills((previous) => {
            if (previous.includes(skillId)) {
                return previous.filter((id) => id !== skillId);
            }

            return [...previous, skillId];
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/interviewers`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed"
                );
            }

            const newInterviewerId = data.interviewer?.id;

            if (!newInterviewerId) {
                throw new Error(
                    "Registration succeeded, but interviewer ID was not returned"
                );
            }

            setInterviewerId(newInterviewerId);

            setMessage(
                "Interviewer registered successfully! Now add your skills and availability."
            );

            setForm({
                fullName: "",
                email: "",
                password: "",
                department: ""
            });

            setSelectedSkills([]);
            setSkillsMessage("");
            setSkillsError("");
            setAvailabilityMessage("");
            setAvailabilityError("");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSkillsSubmit(event) {
        event.preventDefault();

        setSkillsMessage("");
        setSkillsError("");

        if (!interviewerId) {
            setSkillsError("Please register first.");
            return;
        }

        if (selectedSkills.length === 0) {
            setSkillsError("Please select at least one skill.");
            return;
        }

        setSkillsLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/interviewers/${interviewerId}/skills`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        skillIds: selectedSkills
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not save skills"
                );
            }

            setSkillsMessage(
                "Interviewer skills saved successfully!"
            );

        } catch (err) {
            setSkillsError(err.message);
        } finally {
            setSkillsLoading(false);
        }
    }

    async function handleAvailabilitySubmit(event) {
        event.preventDefault();

        setAvailabilityMessage("");
        setAvailabilityError("");

        if (!interviewerId) {
            setAvailabilityError("Please register first.");
            return;
        }

        const { date, startTime, endTime } = availability;

        const startDate = new Date(`${date}T${startTime}`);
        const endDate = new Date(`${date}T${endTime}`);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime()) ||
            startDate >= endDate
        ) {
            setAvailabilityError(
                "End time must be later than start time."
            );
            return;
        }

        setAvailabilityLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/availability/interviewers`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        interviewerId,
                        startTime: startDate.toISOString(),
                        endTime: endDate.toISOString()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Could not save availability"
                );
            }

            setAvailabilityMessage(
                "Availability saved successfully!"
            );

            setAvailability({
                date: "",
                startTime: "",
                endTime: ""
            });

        } catch (err) {
            setAvailabilityError(err.message);
        } finally {
            setAvailabilityLoading(false);
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: "40px 20px"
            }}
        >
            <div
                style={{
                    maxWidth: "450px",
                    margin: "0 auto",
                    background: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                }}
            >
                <h1>Interviewer Portal</h1>

                <p>Register as an interviewer for OptiSlot.</p>

                <form onSubmit={handleSubmit}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />

                    <label>Department</label>
                    <input
                        type="text"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        placeholder="e.g. Computer Science"
                        style={inputStyle}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={buttonStyle}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                {message && (
                    <p style={{ color: "green", marginTop: "15px" }}>
                        {message}
                    </p>
                )}

                {error && (
                    <p style={{ color: "red", marginTop: "15px" }}>
                        {error}
                    </p>
                )}

                {interviewerId && (
                    <>
                        <div style={sectionStyle}>
                            <h2>Select Your Skills</h2>

                            <p>
                                Choose the subjects you can
                                conduct interviews for.
                            </p>

                            <form onSubmit={handleSkillsSubmit}>
                                {availableSkills.map((skill) => (
                                    <label
                                        key={skill.id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            marginBottom: "12px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSkills.includes(
                                                skill.id
                                            )}
                                            onChange={() =>
                                                handleSkillChange(skill.id)
                                            }
                                        />

                                        {skill.name}
                                    </label>
                                ))}

                                <button
                                    type="submit"
                                    disabled={skillsLoading}
                                    style={buttonStyle}
                                >
                                    {skillsLoading
                                        ? "Saving..."
                                        : "Save Skills"}
                                </button>
                            </form>

                            {skillsMessage && (
                                <p
                                    style={{
                                        color: "green",
                                        marginTop: "15px"
                                    }}
                                >
                                    {skillsMessage}
                                </p>
                            )}

                            {skillsError && (
                                <p
                                    style={{
                                        color: "red",
                                        marginTop: "15px"
                                    }}
                                >
                                    {skillsError}
                                </p>
                            )}
                        </div>

                        <div style={sectionStyle}>
                            <h2>Add Availability</h2>

                            <p>
                                Select when you are available
                                to conduct interviews.
                            </p>

                            <form onSubmit={handleAvailabilitySubmit}>
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={availability.date}
                                    onChange={handleAvailabilityChange}
                                    required
                                    style={inputStyle}
                                />

                                <label>Start Time</label>
                                <input
                                    type="time"
                                    name="startTime"
                                    value={availability.startTime}
                                    onChange={handleAvailabilityChange}
                                    required
                                    style={inputStyle}
                                />

                                <label>End Time</label>
                                <input
                                    type="time"
                                    name="endTime"
                                    value={availability.endTime}
                                    onChange={handleAvailabilityChange}
                                    required
                                    style={inputStyle}
                                />

                                <button
                                    type="submit"
                                    disabled={availabilityLoading}
                                    style={buttonStyle}
                                >
                                    {availabilityLoading
                                        ? "Saving..."
                                        : "Save Availability"}
                                </button>
                            </form>

                            {availabilityMessage && (
                                <p
                                    style={{
                                        color: "green",
                                        marginTop: "15px"
                                    }}
                                >
                                    {availabilityMessage}
                                </p>
                            )}

                            {availabilityError && (
                                <p
                                    style={{
                                        color: "red",
                                        marginTop: "15px"
                                    }}
                                >
                                    {availabilityError}
                                </p>
                            )}
                        </div>
                    </>
                )}

                <p style={{ marginTop: "20px" }}>
                    <a href="/">← Back to Portal Selection</a>
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    marginBottom: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box"
};

const buttonStyle = {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px"
};

const sectionStyle = {
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #ddd"
};
