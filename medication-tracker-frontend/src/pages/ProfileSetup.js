import React, { useState, useEffect } from "react";
import jwtDecode from "jwt-decode";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const ProfileSetup = () => {
    const [role, setRole] = useState("");
    const [profileData, setProfileData] = useState({});
    const navigate = useNavigate();

    // 🔥 Check role & profile status on page load
    useEffect(() => {
        const token = localStorage.getItem("token");
        const completed = localStorage.getItem("profileCompleted");

        if (!token) {
            navigate("/login");
            return;
        }

        const decoded = jwtDecode(token);
        setRole(decoded.role);

        // ✅ If profile already completed → redirect dashboard
        if (completed === "true") {
            navigate(`/${decoded.role.toLowerCase()}`);
        }
    }, [navigate]);

    // Handle input change
    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    // Save profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = localStorage.getItem("userId");

            await api.post(`/api/profile/${role.toLowerCase()}/${userId}`, profileData);

            alert("✅ Profile updated successfully!");

            // Mark profile completed
            localStorage.setItem("profileCompleted", "true");

            // Redirect to dashboard
            navigate(`/${role.toLowerCase()}`);
        } catch (err) {
            console.error(err);
            alert("❌ Error saving profile details");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.heading}>🧑‍⚕️ Complete Your {role} Profile</h2>

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* COMMON FIELDS */}
                    <input name="fullName" placeholder="Full Name" required onChange={handleChange} style={styles.input} />
                    <input name="phone" placeholder="Phone Number" required onChange={handleChange} style={styles.input} />
                    <input name="address" placeholder="Address" required onChange={handleChange} style={styles.input} />

                    {/* DOCTOR FIELDS */}
                    {role === "DOCTOR" && (
                        <>
                            <input name="licenseNumber" placeholder="Medical License Number" required onChange={handleChange} style={styles.input} />
                            <input name="specialization" placeholder="Specialization (Cardiology, Neurology...)" onChange={handleChange} style={styles.input} />
                            <input name="experience" placeholder="Years of Experience" onChange={handleChange} style={styles.input} />
                            <input name="hospitalName" placeholder="Hospital / Clinic Name" onChange={handleChange} style={styles.input} />
                        </>
                    )}

                    {/* PHARMACIST FIELDS */}
                    {role === "PHARMACIST" && (
                        <>
                            <input name="shopName" placeholder="Pharmacy Shop Name" required onChange={handleChange} style={styles.input} />
                            <input name="shopAddress" placeholder="Shop Address" required onChange={handleChange} style={styles.input} />
                            <input name="licenseNumber" placeholder="Pharmacy License Number" onChange={handleChange} style={styles.input} />
                            <input name="openingHours" placeholder="Opening Hours (9AM - 9PM)" onChange={handleChange} style={styles.input} />
                        </>
                    )}

                    {/* PATIENT FIELDS */}
                    {role === "PATIENT" && (
                        <>
                            <input
                                name="dob"
                                type="date"
                                placeholder="Date of Birth"
                                required
                                onChange={handleChange}
                                style={styles.input}
                            />
                            <input name="emergencyContact" placeholder="Emergency Contact Number" required onChange={handleChange} style={styles.input} />
                            <textarea name="medicalHistory" placeholder="Medical History (Diabetes, BP, Surgeries...)" onChange={handleChange} style={styles.textarea}></textarea>
                            <input name="bloodGroup" placeholder="Blood Group (A+, O-)" onChange={handleChange} style={styles.input} />
                            <input name="allergies" placeholder="Allergies (if any)" onChange={handleChange} style={styles.input} />
                        </>
                    )}

                    {/* ADMIN FIELDS */}
                    {role === "ADMIN" && (
                        <>
                            <input name="department" placeholder="Department (e.g., IT, Operations)" required onChange={handleChange} style={styles.input} />
                            <input name="employeeId" placeholder="Employee ID" required onChange={handleChange} style={styles.input} />
                        </>
                    )}

                    <button type="submit" style={styles.button}>Save Profile</button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;

/* ================= STYLES ================= */
const styles = {
    container: {
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
    },
    card: {
        background: "#111827",
        padding: "30px",
        borderRadius: "16px",
        width: "420px",
        boxShadow: "0 0 25px rgba(0,255,255,0.2)",
        color: "white"
    },
    heading: {
        textAlign: "center",
        marginBottom: "20px",
        color: "#38bdf8"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    input: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #374151",
        background: "#020617",
        color: "white",
        outline: "none"
    },
    textarea: {
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #374151",
        background: "#020617",
        color: "white",
        minHeight: "80px",
        outline: "none"
    },
    button: {
        background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
        padding: "12px",
        borderRadius: "10px",
        border: "none",
        fontWeight: "bold",
        color: "white",
        cursor: "pointer",
        marginTop: "10px"
    }
};
