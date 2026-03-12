import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const AddMedicationSchedule = () => {

    const navigate = useNavigate();
    const patientId = localStorage.getItem("userId");

    const [medicineName, setMedicineName] = useState("");
    const [dosage, setDosage] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [time, setTime] = useState("");
    const [frequency, setFrequency] = useState("DAILY");
    const [customDates, setCustomDates] = useState("");

    const handleSubmit = async () => {

        try {

            await api.post("/api/schedules/create", {
                patientId: Number(patientId),
                medicineName,
                dosage,
                startDate: new Date(startDate).toISOString().split("T")[0],
                endDate: new Date(endDate).toISOString().split("T")[0],
                time: time + ":00",
                frequency,
                customDates: frequency === "CUSTOM" ? customDates : ""
            });

            alert("Medication reminder created successfully");

            navigate("/patient");

        } catch (err) {

            console.error(err);
            alert("Failed to create reminder");

        }

    };

    return (

        <div style={s.page}>

            <div style={s.sidebar}>
                <div style={s.logo}>💊 MedTracker</div>

                <button style={s.nav} onClick={() => navigate("/patient")}>
                    ← Back to Dashboard
                </button>
            </div>

            <div style={s.main}>

                <h1 style={s.title}>⏰ Add Medication Reminder</h1>

                <div style={s.card}>

                    <div style={s.formGroup}>
                        <label style={s.label}>Medicine Name</label>
                        <input
                            style={s.input}
                            value={medicineName}
                            onChange={(e) => setMedicineName(e.target.value)}
                        />
                    </div>

                    <div style={s.formGroup}>
                        <label style={s.label}>Dosage</label>
                        <input
                            style={s.input}
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                        />
                    </div>

                    <div style={s.formGroup}>
                        <label style={s.label}>Start Date</label>
                        <input
                            type="date"
                            style={s.input}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div style={s.formGroup}>
                        <label style={s.label}>End Date</label>
                        <input
                            type="date"
                            style={s.input}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div style={s.formGroup}>
                        <label style={s.label}>Time</label>
                        <input
                            type="time"
                            style={s.input}
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>

                    <div style={s.formGroup}>
                        <label style={s.label}>Frequency</label>

                        <select
                            style={s.input}
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            <option value="DAILY">Daily</option>
                            <option value="ALTERNATE">Alternate Day</option>
                            <option value="CUSTOM">Custom</option>
                        </select>
                    </div>

                    {frequency === "CUSTOM" && (
                        <div style={s.formGroup}>
                            <label style={s.label}>Custom Dates (comma separated)</label>
                            <input
                                style={s.input}
                                value={customDates}
                                onChange={(e) => setCustomDates(e.target.value)}
                                placeholder="2026-03-12,2026-03-15"
                            />
                        </div>
                    )}

                    <button style={s.submitBtn} onClick={handleSubmit}>
                        Create Reminder
                    </button>

                </div>

            </div>

        </div>

    );

};

export default AddMedicationSchedule;



const s = {

    page: {
        display: "flex",
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        fontFamily: "'Inter', sans-serif"
    },

    sidebar: {
        width: "220px",
        background: "#111827",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        borderRight: "1px solid #1e293b"
    },

    logo: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#38bdf8",
        marginBottom: "20px"
    },

    nav: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        padding: "10px 14px",
        borderRadius: "8px",
        textAlign: "left",
        cursor: "pointer",
        fontSize: "14px"
    },

    main: {
        flex: 1,
        padding: "40px"
    },

    title: {
        fontSize: "26px",
        fontWeight: "700",
        marginBottom: "30px"
    },

    card: {
        background: "#111827",
        padding: "30px",
        borderRadius: "12px",
        border: "1px solid #1e293b",
        maxWidth: "450px"
    },

    formGroup: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "18px"
    },

    label: {
        fontSize: "13px",
        color: "#94a3b8",
        marginBottom: "6px"
    },

    input: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #1e293b",
        background: "#020617",
        color: "white",
        fontSize: "14px"
    },

    submitBtn: {
        marginTop: "10px",
        background: "linear-gradient(135deg,#1e40af,#1d4ed8)",
        border: "none",
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "14px"
    }

};