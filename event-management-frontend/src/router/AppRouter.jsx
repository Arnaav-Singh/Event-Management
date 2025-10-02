import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import CoordinatorLayout from '../layouts/CoordinatorLayout';
import AttenderLayout from '../layouts/AttenderLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import AdminDashboard from '../pages/admin/Dashboard';
import ManageEvents from '../pages/admin/ManageEvents';
import CoordinatorDashboard from '../pages/coordinator/Dashboard';
import AttenderDashboard from '../pages/attender/Dashboard';
import EventList from '../pages/events/EventList';
import EventDetails from '../pages/events/EventDetails';
import FeedbackForm from '../pages/feedback/FeedbackForm';

const AppRouter = () => (
	<AuthProvider>
		<ToastProvider>
			<Router>
				<Routes>
				<Route element={<AuthLayout />}>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Route>

				<Route element={<AdminLayout />}>
					<Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
						<Route path="/admin" element={<AdminDashboard />} />
						<Route path="/admin/events" element={<ManageEvents />} />
					</Route>
				</Route>

				<Route element={<CoordinatorLayout />}>
					<Route element={<ProtectedRoute allowedRoles={["coordinator"]} />}>
						<Route path="/coordinator" element={<CoordinatorDashboard />} />
					</Route>
				</Route>

				<Route element={<AttenderLayout />}>
					<Route element={<ProtectedRoute allowedRoles={["attender"]} />}>
						<Route path="/attender" element={<AttenderDashboard />} />
					</Route>
				</Route>

				<Route path="/events" element={<EventList />} />
				<Route path="/events/:id" element={<EventDetails />} />
				<Route path="/feedback" element={<FeedbackForm />} />
				<Route path="/" element={<Navigate to="/login" replace />} />
				</Routes>
			</Router>
		</ToastProvider>
	</AuthProvider>
);

export default AppRouter;
