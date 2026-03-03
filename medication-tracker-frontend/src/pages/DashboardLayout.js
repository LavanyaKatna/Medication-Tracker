import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardLayout = ({ role, children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token"); // or sessionStorage depending on your auth
        navigate("/login");
    };

    return (
        <div style={{ padding: "20px" }}>
            <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2>{role} Dashboard</h2>
                <button onClick={handleLogout} style={{ padding: "5px 10px", cursor: "pointer" }}>
                    Logout
                </button>
            </header>
            <main>{children}</main>
        </div>
    );
};

export default DashboardLayout;
