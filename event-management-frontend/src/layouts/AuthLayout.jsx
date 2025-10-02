import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => (
	<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
		<div className="w-full max-w-3xl">
			<Outlet />
		</div>
	</div>
);

export default AuthLayout;
