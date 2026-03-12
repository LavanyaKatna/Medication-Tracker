import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    // ✅ Clear input fields when Login page opens
    useEffect(() => {
        setCredentials({ email: "", password: "" });
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/auth/login", credentials);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            localStorage.setItem("userId", res.data.userId);
            localStorage.setItem("profileCompleted", res.data.profileCompleted);

            if (res.data.profileCompleted) {
                navigate(`/${res.data.role.toLowerCase()}`);
            } else {
                navigate("/profile-setup");
            }
        } catch {
            alert("❌ Login Failed");
        }
    };

    return (
        <div className="premium-bg">
            <div className="glass-card">
                <h1>🩺 Online Medication & Prescription Tracker</h1>
                <p>Smart Healthcare Management System</p>

                {/* autoComplete off to stop browser autofill */}
                <form onSubmit={handleLogin} autoComplete="off">

                    {/* Email Input */}
                    <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={credentials.email}   // ✅ Controlled input
                        onChange={(e) =>
                            setCredentials({ ...credentials, email: e.target.value })
                        }
                        autoComplete="new-email"
                    />

                    {/* Password Input */}
                    <div className="password-box">
                        <input
                            type={showPass ? "text" : "password"}
                            placeholder="🔒 Password"
                            required
                            value={credentials.password}   // ✅ Controlled input
                            onChange={(e) =>
                                setCredentials({ ...credentials, password: e.target.value })
                            }
                            autoComplete="new-password"
                        />

                        {/* Eye Icon */}
                        <span onClick={() => setShowPass(!showPass)}>
                            {showPass ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <button className="premium-btn">Login</button>
                </form>

                <p className="register-link">
                    New User? <Link to="/register">Create Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
