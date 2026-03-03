import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Register = () => {
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "PATIENT",
    });

    const navigate = useNavigate();

    // Clear data when page opens
    useEffect(() => {
        setUser({ name: "", email: "", password: "", role: "PATIENT" });

        // Optional: clear autofill
        document.querySelectorAll("input").forEach((input) => (input.value = ""));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/auth/register", user);
            alert("Registered Successfully");
            navigate("/");
        } catch {
            alert("Registration failed");
        }
    };

    return (
        <div className="premium-bg">
            <div className="glass-card">
                <h2>Create Account</h2>

                {/* ❌ Remove key={Date.now()} */}
                <form onSubmit={handleSubmit} autoComplete="off">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={user.name}
                        onChange={handleChange}
                        autoComplete="new-name"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={user.email}
                        onChange={handleChange}
                        autoComplete="new-email"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={user.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />

                    <select
                        name="role"
                        className="role-dropdown"
                        value={user.role}
                        onChange={handleChange}
                    >
                        <option value="PATIENT">Patient</option>
                        <option value="DOCTOR">Doctor</option>
                        <option value="PHARMACIST">Pharmacist</option>
                        <option value="ADMIN">Admin</option>
                    </select>

                    <button className="premium-btn">Register</button>
                </form>

                <p>
                    Already have account? <Link to="/">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
