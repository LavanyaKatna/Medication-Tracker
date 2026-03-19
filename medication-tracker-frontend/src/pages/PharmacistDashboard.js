import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const PharmacistDashboard = () => {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drugDetails, setDrugDetails] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    // Fetch medicines from backend
    const fetchSales = async () => {
        try {
            const res = await api.get("/api/analytics/sales-stock");

            console.log("API RESPONSE:", res.data);

            let formatted = [];

            if (Array.isArray(res.data)) {
                formatted = res.data.map(item => ({
                    name: item[0],           // medicine name
                    sales: item[1] || 0,     // count(p)
                    stock: item[2] || 0      // max(stock)
                }));
            }

            setSalesData(formatted);

        } catch (err) {
            console.error(err);
            setSalesData([]);
        }
    };
    const fetchTopSelling = async () => {
        try {
            const res = await api.get("/api/analytics/top-medicines");
            let formatted = [];
            if (Array.isArray(res.data)) {
                formatted = res.data.map(item => ({
                    name: item[0],
                    sales: item[1]
                }));
            }
            setTopSelling(formatted);
        } catch (err) {
            console.error(err);
            setTopSelling([]);
        }
    };

    useEffect(() => {
        fetchMedicines();
        fetchSales();
        fetchTopSelling();
    }, []);

    const fetchMedicines = () => {
        api.get("/api/medicines")
            .then(res => {
                setMedicines(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // Delete medicine
    const deleteMedicine = async (id) => {
        if (!window.confirm("Delete this medicine?")) return;
        await api.delete(`/api/medicines/${id}`);
        fetchMedicines();
    };

    // Check expired or low stock
    const isExpired = (expiryDate) => new Date(expiryDate) < new Date().setHours(0, 0, 0, 0);
    const lowStock = (qty) => qty < 10;

    const formatSafeDate = (d) => {
        if (!d) return "—";
        if (Array.isArray(d)) return d.join("-");
        return d;
    };

    const getDaysLeft = (expiryDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(formatSafeDate(expiryDate));
        if (isNaN(expiry.getTime())) return "N/A";
        expiry.setHours(0, 0, 0, 0);
        const diff = expiry - today;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Medicine Name,Batch,Expiry Date,Stock,Days Left\n";

        medicines.forEach(m => {
            const daysLeft = getDaysLeft(m.expiryDate);
            const expD = formatSafeDate(m.expiryDate);
            csvContent += `"${m.name}","${m.batchNumber}","${expD}","${m.stockQuantity}","${daysLeft}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "pharmacy_inventory_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Fetch external drug info + stock info
    const viewDrugDetails = async (medicine) => {
        try {
            const res = await api.get(`/api/drug-info/${medicine.name}`);
            const apiInfo = res.data || {};

            setDrugDetails({
                name: medicine.name,
                batchNumber: medicine.batchNumber,
                expiryDate: medicine.expiryDate,
                stockQuantity: medicine.stockQuantity,
                dosage: medicine.dosage,

                brandName: apiInfo.brandName || "Not available",
                activeIngredient: apiInfo.activeIngredient || "Not available",
                purpose: apiInfo.purpose || "Not available",
                warnings: apiInfo.warnings || "Not available",
                dosageInfo: apiInfo.dosage || "Not available"
            });

        } catch (err) {
            console.error("Drug info error:", err);

            // still open modal with inventory info
            setDrugDetails({
                name: medicine.name,
                batchNumber: medicine.batchNumber,
                expiryDate: medicine.expiryDate,
                stockQuantity: medicine.stockQuantity,
                dosage: medicine.dosage,
                activeIngredient: "Drug info unavailable",
                purpose: "Drug info unavailable",
                warnings: "Drug info unavailable",
                dosageInfo: "Drug info unavailable"
            });
        }
    };

    return (
        <div style={s.page}>
            {/* Sidebar */}
            <div style={s.sidebar}>
                <div style={s.logo}>💊 MedTracker</div>
                <div style={s.navSection}>Pharmacist Panel</div>
                <button style={s.activeNav}>📦 Inventory</button>
                <button style={s.nav} onClick={() => navigate("/pharmacist/add-medicine")}>
                    ➕ Add Medicine
                </button>
                <button style={s.nav} onClick={() => { localStorage.clear(); navigate("/"); }}>
                    🚪 Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={s.main}>
                {/* Alerts */}
                {medicines.filter(m => lowStock(m.stockQuantity)).length > 0 && (
                    <div style={s.alertBanner}>
                        ⚠ Low Stock Alert:{" "}
                        {medicines
                            .filter(m => lowStock(m.stockQuantity))
                            .map(m => m.name)
                            .join(", ")}{" "}
                        are running low.
                    </div>
                )}
                {medicines.filter(m => isExpired(m.expiryDate)).length > 0 && (
                    <div style={s.expiredBanner}>
                        🚨 Expired medicines:{" "}
                        {medicines
                            .filter(m => isExpired(m.expiryDate))
                            .map(m => m.name)
                            .join(", ")}{" "}
                        . Please dispose or replace.
                    </div>
                )}

                {/* Top Bar */}
                <div style={s.topBar}>
                    <h1 style={s.title}>Pharmacist Dashboard</h1>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button style={{...s.ctaBtn, background: "linear-gradient(135deg,#10b981,#047857)"}} onClick={downloadCSV}>
                            ⬇ Download Report (CSV)
                        </button>
                        <button style={s.ctaBtn} onClick={() => navigate("/pharmacist/add-medicine")}>
                            ➕ Add Medicine
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={s.statsRow}>
                    <div style={s.stat}>
                        <span style={s.statNum}>{medicines.length}</span>
                        <span style={s.statLabel}>Total Medicines</span>
                    </div>
                    <div style={s.stat}>
                        <span style={{ ...s.statNum, color: "#facc15" }}>
                            {medicines.filter(m => lowStock(m.stockQuantity)).length}
                        </span>
                        <span style={s.statLabel}>Low Stock</span>
                    </div>
                    <div style={s.stat}>
                        <span style={{ ...s.statNum, color: "#f87171" }}>
                            {medicines.filter(m => isExpired(m.expiryDate)).length}
                        </span>
                        <span style={s.statLabel}>Expired</span>
                    </div>
                </div>

                {/* Inventory Table */}
                <div style={s.card}>
                    <h3 style={s.cardTitle}>Medicine Inventory</h3>
                    {loading ? (
                        <div style={s.loading}>Loading...</div>
                    ) : medicines.length === 0 ? (
                        <div style={s.empty}>No medicines in stock.</div>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>#</th>
                                    <th style={s.th}>Medicine</th>
                                    <th style={s.th}>Batch</th>
                                    <th style={s.th}>Expiry</th>
                                    <th style={s.th}>Days Left</th>
                                    <th style={s.th}>Stock</th>
                                    <th style={s.th}>Status</th>
                                    <th style={s.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {medicines.map((m, i) => (
                                    <tr key={m.id} style={s.tr}>
                                        <td style={s.td}>{i + 1}</td>
                                        <td style={s.td}>{m.name}</td>
                                        <td style={s.td}>{m.batchNumber}</td>
                                        <td style={s.td}>{formatSafeDate(m.expiryDate)}</td>
                                        <td style={s.td}>{getDaysLeft(m.expiryDate)}</td>
                                        <td style={s.td}>{m.stockQuantity}</td>
                                        <td style={s.td}>
                                            {isExpired(formatSafeDate(m.expiryDate)) ? (
                                                <>
                                                    <span style={s.expiredBadge}>Expired</span>
                                                    <div style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>
                                                        Recommend disposal/replacement
                                                    </div>
                                                </>
                                            ) : lowStock(m.stockQuantity) ? (
                                                <span style={s.lowStockBadge}>Low Stock</span>
                                            ) : (
                                                <span style={s.goodBadge}>Available</span>
                                            )}
                                        </td>
                                        <td style={s.td}>
                                            <button style={s.infoBtn} onClick={() => viewDrugDetails(m)}>👁️ View</button>
                                            <button style={s.editBtn} onClick={() => navigate(`/pharmacist/edit/${m.id}`)}>✏ Edit</button>
                                            <button style={s.deleteBtn} onClick={() => deleteMedicine(m.id)}>🗑 Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={{ display: "flex", gap: "24px", marginTop: "28px" }}>
                    {/* Top Selling Chart */}
                    <div style={{ ...s.card, flex: 1, marginTop: 0 }}>
                        <h3 style={s.cardTitle}>Top Selling Medicines</h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topSelling}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Sales vs Stock Chart */}
                    <div style={{ ...s.card, flex: 1, marginTop: 0 }}>
                        <h3 style={s.cardTitle}>Sales vs Stock</h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#3b82f6" />
                                <Bar dataKey="stock" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Drug Info Modal */}
            {/* Drug & Stock Details Modal */}
            {drugDetails && (
                <div style={s.modalOverlay}>
                    <div style={s.modalContent}>

                        <h3>Drug Safety Information</h3>

                        <div style={{ textAlign: "left", maxHeight: "400px", overflowY: "auto" }}>

                            <p><strong>Medicine:</strong> {drugDetails.name}</p>
                            <p><strong>Batch:</strong> {drugDetails.batchNumber}</p>
                            <p><strong>Expiry:</strong> {drugDetails.expiryDate}</p>
                            <p><strong>Stock:</strong> {drugDetails.stockQuantity}</p>
                            <p><strong>Dosage (Inventory):</strong> {drugDetails.dosage}</p>

                            <hr />

                            <p><strong>Active Ingredient:</strong></p>
                            <p>{drugDetails.activeIngredient}</p>

                            <p><strong>Purpose:</strong></p>
                            <p>{drugDetails.purpose}</p>

                            <p><strong>Warnings:</strong></p>
                            <p style={{ color: "#f87171" }}>{drugDetails.warnings}</p>

                            <p><strong>Recommended Dosage:</strong></p>
                            <p>{drugDetails.dosageInfo}</p>

                        </div>

                        <button style={s.cancelButton} onClick={() => setDrugDetails(null)}>
                            Close
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacistDashboard;

// Styles
const s = {
    page: { display: "flex", minHeight: "100vh", background: "#0f172a", color: "white", fontFamily: "'Inter', sans-serif" },
    sidebar: { width: "220px", background: "#111827", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px", borderRight: "1px solid #1e293b" },
    logo: { fontSize: "18px", fontWeight: "bold", color: "#38bdf8", marginBottom: "20px" },
    navSection: { fontSize: "11px", color: "#475569", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px", marginTop: "8px" },
    activeNav: { background: "linear-gradient(135deg,#1e40af,#1d4ed8)", border: "none", color: "white", padding: "10px 14px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontWeight: "600" },
    nav: { background: "none", border: "none", color: "#94a3b8", padding: "10px 14px", borderRadius: "8px", textAlign: "left", cursor: "pointer", fontSize: "14px" },
    main: { flex: 1, padding: "32px" },
    cancelButton: { padding: "12px", borderRadius: "8px", border: "1px solid #64748b", backgroundColor: "#1e293b", color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer", marginTop: "10px" },
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
    th: { padding: "10px 14px", textAlign: "left", fontSize: "12px", color: "#64748b", borderBottom: "1px solid #1e293b", textTransform: "uppercase" },
    tr: { borderBottom: "1px solid #1e293b" },
    td: { padding: "12px 14px", fontSize: "14px", color: "#e2e8f0" },
    loading: { color: "#64748b", textAlign: "center", padding: "40px" },
    empty: { color: "#64748b", textAlign: "center", padding: "40px" },
    alertBanner: { background: "linear-gradient(90deg,#422006,#fb923c)", padding: "12px 20px", borderRadius: "10px", marginBottom: "20px", fontWeight: "700" },
    expiredBanner: { background: "linear-gradient(90deg,#7f1d1d,#dc2626)", padding: "12px 20px", borderRadius: "10px", marginBottom: "15px", fontWeight: "700" },
    expiredBadge: { background: "#4c1d1d", color: "#f87171", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    lowStockBadge: { background: "#422006", color: "#fb923c", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    goodBadge: { background: "#064e3b", color: "#34d399", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    infoBtn: { padding: "6px 10px", borderRadius: "6px", border: "none", background: "#06b6d4", color: "white", cursor: "pointer", marginRight: "5px" },
    editBtn: { background: "#1e40af", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", marginRight: "5px", cursor: "pointer" },
    deleteBtn: { background: "#7f1d1d", color: "white", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" },
    modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center" },
    modalContent: { background: "#111827", padding: "24px", borderRadius: "12px", textAlign: "center", color: "white", maxWidth: "600px", width: "90%" }
};