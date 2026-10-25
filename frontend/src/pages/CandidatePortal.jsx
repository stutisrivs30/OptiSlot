
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

const availableSkills = [
    { id: 1, name: "JavaScript" },
    { id: 2, name: "Algorithms" },
    { id: 3, name: "System Design" },
    { id: 4, name: "Communication" },
    { id: 5, name: "HR" }
];

const inputStyle = {
    width: "100%",
    padding: 12,
    marginTop: 6,
    marginBottom: 16,
    border: "1px solid #d5d9e5",
    borderRadius: 8,
    boxSizing: "border-box"
};

const buttonStyle = {
    padding: "12px 24px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    width: "100%"
};

const sectionStyle = {
    marginTop: 28,
    paddingTop: 24,
    borderTop: "1px solid #e5e7eb"
};

export default function CandidatePortal() {
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        applicationNumber: ""
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [candidates, setCandidates] = useState([]);
    const [candidateId, setCandidateId] = useState("");
    const [candidatesError, setCandidatesError] = useState("");

    const [selectedSkills, setSelectedSkills] = useState([]);
    const [skillsSaving, setSkillsSaving] = useState(false);
    const [skillsMessage, setSkillsMessage] = useState("");
    const [skillsError, setSkillsError] = useState("");

    const [availability, setAvailability] = useState({
        date: "",
        startTime: "",
        endTime: ""
    });

    const [availabilitySaving, setAvailabilitySaving] = useState(false);
    const [availabilityMessage, setAvailabilityMessage] = useState("");
    const [availabilityError, setAvailabilityError] = useState("");

    useEffect(() => {
        async function loadCandidates() {
            try {
                const response = await fetch(`${API_URL}/candidates`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Could not load candidates"
                    );
                }

                setCandidates(data.candidates || []);
            } catch (err) {
                setCandidatesError(err.message);
            }
        }

        loadCandidates();
    }, []);

    function handleCandidateChange(event) {
        setCandidateId(event.target.value);
        setSelectedSkills([]);
        setSkillsMessage("");
        setSkillsError("");
        setAvailabilityMessage("");
        setAvailabilityError("");
    }

    function handleSkillChange(skillId) {
        setSelectedSkills((previous) => {
            if (previous.includes(skillId)) {
                return previous.filter((id) => id !== skillId);
            }

            return [...previous, skillId];
        });
    }

    function handleAvailabilityChange(event) {
        const { name, value } = event.target;

        setAvailability((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(`${API_URL}/candidates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed."
                );
            }

            setMessage(
                "Registration successful! You can now add skills and availability below."
            );

            setForm({
                fullName: "",
                email: "",
                password: "",
                applicationNumber: ""
            });

            const newCandidate = data.candidate;

            if (newCandidate?.id) {
                setCandidates((previous) => [
                    ...previous,
                    newCandidate
                ]);

                setCandidateId(String(newCandidate.id));
            }

        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSkillsSubmit(event) {
        event.preventDefault();

        setSkillsMessage("");
        setSkillsError("");

        if (!candidateId) {
            setSkillsError("Please select a candidate.");
            return;
        }

        if (selectedSkills.length === 0) {
            setSkillsError("Please select at least one skill.");
            return;
        }

        setSkillsSaving(true);

        try {
            const response = await fetch(
                `${API_URL}/candidates/${candidateId}/skills`,
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
                "Candidate skills saved successfully!"
            );

        } catch (err) {
            setSkillsError(err.message);
        } finally {
            setSkillsSaving(false);
        }
    }

    async function handleAvailabilitySubmit(event) {
        event.preventDefault();

        setAvailabilityMessage("");
        setAvailabilityError("");

        if (!candidateId) {
            setAvailabilityError("Please select a candidate.");
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

        setAvailabilitySaving(true);

        try {
            const response = await fetch(
                `${API_URL}/availability/candidates`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        candidateId: Number(candidateId),
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
                "Candidate availability saved successfully!"
            );

            setAvailability({
                date: "",
                startTime: "",
                endTime: ""
            });

        } catch (err) {
            setAvailabilityError(err.message);
        } finally {
            setAvailabilitySaving(false);
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: "48px 20px",
                color: "#172033"
            }}
        >
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
                <a href="/" style={{ color: "#4f46e5" }}>
                    ← Back to portal selection
                </a>

                <div
                    style={{
                        background: "white",
                        padding: 32,
                        borderRadius: 16,
                        marginTop: 24,
                        boxShadow: "0 8px 30px rgba(0,0,0,0.06)"
                    }}
                >
                    <h1>OptiSlot Candidate Portal</h1>

                    <p>
                        Register once, then manage your
                        skills and interview availability.
                    </p>

                    <div style={sectionStyle}>
                        <h2>New Candidate Registration</h2>

                        <form onSubmit={handleSubmit}>
                            <label>
                                Full Name
                                <input
                                    style={inputStyle}
                                    required
                                    value={form.fullName}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            fullName: event.target.value
                                        })
                                    }
                                    placeholder="Your full name"
                                />
                            </label>

                            <label>
                                Email
                                <input
                                    style={inputStyle}
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            email: event.target.value
                                        })
                                    }
                                    placeholder="you@example.com"
                                />
                            </label>

                            <label>
                                Password
                                <input
                                    style={inputStyle}
                                    type="password"
                                    minLength={8}
                                    required
                                    value={form.password}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            password: event.target.value
                                        })
                                    }
                                    placeholder="At least 8 characters"
                                />
                            </label>

                            <label>
                                Application Number
                                <input
                                    style={inputStyle}
                                    value={form.applicationNumber}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            applicationNumber: event.target.value
                                        })
                                    }
                                    placeholder="e.g. APP-004"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={saving}
                                style={buttonStyle}
                            >
                                {saving
                                    ? "Registering..."
                                    : "Register Candidate"}
                            </button>
                        </form>

                        {message && (
                            <p style={{ color: "green" }}>
                                {message}
                            </p>
                        )}

                        {error && (
                            <p style={{ color: "red" }}>
                                {error}
                            </p>
                        )}
                    </div>

                    <div style={sectionStyle}>
                        <h2>Already Registered?</h2>

                        <p>
                            Select your existing candidate account.
                            You do not need to register again.
                        </p>

                        <label>
                            Select Candidate
                            <select
                                style={inputStyle}
                                value={candidateId}
                                onChange={handleCandidateChange}
                            >
                                <option value="">
                                    -- Select Candidate --
                                </option>

                                {candidates.map((candidate) => (
                                    <option
                                        key={candidate.id}
                                        value={candidate.id}
                                    >
                                        {candidate.full_name}
                                        {" - "}
                                        {candidate.application_number || candidate.email}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {candidatesError && (
                            <p style={{ color: "red" }}>
                                {candidatesError}
                            </p>
                        )}
                    </div>

                    {candidateId && (
                        <>
                            <div style={sectionStyle}>
                                <h2>Select Your Skills</h2>

                                <p>
                                    Choose the skills relevant
                                    to your interviews.
                                </p>

                                <form onSubmit={handleSkillsSubmit}>
                                    {availableSkills.map((skill) => (
                                        <label
                                            key={skill.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                marginBottom: 12,
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
                                        disabled={skillsSaving}
                                        style={buttonStyle}
                                    >
                                        {skillsSaving
                                            ? "Saving..."
                                            : "Save Skills"}
                                    </button>
                                </form>

                                {skillsMessage && (
                                    <p style={{ color: "green" }}>
                                        {skillsMessage}
                                    </p>
                                )}

                                {skillsError && (
                                    <p style={{ color: "red" }}>
                                        {skillsError}
                                    </p>
                                )}
                            </div>

                            <div style={sectionStyle}>
                                <h2>Add Interview Availability</h2>

                                <p>
                                    Select a date and time when
                                    you are available.
                                </p>

                                <form onSubmit={handleAvailabilitySubmit}>
                                    <label>
                                        Date
                                        <input
                                            type="date"
                                            name="date"
                                            value={availability.date}
                                            onChange={handleAvailabilityChange}
                                            required
                                            style={inputStyle}
                                        />
                                    </label>

                                    <label>
                                        Start Time
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={availability.startTime}
                                            onChange={handleAvailabilityChange}
                                            required
                                            style={inputStyle}
                                        />
                                    </label>

                                    <label>
                                        End Time
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={availability.endTime}
                                            onChange={handleAvailabilityChange}
                                            required
                                            style={inputStyle}
                                        />
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={availabilitySaving}
                                        style={buttonStyle}
                                    >
                                        {availabilitySaving
                                            ? "Saving..."
                                            : "Save Availability"}
                                    </button>
                                </form>

                                {availabilityMessage && (
                                    <p style={{ color: "green" }}>
                                        {availabilityMessage}
                                    </p>
                                )}

                                {availabilityError && (
                                    <p style={{ color: "red" }}>
                                        {availabilityError}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
