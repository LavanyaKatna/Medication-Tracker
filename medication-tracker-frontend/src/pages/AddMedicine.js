import React, { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const s = {
    page: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#0f172a", fontFamily: "'Inter', sans-serif", color: "white", padding: "20px" },
    card: { backgroundColor: "#111827", padding: "40px 30px", borderRadius: "12px", boxShadow: "0 0 20px rgba(0,0,0,0.5)", width: "100%", maxWidth: "500px" },
    heading: { marginBottom: "24px", color: "#38bdf8", fontSize: "24px", textAlign: "center" },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    input: { padding: "12px 14px", borderRadius: "8px", border: "1px solid #64748b", backgroundColor: "#1e293b", color: "white", fontSize: "14px" },
    button: { padding: "12px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #06b6d4, #3b82f6)", color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer" },
    cancelButton: { padding: "12px", borderRadius: "8px", border: "1px solid #64748b", backgroundColor: "#1e293b", color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer", marginTop: "10px" }
};

const AddMedicine = () => {
    const navigate = useNavigate();

    const [medicine, setMedicine] = useState({
        name: "",
        batchNumber: "",
        expiryDate: "",
        stockQuantity: "",
        dosage: ""
    });
    const [drugPreview, setDrugPreview] = useState(null);

    const handleChange = (e) => setMedicine({ ...medicine, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            if (!medicine.name || !medicine.batchNumber || !medicine.expiryDate || !medicine.stockQuantity) {
                alert("Please fill all required fields.");
                return;
            }

            const payload = {
                name: medicine.name.trim(),
                batchNumber: medicine.batchNumber.trim(),
                expiryDate: medicine.expiryDate,
                stockQuantity: Number(medicine.stockQuantity),
                dosage: medicine.dosage ? medicine.dosage.trim() : "",
                threshold: 10,           // default value
                expired: false,          // default value
                lowStockThreshold: 5     // default value
            };

            console.log("Payload to send:", payload);

            await api.post("/api/medicines", payload);
            alert("Medicine added successfully!");
            navigate("/pharmacist");
        } catch (err) {
            console.error("Add medicine error:", err.response || err);
            alert("Failed to add medicine. Check console for details.");
        }
    };
    const checkDrug = async () => {

        if (!medicine.name) {
            alert("Enter medicine name first");
            return;
        }

        try {
            const res = await api.get(`/api/drug-info/${medicine.name}`);
            setDrugPreview(res.data);
        } catch (err) {
            alert("Drug info not found");
        }
    };

    return (
        <div style={s.page}>
            <div style={s.card}>
                <h2 style={s.heading}>Add New Medicine</h2>
                <form style={s.form} onSubmit={(e) => e.preventDefault()}>
                    <input style={s.input} type="text" name="name" placeholder="Medicine Name" value={medicine.name} onChange={handleChange} required />
                    <input style={s.input} type="text" name="dosage" placeholder="Dosage (e.g., 500mg)" value={medicine.dosage} onChange={handleChange} />
                    <input style={s.input} type="text" name="batchNumber" placeholder="Batch Number" value={medicine.batchNumber} onChange={handleChange} required />
                    <input style={s.input} type="date" name="expiryDate" value={medicine.expiryDate} onChange={handleChange} required />
                    <input style={s.input} type="number" name="stockQuantity" placeholder="Stock Quantity" value={medicine.stockQuantity} onChange={handleChange} min={0} required />
                    <button type="button" style={s.button} onClick={checkDrug}>
                        Check Drug Safety
                    </button>
                    <button style={s.button} type="button" onClick={handleSubmit}>Add Medicine</button>
                </form>
                {drugPreview && (
                    <div style={{ marginTop: "20px", background: "#1e293b", padding: "15px", borderRadius: "8px" }}>
                        <h4>Drug Safety Check</h4>

                        <p><b>Active Ingredient:</b> {drugPreview.activeIngredient}</p>
                        <p><b>Purpose:</b> {drugPreview.purpose}</p>
                        <p><b>Warnings:</b> {drugPreview.warnings}</p>
                        <p><b>Dosage:</b> {drugPreview.dosage}</p>

                    </div>
                )}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button style={s.cancelButton} onClick={() => navigate("/pharmacist")}>Back to Dashboard</button>
                </div>
            </div>
        </div>
    );
};

export default AddMedicine;