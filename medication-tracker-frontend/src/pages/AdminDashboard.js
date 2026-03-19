import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from "recharts";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState("pending");
    const [pending, setPending] = useState([]);
    const [all, setAll] = useState([]);
    const [rejectModal, setRejectModal] = useState(null); // prescription id
    const [rejectReason, setRejectReason] = useState("");
    const [auditModal, setAuditModal] = useState(null); // audit list
    const adminId = localStorage.getItem("userId");
    const [userGrowth, setUserGrowth] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [adminStats, setAdminStats] = useState({ users: 0, prescriptions: 0, alerts: 0 });
    const [systemUsage, setSystemUsage] = useState([]);

    useEffect(() => {
        api.get("/api/prescriptions/pending")
            .then(r => setPending(r.data)).catch(() => { });
        api.get("/api/prescriptions/all")
            .then(r => setAll(r.data)).catch(() => { });

        api.get("/api/analytics/admin-stats")
            .then(res => setAdminStats(res.data)).catch(err => console.error(err));

        api.get("/api/analytics/system-usage")
            .then(res => {
                if (res.data.labels && res.data.values) {
                    const formatted = res.data.labels.map((lbl, idx) => ({ date: lbl, count: res.data.values[idx] }));
                    setSystemUsage(formatted);
                }
            }).catch(err => console.error(err));

        api.get("/api/analytics/user-growth")
            .then(res => {
                if (res.data.labels && res.data.values) {
                    const formatted = res.data.labels.map((lbl, idx) => ({ date: lbl, count: res.data.values[idx] }));
                    setUserGrowth(formatted);
                } else {
                    setUserGrowth(res.data);
                }
            })
            .catch(err => console.error(err));

        api.get("/api/analytics/alerts-by-type")
            .then(res => {
                if (res.data.labels && res.data.values) {
                    const formatted = res.data.labels.map((lbl, idx) => ({ type: lbl, count: res.data.values[idx] }));
                    setAlerts(formatted);
                } else {
                    setAlerts(res.data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleApprove = async (id) => {
        await api.put(`/api/prescriptions/${id}/approve`, { adminId });
        setPending(prev => prev.filter(p => p.id !== id));
        const updated = await api.get("/api/prescriptions/all");
        setAll(updated.data);
    };

    const handleReject = async () => {
        await api.put(`/api/prescriptions/${rejectModal}/reject`, { adminId, reason: rejectReason });
        setPending(prev => prev.filter(p => p.id !== rejectModal));
        const updated = await api.get("/api/prescriptions/all");
        setAll(updated.data);
        setRejectModal(null); setRejectReason("");
    };

    const showAudit = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get(`/api/prescriptions/${id}/audit`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // res.data is now an array of objects with doctor, patient, action, changedAt, changedBy, reason
            setAuditModal(res.data);
        } catch (err) {
            console.error(err);
            alert("Cannot fetch audit. You might not have permission.");
        }
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

    const formatSafeDate = (d) => {
        if (!d) return "—";
        if (Array.isArray(d)) return d.join("-");
        return d;
    };

    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Patient,Doctor,Medication,Dosage,Duration,Status\n";
        all.forEach(p => {
            const patientName = p.patient?.name ? `"${p.patient.name}"` : "—";
            const doctorName = p.doctor?.name ? `"${p.doctor.name}"` : "—";
            const medName = p.medicationName ? `"${p.medicationName}"` : "—";
            const dosage = p.dosage ? `"${p.dosage}"` : "—";
            const duration = `${formatSafeDate(p.startDate)} to ${formatSafeDate(p.endDate)}`;
            const row = `${patientName},${doctorName},${medName},${dosage},"${duration}","${p.status}"`;
            csvContent += row + "\n";
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "prescriptions_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadSystemAnalyticsCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Metric,Value\n";
        csvContent += `"Total Users","${adminStats.users}"\n`;
        csvContent += `"Total Prescriptions","${adminStats.prescriptions}"\n`;
        csvContent += `"Total Alerts","${adminStats.alerts}"\n`;
        csvContent += "\n";
        csvContent += "System Usage Over Time\n";
        csvContent += "Date,Activity Count\n";
        systemUsage.forEach(d => {
            csvContent += `"${formatSafeDate(d.date)}","${d.count}"\n`;
        });
        csvContent += "\n";
        csvContent += "User Growth\n";
        csvContent += "Date,New Users\n";
        userGrowth.forEach(d => {
            csvContent += `"${formatSafeDate(d.date)}","${d.count}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "system_analytics_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const displayed = tab === "pending" ? pending : all.filter(p => p.status !== "PENDING");

    return (
        <div style={s.page}>
            {/* Sidebar */}
            <div style={s.sidebar}>
                <div style={s.logo}>💊 MedTracker</div>
                <div style={s.navSection}>Admin Panel</div>
                <button style={tab === "pending" ? s.activeNav : s.nav} onClick={() => setTab("pending")}>⏳ Pending Approval</button>
                <button style={tab === "history" ? s.activeNav : s.nav} onClick={() => setTab("history")}>📂 History</button>
                <button style={s.nav} onClick={() => { localStorage.clear(); navigate("/"); }}>🚪 Logout</button>
            </div>

            <div style={s.main}>
                <div style={s.topBar}>
                    <h1 style={s.title}>Admin Dashboard</h1>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button style={s.downloadBtn} onClick={downloadCSV}>📥 Prescriptions (CSV)</button>
                        <button style={{ ...s.downloadBtn, background: "linear-gradient(135deg,#10b981,#047857)" }} onClick={downloadSystemAnalyticsCSV}>📥 System Analytics (CSV)</button>
                    </div>
                </div>

                <div style={s.statsRowCards}>
                    <div style={s.statCard}>
                        <h4 style={s.statTitle}>Total Users</h4>
                        <p style={s.statValue}>{adminStats.users}</p>
                    </div>
                    <div style={s.statCard}>
                        <h4 style={s.statTitle}>Total Prescriptions</h4>
                        <p style={{ ...s.statValue, color: "#34d399" }}>{adminStats.prescriptions}</p>
                    </div>
                    <div style={s.statCard}>
                        <h4 style={s.statTitle}>Total Alerts</h4>
                        <p style={{ ...s.statValue, color: "#f87171" }}>{adminStats.alerts}</p>
                    </div>
                </div>

                <div style={{ marginBottom: "28px" }}>
                    <h3 style={{ ...s.cardTitle, marginBottom: "12px" }}>Prescription Status</h3>
                    <div style={s.statsRow}>
                        <span style={s.statPill}>⏳ {pending.length} Pending</span>
                        <span style={{ ...s.statPill, color: "#34d399", borderColor: "#34d399" }}>✅ {all.filter(p => p.status === "APPROVED").length} Approved</span>
                        <span style={{ ...s.statPill, color: "#f87171", borderColor: "#f87171" }}>❌ {all.filter(p => p.status === "REJECTED").length} Rejected</span>
                    </div>
                </div>

                <div style={s.card}>
                    <h3 style={s.cardTitle}>{tab === "pending" ? "⏳ Pending Prescriptions" : "📂 Processed Prescriptions"}</h3>
                    {displayed.length === 0 ? (
                        <div style={s.empty}>No prescriptions in this category.</div>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {["Patient", "Doctor", "Medication", "Dosage", "Duration", "Status", "Actions"].map(h => (
                                        <th key={h} style={s.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayed.map(p => (
                                    <tr key={p.id} style={s.tr}>
                                        <td style={s.td}>{p.patient?.name || "—"}</td>
                                        <td style={s.td}>{p.doctor?.name || "—"}</td>
                                        <td style={s.td}><strong>{p.medicationName}</strong></td>
                                        <td style={s.td}>{p.dosage}</td>
                                        <td style={s.td}><small>{p.startDate} → {p.endDate}</small></td>
                                        <td style={s.td}>
                                            <span style={{ ...s.badge, ...(p.status === "PENDING" ? { background: "#1e3a5f", color: "#60a5fa" } : p.status === "APPROVED" ? { background: "#064e3b", color: "#34d399" } : { background: "#4c1d1d", color: "#f87171" }) }}>{p.status}</span>
                                        </td>
                                        <td style={s.td}>
                                            <div style={s.actionRow}>
                                                {p.status === "PENDING" && (
                                                    <>
                                                        <button style={s.approveBtn} onClick={() => handleApprove(p.id)}>✅ Approve</button>
                                                        <button style={s.rejectBtn} onClick={() => setRejectModal(p.id)}>❌ Reject</button>
                                                    </>
                                                )}

                                                <button style={s.auditBtn} onClick={() => showAudit(p.id)}>📜 Audit</button>

                                                {/* New View PDF button */}
                                                <button
                                                    style={s.pdfBtn}
                                                    onClick={() => handleViewPdf(p.id)} // opens in new tab
                                                >
                                                    👁 View
                                                </button>

                                                {/* Existing PDF link (download or direct link) */}
                                                <a
                                                    href={`http://localhost:8080/api/prescriptions/${p.id}/pdf`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={s.pdfBtn}
                                                >
                                                    📄 PDF
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {/* System Usage Line Chart */}
                <div style={s.card}>
                    <h3 style={s.cardTitle}>System Usage Over Time</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={systemUsage}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* User Growth Chart */}
                <div style={s.card}>
                    <h3 style={s.cardTitle}>User Growth</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Alerts Chart */}
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Alerts Overview</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={alerts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="type" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f87171" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div style={s.overlay}>
                    <div style={s.modal}>
                        <h3 style={{ color: "#f87171", marginTop: 0 }}>❌ Reject Prescription</h3>
                        <p style={{ color: "#94a3b8" }}>Please provide a reason for rejection:</p>
                        <textarea placeholder="Reason..." value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            style={s.textarea} />
                        <div style={s.btnRow}>
                            <button style={s.rejectBtn} onClick={handleReject}>Confirm Reject</button>
                            <button style={s.cancelBtn} onClick={() => setRejectModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= AUDIT MODAL ================= */}
            {auditModal && (
                <div style={s.overlay}>
                    <div style={{ ...s.modal, maxWidth: "560px" }}>
                        <h3 style={{ color: "#38bdf8", marginTop: 0 }}>
                            📜 Audit Trail
                        </h3>

                        {auditModal.length === 0 ? (
                            <p style={{ color: "#64748b" }}>No audit entries.</p>
                        ) : (
                            <div style={s.timeline}>
                                {auditModal.map((a, i) => (
                                    <div key={i} style={s.timelineItem}>



                                        {/* Timeline Content */}
                                        <div style={s.timelineContent}>
                                            <div style={s.timelineHeader}>

                                                {/* Action Name */}
                                                <span style={s.timelineAction}>
                                                    {a.action === "CREATED" && "📝 Created"}
                                                    {a.action === "APPROVED" && "✅ Approved"}
                                                    {a.action === "REJECTED" && "❌ Rejected"}

                                                    {a.performedBy && (
                                                        <span
                                                            style={{
                                                                color: "#94a3b8",
                                                                fontWeight: "normal",
                                                                marginLeft: "6px",
                                                                fontSize: "12px"
                                                            }}
                                                        >
                                                            {" by "}
                                                            {a.role === "DOCTOR" && "Dr. "}
                                                            {a.role === "ADMIN" && "Admin "}
                                                            {a.performedBy}
                                                        </span>
                                                    )}
                                                </span>

                                                {/* Date */}
                                                <span style={s.timelineDate}>
                                                    {new Date(a.changedAt).toLocaleString("en-IN", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>

                                            {/* Optional Details */}
                                            {a.details && (
                                                <div style={s.timelineDetails}>
                                                    {a.details}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            style={s.cancelBtn}
                            onClick={() => setAuditModal(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            {/* ================= END AUDIT MODAL ================= */}
        </div>
    );
};

export default AdminDashboard;

const s = {
    page: { display: "flex", minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "220px", background: "#111827", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px", borderRight: "1px solid #1e293b" },
    logo: { fontSize: "18px", fontWeight: "bold", color: "#38bdf8", marginBottom: "20px" },
    navSection: { fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px", marginTop: "8px" },
    activeNav: { background: "linear-gradient(135deg,#1e40af,#1d4ed8)", border: "none", color: "white", padding: "10px 14px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontWeight: "600" },
    nav: { background: "none", border: "none", color: "#94a3b8", padding: "10px 14px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontSize: "14px" },
    main: { flex: 1, padding: "32px" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" },
    title: { fontSize: "26px", fontWeight: "700", margin: 0 },
    downloadBtn: { background: "linear-gradient(135deg,#06b6d4,#3b82f6)", border: "none", color: "white", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
    statsRowCards: { display: "flex", gap: "16px", marginBottom: "28px" },
    statCard: { background: "#111827", padding: "20px", borderRadius: "12px", flex: 1, border: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "8px" },
    statTitle: { margin: 0, fontSize: "14px", color: "#94a3b8", textTransform: "uppercase" },
    statValue: { margin: 0, fontSize: "28px", fontWeight: "800", color: "#38bdf8" },
    statsRow: { display: "flex", gap: "10px" },
    statPill: { padding: "6px 14px", borderRadius: "20px", border: "1px solid #60a5fa", color: "#60a5fa", fontSize: "12px", fontWeight: "600" },
    card: { background: "#111827", borderRadius: "12px", padding: "24px", border: "1px solid #1e293b" },
    cardTitle: { color: "#38bdf8", marginBottom: "20px", marginTop: 0 },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "10px 12px", textAlign: "left", fontSize: "12px", color: "#64748b", borderBottom: "1px solid #1e293b", textTransform: "uppercase" },
    tr: { borderBottom: "1px solid #1e293b" },
    td: { padding: "12px 12px", fontSize: "13px", color: "#e2e8f0" },
    badge: { padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" },
    actionRow: { display: "flex", gap: "6px", flexWrap: "wrap" },
    approveBtn: { background: "#064e3b", color: "#34d399", border: "1px solid #34d399", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    rejectBtn: { background: "#4c1d1d", color: "#f87171", border: "1px solid #f87171", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
    auditBtn: { background: "#1e3a5f", color: "#60a5fa", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
    pdfBtn: { background: "#312e81", color: "#a5b4fc", padding: "5px 10px", borderRadius: "6px", textDecoration: "none", fontSize: "12px", fontWeight: "600" },
    empty: { color: "#64748b", textAlign: "center", padding: "40px" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 },
    modal: { background: "#111827", padding: "32px", borderRadius: "16px", minWidth: "380px", border: "1px solid #1e293b", color: "white" },
    textarea: { width: "100%", minHeight: "80px", background: "#0f172a", border: "1px solid #334155", color: "white", padding: "10px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box" },
    btnRow: { display: "flex", gap: "10px" },
    cancelBtn: { background: "#374151", color: "white", border: "none", padding: "8px 18px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
    auditItem: { background: "#0f172a", padding: "12px 16px", borderRadius: "8px", marginBottom: "10px", borderLeft: "3px solid #38bdf8" },
    auditTag: { color: "#38bdf8", fontWeight: "700", fontSize: "13px" },
    auditDetail: { color: "#94a3b8", fontSize: "13px", marginTop: "4px" },
    auditTime: { color: "#475569", fontSize: "11px", marginTop: "4px" },
    timeline: {
        position: "relative",
        marginTop: "20px",
        paddingLeft: "25px",
        borderLeft: "2px solid #334155"
    },
    timelineItem: {
        position: "relative",
        marginBottom: "20px"
    },
    timelineDot: {
        position: "absolute",
        left: "-9px",
        top: "5px",
        width: "14px",
        height: "14px",
        borderRadius: "50%"
    },
    timelineContent: {
        background: "#1e293b",
        padding: "12px",
        borderRadius: "6px"
    },
    timelineHeader: {
        display: "flex",
        justifyContent: "space-between",
        fontWeight: "bold",
        color: "#fff"
    },
    timelineAction: {
        textTransform: "uppercase"
    },
    timelineDate: {
        fontSize: "12px",
        color: "#94a3b8"
    },
    timelineDetails: {
        marginTop: "6px",
        color: "#cbd5e1",
        fontSize: "14px"
    }
};
