import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) return <Navigate to="/" />;

    // If a specific role is required (like for /admin) and user doesn't have it
    if (role && userRole !== role) return <Navigate to="/" />;

    return children;
};

export default PrivateRoute;