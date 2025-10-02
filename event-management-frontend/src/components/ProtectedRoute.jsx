import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRoleFromToken } from '../utils/jwt';

const ProtectedRoute = ({ allowedRoles }) => {
		const { token } = useContext(AuthContext);
		const role = getRoleFromToken(token);
		console.log('ProtectedRoute token:', token);
		console.log('ProtectedRoute role:', role);

		if (!token) {
			console.log('ProtectedRoute: No token, redirecting to /login');
			return <Navigate to="/login" replace />;
		}

		if (allowedRoles && !allowedRoles.includes(role)) {
			console.log('ProtectedRoute: Role not allowed, redirecting to /');
			return <Navigate to="/" replace />;
		}

		console.log('ProtectedRoute: Access granted, rendering Outlet');
		return <Outlet />;
};

export default ProtectedRoute;
