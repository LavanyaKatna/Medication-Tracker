import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import AdherenceTrendChart from "../components/AdherenceTrendChart";
import AdherenceChart from "../components/AdherenceChart";

const validityBadge = (endDate, renewalDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const renewal = new Date(renewalDate);
    renewal.setHours(0, 0, 0, 0);

    if (today > end) return { label: "Expired", bg: "#4c1d1d", color: "#f87171" };
    if (today >= renewal) return { label: "Due for Renewal", bg: "#422006", color: "#fb923c" };
    return { label: "Valid", bg: "#064e3b", color: "#34d399" };
};

const PatientDashboard = () => {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = React.useRef(null);

    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const patientId = localStorage.getItem("userId");
    console.log("Patient ID:", patientId);
    const [blink, setBlink] = useState(false);
    const [adherence, setAdherence] = useState(0);
    const [analytics, setAnalytics] = useState({ taken: 0, missed: 0 });
    const [trendData, setTrendData] = useState(null);


    useEffect(() => {
        if (!patientId) return;

        api.get(`/api/analytics/patient/adherence-trend/${patientId}`)
            .then(res => {
                console.log("Trend Data:", res.data);
                setTrendData(res.data);
            })
            .catch(err => console.error(err));
    }, [patientId]);
    useEffect(() => {

        api.get(`/api/schedules/analytics/${patientId}`)
            .then(res => setAnalytics(res.data))
            .catch(err => console.error(err));

    }, [patientId]);
    useEffect(() => {

        const fetchAdherence = async () => {
            try {
                const res = await api.get(`/api/schedules/adherence/${patientId}`);
                setAdherence(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAdherence();

    }, [patientId]);

    useEffect(() => {

        const fetchNotifications = async () => {
            try {

                const notifRes = await api.get(`/api/notifications/${patientId}`);

                // store ALL notifications
                setNotifications(notifRes.data);

                // count unread
                const unread = notifRes.data.filter(n => !n.isRead);
                setUnreadCount(unread.length);

            } catch (err) {
                console.error("Notification fetch error", err);
            }
        };

        const loadData = async () => {
            try {

                const pres = await api.get(`/api/prescriptions/patient/${patientId}`);
                setPrescriptions(pres.data);

                const sch = await api.get(`/api/schedules/patient/${patientId}`);
                setSchedules(sch.data);

                await fetchNotifications();

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();

        // 🔔 AUTO REFRESH NOTIFICATIONS
        const interval = setInterval(() => {
            fetchNotifications();
        }, 10000);

        return () => clearInterval(interval);

    }, [patientId]);


    useEffect(() => {

        const socket = new SockJS("http://localhost:8080/ws");

        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => console.log("WS:", str)
        });

        client.onConnect = () => {

            client.subscribe(`/topic/notifications/${patientId}`, (message) => {

                const newNotif = {
                    id: Date.now(),
                    message: message.body,
                    createdAt: new Date(),
                    isRead: false
                };

                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);

                // 🔔 trigger blinking bell
                setBlink(true);

            });

        };

        client.activate();

        return () => {
            client.deactivate();
        };

    }, [patientId]);

    const markAllRead = async () => {
        try {

            await api.put(`/api/notifications/${patientId}/read`);

            // clear notifications completely
            setNotifications([]);

            // reset unread count
            setUnreadCount(0);

        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = (id) => {
        window.open(`http://localhost:8080/api/prescriptions/${id}/pdf`, "_blank");
    };

    const formatSafeDate = (d) => {
        if (!d) return "—";
        if (Array.isArray(d)) return d.join("-");
        return d;
    };

    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Name,Date,Adherence %\n";
        const name = localStorage.getItem("userName") || "Patient";

        if (trendData && trendData.labels) {
            trendData.labels.forEach((dateObj, i) => {
                const date = formatSafeDate(dateObj);
                const adherence = trendData.values[i].toFixed(1);
                csvContent += `"${name}","${date}","${adherence}%"\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "patient_adherence_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={s.page}>
            {/* Sidebar */}
            <div style={s.sidebar}>
                <div style={s.logo}>💊 MedTracker</div>
                <div style={s.navSection}>Patient Portal</div>
                <button style={s.activeNav}>💊 My Prescriptions</button>
                <button style={s.nav} onClick={() => navigate("/add-schedule")}>
                    ⏰ Add Medication Reminder
                </button>
                <button style={s.nav} onClick={() => { localStorage.clear(); navigate("/"); }}>🚪 Logout</button>
            </div>

            {/* Main */}
            <div style={s.main}>
                {/* Top bar */}
                <div style={s.topBar}>
                    <h1 style={s.title}>Patient Dashboard</h1>
                    <div style={s.topActions}>
                        <button style={s.ctaBtn} onClick={downloadCSV}>⬇ Download Report (CSV)</button>
                        <div
                            style={blink ? { ...s.bellWrapper, ...s.blink } : s.bellWrapper}
                            onClick={() => {
                                setShowNotif(!showNotif);
                                setBlink(false);
                            }}
                        >
                            🔔
                            {unreadCount > 0 && <span style={s.badge}>{unreadCount}</span>}
                        </div>
                    </div>
                </div>

                {/* Notification dropdown */}
                {showNotif && (
                    <div ref={notifRef} style={s.notifPanel}>
                        <div style={s.notifHeader}>
                            <span style={{ fontWeight: 700, color: "#38bdf8" }}>🔔 Notifications</span>
                            <button style={s.markBtn} onClick={markAllRead}>Mark all read</button>
                        </div>
                        {notifications.length === 0 ? (
                            <div style={s.notifEmpty}>No notifications</div>
                        ) : (
                            notifications
                                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                .map(n => (
                                    <div
                                        key={n.id}
                                        style={{
                                            ...s.notifItem,
                                            opacity: n.isRead ? 0.5 : 1
                                        }}
                                    >
                                        <div style={s.notifMsg}>{n.message}</div>

                                        <div style={s.notifTime}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </div>

                                    </div>
                                ))
                        )}
                    </div>
                )}

                {/* Stats row */}
                <div style={s.statsRow}>
                    <div style={s.stat}>
                        <span style={s.statNum}>{prescriptions.length}</span>
                        <span style={s.statLabel}>Total Prescriptions</span>
                    </div>
                    <div style={s.stat}>
                        <span style={{ ...s.statNum, color: "#34d399" }}>{prescriptions.filter(p => new Date(p.endDate) >= new Date()).length}</span>
                        <span style={s.statLabel}>Active</span>
                    </div>
                    <div style={s.stat}>
                        <span style={{ ...s.statNum, color: "#f87171" }}>{prescriptions.filter(p => new Date(p.endDate) < new Date()).length}</span>
                        <span style={s.statLabel}>Expired</span>
                    </div>
                    <div style={s.stat}>
                        <span style={{ ...s.statNum, color: "#facc15" }}>{adherence.toFixed(1)}%</span>
                        <span style={s.statLabel}>Adherence</span>
                    </div>
                </div>

                {/* Prescriptions */}
                <div style={s.tableCard}>
                    <h3 style={s.cardTitle}>💊 Approved Prescriptions</h3>

                    {loading ? (
                        <div style={s.empty}>Loading prescriptions…</div>
                    ) : prescriptions.length === 0 ? (
                        <div style={s.empty}>No approved prescriptions found.</div>
                    ) : (
                        <table style={s.table}>
                            <thead style={s.tableHead}>
                                <tr>
                                    <th style={s.tableTh}>Medication</th>
                                    <th style={s.tableTh}>Dosage</th>
                                    <th style={s.tableTh}>Instructions</th>
                                    <th style={s.tableTh}>Start Date</th>
                                    <th style={s.tableTh}>End Date</th>
                                    <th style={s.tableTh}>Renewal Date</th>
                                    <th style={s.tableTh}>Doctor</th>
                                    <th style={s.tableTh}>PDF View</th>
                                    <th style={s.tableTh}>PDF Download</th>
                                    <th style={s.tableTh}>Status</th>
                                </tr>
                            </thead>
                            <tbody>

                                {prescriptions.map((p) => {
                                    const vb = validityBadge(p.endDate, p.renewalDate);
                                    return (
                                        <tr key={p.id}>
                                            <td style={s.tableTd}>
                                                <b>{p.medicationName}</b>

                                            </td>
                                            <td style={s.tableTd}>{p.dosage}</td>
                                            <td style={s.tableTd}>{p.instructions}</td>
                                            <td style={s.tableTd}>{p.startDate}</td>
                                            <td style={s.tableTd}>{p.endDate}</td>
                                            <td style={s.tableTd}>{p.renewalDate}</td>
                                            <td style={s.tableTd}>Dr. {p.doctor?.name || p.doctor_id}</td>
                                            <td style={s.tableTd}>
                                                <button
                                                    style={s.viewBtn}
                                                    onClick={async () => {
                                                        try {
                                                            const token = localStorage.getItem("token");
                                                            const response = await fetch(
                                                                `http://localhost:8080/api/prescriptions/${p.id}/pdf`,
                                                                { headers: { Authorization: `Bearer ${token}` } }
                                                            );

                                                            if (!response.ok) throw new Error("Unauthorized");

                                                            const blob = await response.blob();
                                                            const url = URL.createObjectURL(blob);
                                                            window.open(url, "_blank");
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert("You are not authorized to view this PDF.");
                                                        }
                                                    }}
                                                >
                                                    👁 View
                                                </button>
                                            </td>
                                            <td style={s.tableTd}>
                                                <button
                                                    style={s.downloadBtn}
                                                    onClick={() => handleDownload(p.id)}
                                                >
                                                    ⬇ Download
                                                </button>
                                            </td>
                                            <td style={{ ...s.tableTd, color: vb.color }}>{vb.label}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>


                {/* Medication Schedule */}
                <div style={s.tableCard}>
                    <h3 style={s.cardTitle}>⏰ Medication Reminders</h3>

                    {schedules.length === 0 ? (
                        <div style={s.empty}>No medication reminders created.</div>
                    ) : (
                        <table style={s.table}>
                            <thead style={s.tableHead}>
                                <tr>
                                    <th style={s.tableTh}>Medication</th>
                                    <th style={s.tableTh}>Dosage</th>
                                    <th style={s.tableTh}>Frequency</th>
                                    <th style={s.tableTh}>Start Date</th>
                                    <th style={s.tableTh}>End Date</th>
                                    <th style={s.tableTh}>Time</th>
                                    <th style={s.tableTh}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {schedules.map(sch => (
                                    <tr key={sch.id}>
                                        <td style={s.tableTd}>{sch.medicineName}</td>
                                        <td style={s.tableTd}>{sch.dosage}</td>

                                        <td style={s.tableTd}>{sch.frequency}</td>

                                        <td style={s.tableTd}>
                                            {sch.startDate}
                                        </td>
                                        <td style={s.tableTd}>
                                            {sch.endDate}
                                        </td>

                                        <td style={s.tableTd}>{sch.time}</td>

                                        <td style={s.tableTd}>
                                            <button
                                                style={s.vBtn}
                                                onClick={async () => {
                                                    await api.put(`/api/schedules/${sch.id}/taken`);
                                                    alert("Medication marked as taken");
                                                }}
                                            >
                                                ✅ Taken
                                            </button>

                                            <button
                                                style={s.dBtn}
                                                onClick={async () => {
                                                    await api.put(`/api/schedules/${sch.id}/snooze`);
                                                    alert("Reminder snoozed");
                                                }}
                                            >
                                                ⏰ Snooze
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div style={s.card}>
                    <h3 style={s.cardTitle}>📊 Medication Adherence</h3>

                    <AdherenceChart
                        taken={analytics.taken}
                        missed={analytics.missed}
                    />
                </div>
                <div style={s.card}>
                    <h3 style={s.cardTitle}>📈 Adherence Trend</h3>
                    <AdherenceTrendChart data={trendData} />
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;

const s = {
    page: { display: "flex", minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "220px", background: "#111827", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px", borderRight: "1px solid #1e293b" },
    logo: { fontSize: "18px", fontWeight: "bold", color: "#38bdf8", marginBottom: "20px" },
    navSection: { fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px", marginTop: "8px" },
    activeNav: { background: "linear-gradient(135deg,#1e40af,#1d4ed8)", border: "none", color: "white", padding: "10px 14px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontWeight: "600" },
    nav: { background: "none", border: "none", color: "#94a3b8", padding: "10px 14px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontSize: "14px" },
    main: { flex: 1, padding: "32px", position: "relative" },
    topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
    title: { fontSize: "26px", fontWeight: "700", margin: 0 },
    topActions: { display: "flex", alignItems: "center", gap: "12px" },
    ctaBtn: { background: "linear-gradient(135deg,#06b6d4,#3b82f6)", border: "none", color: "white", padding: "10px 18px", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "14px" },
    bellWrapper: { position: "relative", cursor: "pointer", fontSize: "24px", padding: "4px" },
    badge: { position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "white", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "10px" },
    notifPanel: {
        position: "absolute",
        top: "80px",
        right: "32px",
        width: "450px",   // bigger
        maxHeight: "500px",
        overflowY: "auto",
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: "12px",
        zIndex: 999,
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)"
    },
    notifHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #1e293b" },
    markBtn: { background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "12px" },
    notifEmpty: { padding: "20px", color: "#64748b", textAlign: "center" },
    notifItem: { padding: "12px 16px", borderBottom: "1px solid #1e293b" },
    notifMsg: { color: "#e2e8f0", fontSize: "13px" },
    notifTime: { color: "#475569", fontSize: "11px", marginTop: "4px" },
    statsRow: { display: "flex", gap: "16px", marginBottom: "28px" },
    stat: { background: "#111827", padding: "20px 24px", borderRadius: "12px", flex: 1, display: "flex", flexDirection: "column", gap: "4px", border: "1px solid #1e293b" },
    statNum: { fontSize: "32px", fontWeight: "800", color: "white" },
    statLabel: { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
    card: { background: "#111827", borderRadius: "12px", padding: "24px", border: "1px solid #1e293b" },
    cardTitle: { color: "#38bdf8", marginBottom: "20px", marginTop: 0 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
    rxCard: { background: "#0f172a", borderRadius: "12px", padding: "20px", border: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "12px" },
    rxTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    rxMed: { fontSize: "17px", fontWeight: "700", color: "white" },
    rxDosage: { fontSize: "13px", color: "#94a3b8", marginTop: "2px" },
    validBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" },
    rxDetails: { display: "flex", flexDirection: "column", gap: "6px" },
    rxRow: { color: "#94a3b8", fontSize: "13px" },
    notesBtn: { background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "12px", padding: "0" },
    notesBox: { background: "#1e293b", padding: "10px", borderRadius: "8px", color: "#94a3b8", fontSize: "13px", marginTop: "6px" },
    pdfBtn: { background: "linear-gradient(135deg,#1e40af,#1d4ed8)", border: "none", color: "white", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px", marginTop: "4px" },
    empty: { color: "#64748b", textAlign: "center", padding: "40px" },
    tableCard: { background: "#111827", borderRadius: "12px", padding: "20px", border: "1px solid #1e293b" },

    vBtn: {
        background: "#22c55e",
        border: "none",
        padding: "6px 10px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
        color: "white",
        marginRight: "8px"
    },

    dBtn: {
        background: "#2563eb",
        border: "none",
        padding: "6px 10px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
        color: "white"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px"
    },

    viewBtn: {
        background: "#22c55e",
        border: "none",
        padding: "6px 10px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600"
    },

    downloadBtn: {
        background: "#2563eb",
        border: "none",
        padding: "6px 10px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
        color: "white"
    }, tableHead: {
        background: "#020617",
    },

    tableTh: {
        padding: "10px",
        borderBottom: "1px solid #1e293b",
        textAlign: "left",
        color: "#38bdf8"
    },


    tableTd: {
        padding: "10px",
        borderBottom: "1px solid #1e293b",
        color: "#e2e8f0"
    },
    blink: {
        animation: "blinkBell 1s infinite",
        color: "#ef4444"
    }
};
