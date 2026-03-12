import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate, useParams } from "react-router-dom";

const s = {
    page: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        fontFamily: "'Inter', sans-serif",
        color: "white",
        padding: "20px"
    },
    card: {
        backgroundColor: "#111827",
        padding: "40px 30px",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)",
        width: "100%",
        maxWidth: "500px"
    },
    heading: { marginBottom: "24px", color: "#38bdf8", fontSize: "24px", textAlign: "center" },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    input: {
        padding: "12px 14px",
        borderRadius: "8px",
        border: "1px solid #64748b",
        backgroundColor: "#1e293b",
        color: "white",
        fontSize: "14px"
    },
    button: {
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
        color: "white",
        fontWeight: "700",
        fontSize: "14px",
        cursor: "pointer"
    },
    cancelButton: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #64748b",
        backgroundColor: "#1e293b",
        color: "white",
        fontWeight: "700",
        fontSize: "14px",
        cursor: "pointer",
        marginTop: "10px"
    }
};

const EditMedicine = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [medicine, setMedicine] = useState({
        name: "",
        batchNumber: "",
        expiryDate: "",
        stockQuantity: "",
        dosage: ""
    });

    useEffect(() => {
        api.get(`/api/medicines/${id}`).then(res => setMedicine(res.data));
    }, [id]);

    const handleChange = (e) => setMedicine({ ...medicine, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            await api.put(`/api/medicines/${id}`, medicine);
            alert("Medicine updated successfully!");
            navigate("/pharmacist");
        } catch (err) {
            alert("Failed to update medicine.");
            console.error(err);
        }
    };

    return (
        <div style={s.page}>
            <div style={s.card}>
                <h2 style={s.heading}>Edit Medicine</h2>
                <form style={s.form}>
                    <input
                        style={s.input}
                        type="text"
                        name="name"
                        value={medicine.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={s.input}
                        type="text"
                        name="dosage"
                        placeholder="Dosage (e.g., 500mg)"
                        value={medicine.dosage || ""}
                        onChange={handleChange}
                    />
                    <input
                        style={s.input}
                        type="text"
                        name="batchNumber"
                        value={medicine.batchNumber}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={s.input}
                        type="date"
                        name="expiryDate"
                        value={medicine.expiryDate}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={s.input}
                        type="number"
                        name="stockQuantity"
                        value={medicine.stockQuantity}
                        onChange={handleChange}
                        min={0}
                        required
                    />
                    <button
                        style={s.button}
                        type="button"
                        onClick={handleSubmit}
                    >
                        Update Medicine
                    </button>
                </form>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                        style={s.cancelButton}
                        onClick={() => navigate("/pharmacist")}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditMedicine;