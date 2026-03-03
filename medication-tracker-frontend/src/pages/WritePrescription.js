import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const WritePrescription = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [form, setForm] = useState({
        medicationName: "",
        dosage: "",
        instructions: "",
        startDate: "",
        endDate: "",
        doctorNotes: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);

    // Doctor ID from localStorage
    const doctorId = localStorage.getItem("userId");

    // Load patients
    useEffect(() => {
        api.get("/api/users/patients")
            .then(res => {
                console.log("Patients loaded:", res.data);
                setPatients(res.data);
            })
            .catch(err => {
                console.error("Failed to load patients", err.response?.status, err.message);
            });
    }, []);

    const handlePatientChange = (e) => {
        const pid = Number(e.target.value);
        const p = patients.find(p => p.id === pid);
        setSelectedPatient(p || null);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) {
            alert("Please select a patient");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                patientId: selectedPatient.id,
                doctorId: doctorId
            };

            const res = await api.post("/api/prescriptions/create", payload);
            setSuccess(res.data.id);
        } catch (err) {
            alert("❌ Failed to create prescription: " + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    // ✅ PDF DOWNLOAD FUNCTION (INSIDE COMPONENT)
    const downloadPdf = async () => {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `http://localhost:8080/api/prescriptions/${success}/pdf`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "prescription.pdf";
        a.click();
    };

    // Success Page
    if (success) {
        return (
            <div style={s.container}>
                <div style={s.successCard}>
                    <div style={s.successIcon}>✅</div>
                    <h2 style={s.successTitle}>Prescription Created!</h2>
                    <p style={s.successText}>The prescription has been submitted for admin approval.</p>

                    <div style={s.btnRow}>
                        <button onClick={downloadPdf} style={s.downloadBtn}>
                            📄 Download PDF Preview
                        </button>

                        <button onClick={() => navigate("/doctor")} style={s.backBtn}>
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main Form
    return (
        <div style={s.container}>
            <div style={s.card}>
                <button onClick={() => navigate("/doctor")} style={s.backLink}>
                    ← Dashboard
                </button>

                <h2 style={s.heading}>📋 Write Prescription</h2>

                <form onSubmit={handleSubmit} style={s.form}>
                    {/* Patient Dropdown */}
                    <div style={s.group}>
                        <label style={s.label}>Select Patient *</label>
                        <select onChange={handlePatientChange} style={s.input} required defaultValue="">
                            <option value="" disabled>-- Choose a patient --</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Auto Email */}
                    <div style={s.group}>
                        <label style={s.label}>Patient Email</label>
                        <input
                            value={selectedPatient ? selectedPatient.email : ""}
                            readOnly
                            style={{ ...s.input, opacity: 0.6 }}
                        />
                    </div>

                    <div style={s.divider} />

                    {/* Medication Fields */}
                    <div style={s.group}>
                        <label style={s.label}>Medication Name *</label>
                        <input name="medicationName" required onChange={handleChange} style={s.input} />
                    </div>

                    <div style={s.group}>
                        <label style={s.label}>Dosage *</label>
                        <input name="dosage" required onChange={handleChange} style={s.input} />
                    </div>

                    <div style={s.group}>
                        <label style={s.label}>Instructions *</label>
                        <input name="instructions" required onChange={handleChange} style={s.input} />
                    </div>

                    <div style={s.row}>
                        <div style={{ ...s.group, flex: 1 }}>
                            <label style={s.label}>Start Date *</label>
                            <input type="date" name="startDate" required onChange={handleChange} style={s.input} />
                        </div>

                        <div style={{ ...s.group, flex: 1 }}>
                            <label style={s.label}>End Date *</label>
                            <input type="date" name="endDate" required onChange={handleChange} style={s.input} />
                        </div>
                    </div>

                    <div style={s.group}>
                        <label style={s.label}>Doctor Notes</label>
                        <textarea name="doctorNotes" onChange={handleChange} style={s.textarea} />
                    </div>

                    <button type="submit" style={s.submitBtn} disabled={loading}>
                        {loading ? "⏳ Generating PDF..." : "🖊 Submit Prescription"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WritePrescription;


// Styles
const s = {
    container: { minHeight: "100vh", background: "linear-gradient(135deg,#0f172a,#1e293b)", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "30px 20px" },
    card: { background: "#111827", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "620px", boxShadow: "0 0 30px rgba(56,189,248,0.15)", color: "white" },
    backLink: { background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "14px", marginBottom: "16px" },
    heading: { color: "#38bdf8", marginBottom: "24px", fontSize: "22px" },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    group: { display: "flex", flexDirection: "column", gap: "6px" },
    label: { fontSize: "13px", color: "#94a3b8", fontWeight: "600" },
    input: { padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white" },
    textarea: { padding: "10px", borderRadius: "8px", border: "1px solid #334155", background: "#0f172a", color: "white" },
    row: { display: "flex", gap: "16px" },
    divider: { borderBottom: "1px solid #1e293b" },
    submitBtn: { background: "#3b82f6", padding: "12px", borderRadius: "10px", border: "none", color: "white", fontWeight: "bold" },
    successCard: { background: "#111827", padding: "40px", borderRadius: "16px", textAlign: "center", color: "white" },
    successIcon: { fontSize: "50px" },
    successTitle: { color: "#10b981" },
    successText: { color: "#94a3b8" },
    btnRow: { display: "flex", gap: "12px", justifyContent: "center" },
    downloadBtn: { background: "#1e40af", color: "white", padding: "10px", borderRadius: "8px" },
    backBtn: { background: "#374151", color: "white", padding: "10px", borderRadius: "8px" }
};