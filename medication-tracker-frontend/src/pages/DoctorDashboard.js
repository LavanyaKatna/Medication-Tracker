import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const STATUS_COLORS = {
    PENDING: { bg: "#1e3a5f", color: "#60a5fa" },
    APPROVED: { bg: "#064e3b", color: "#34d399" },
    REJECTED: { bg: "#4c1d1d", color: "#f87171" },
};

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const doctorId = localStorage.getItem("userId");

    useEffect(() => {
        api.get(`/api/prescriptions/doctor/${doctorId}`)
            .then(res => { setPrescriptions(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [doctorId]);

    const handleDownloadPdf = (id) => {
        window.open(`http://localhost:8080/api/prescriptions/${id}/pdf`, "_blank");
    };
    const handleViewPdf = async (id) => {
        try {
            const token = localStorage.getItem("token"); // JWT token
            const response = await fetch(`http://localhost:8080/api/prescriptions/${id}/pdf`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Unauthorized");

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank"); // opens PDF in a new tab
        } catch (err) {
            console.error(err);
            alert("You are not authorized to view this PDF.");
        }
    };

    return (
        <div style={s.page}>
            {/* Sidebar */}
            <div style={s.sidebar}>
                <div style={s.logo}>💊 MedTracker</div>
                <div style={s.navSection}>Doctor Panel</div>
                <button style={s.activeNav}>📋 My Prescriptions</button>
                <button style={s.nav} onClick={() => navigate("/doctor/write-prescription")}>
                    🖊 Write Prescription
                </button>
                <button style={s.nav} onClick={() => { localStorage.clear(); navigate("/"); }}>
                    🚪 Logout
                </button>
            </div>

            {/* Main content */}
            <div style={s.main}>
                <div style={s.topBar}>
                    <h1 style={s.title}>Doctor Dashboard</h1>
                    <button style={s.ctaBtn} onClick={() => navigate("/doctor/write-prescription")}>
                        🖊 Write New Prescription
                    </button>
                </div>

                {/* Stats row */}
                <div style={s.statsRow}>
                    <div style={s.stat}>
                        <span style={s.statNum}>{prescriptions.length}</span>
                        <span style={s.statLabel}>Total</span>
                    </div>
                    <div style={s.stat}>
                        <span style={{ ...s.statNum, color: "#60a5fa" }}>{prescriptions.filter(p => p.status === "PENDING").length}</span>
                        <span style={s.statLabel}>Pending</span>
                    </div>
                    <div style={s.stat}>
                        <span style={{ ...s.statNum, color: "#34d399" }}>{prescriptions.filter(p => p.status === "APPROVED").length}</span>
                        <span style={s.statLabel}>Approved</span>
                    </div>
                    <div style={s.stat}>
                        <span style={{ ...s.statNum, color: "#f87171" }}>{prescriptions.filter(p => p.status === "REJECTED").length}</span>
                        <span style={s.statLabel}>Rejected</span>
                    </div>
                </div>

                {/* Table */}
                <div style={s.card}>
                    <h3 style={s.cardTitle}>All Prescriptions</h3>
                    {loading ? (
                        <div style={s.loading}>Loading...</div>
                    ) : prescriptions.length === 0 ? (
                        <div style={s.empty}>No prescriptions yet. Write one to get started!</div>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {["#", "Patient", "Medication", "Dosage", "Start", "End", "Status", "Reject Reason", "View PDF", "Download PDF"].map(h => (
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map((p, i) => (
                                    <tr key={p.id} style={s.tr}>
                                        <td style={s.td}>{i + 1}</td>
                                        <td style={s.td}>{p.patient?.name || "N/A"}</td>
                                        <td style={s.td}>{p.medicationName}</td>
                                        <td style={s.td}>{p.dosage}</td>
                                        <td style={s.td}>{p.startDate}</td>
                                        <td style={s.td}>{p.endDate}</td>
                                        <td style={s.td}>
                                            <span style={{
                                                ...s.badge,
                                                background: STATUS_COLORS[p.status]?.bg,
                                                color: STATUS_COLORS[p.status]?.color,
                                            }}>{p.status}</span>
                                        </td>
                                        {/* Reject Reason column */}
                                        <td style={s.td}>
                                            {p.status === "REJECTED" ? p.rejectReason || "No reason provided" : "—"}
                                        </td>
                                        <td style={s.td}>
                                            <button style={s.pdfBtn} onClick={() => handleViewPdf(p.id)}>
                                                👁 View
                                            </button>
                                        </td>
                                        <td style={s.td}>
                                            <button style={s.pdfBtn} onClick={() => handleDownloadPdf(p.id)}>
                                                ⬇ Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;

const s = {
    page: { display: "flex", minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "220px", background: "#111827", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px", borderRight: "1px solid #1e293b" },
    logo: { fontSize: "18px", fontWeight: "bold", color: "#38bdf8", marginBottom: "20px" },
    navSection: { fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px", marginTop: "8px" },
    activeNav: { background: "linear-gradient(135deg,#1e40af,#1d4ed8)", border: "none", color: "white", padding: "10px 14px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontWeight: "600" },
    nav: { background: "none", border: "none", color: "#94a3b8", padding: "10px 14px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontSize: "14px" },
    main: { flex: 1, padding: "32px" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
    title: { fontSize: "26px", fontWeight: "700", margin: 0 },
    ctaBtn: { background: "linear-gradient(135deg,#06b6d4,#3b82f6)", border: "none", color: "white", padding: "12px 22px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" },
    statsRow: { display: "flex", gap: "16px", marginBottom: "28px" },
    stat: { background: "#111827", padding: "20px 24px", borderRadius: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px", border: "1px solid #1e293b" },
    statNum: { fontSize: "32px", fontWeight: "800", color: "white" },
    statLabel: { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
    card: { background: "#111827", borderRadius: "12px", padding: "24px", border: "1px solid #1e293b" },
    cardTitle: { color: "#38bdf8", marginBottom: "20px", marginTop: 0 },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "10px 14px", textAlign: "left", fontSize: "12px", color: "#64748b", borderBottom: "1px solid #1e293b", textTransform: "uppercase", letterSpacing: "0.5px" },
    tr: { borderBottom: "1px solid #1e293b" },
    td: { padding: "12px 14px", fontSize: "14px", color: "#e2e8f0" },
    badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    pdfBtn: { background: "#1e3a5f", color: "#60a5fa", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
    loading: { color: "#64748b", textAlign: "center", padding: "40px" },
    empty: { color: "#64748b", textAlign: "center", padding: "40px" },
};
