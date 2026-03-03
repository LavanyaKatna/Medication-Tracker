import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import ProfileSetup from "./pages/ProfileSetup";
import WritePrescription from "./pages/WritePrescription";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/admin" element={<PrivateRoute role="ADMIN"><AdminDashboard /></PrivateRoute>} />
                <Route path="/patient" element={<PrivateRoute role="PATIENT"><PatientDashboard /></PrivateRoute>} />
                <Route path="/doctor" element={<PrivateRoute role="DOCTOR"><DoctorDashboard /></PrivateRoute>} />
                <Route path="/doctor/write-prescription" element={<PrivateRoute role="DOCTOR"><WritePrescription /></PrivateRoute>} />
                <Route path="/pharmacist" element={<PrivateRoute role="PHARMACIST"><PharmacistDashboard /></PrivateRoute>} />
                <Route path="*" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;