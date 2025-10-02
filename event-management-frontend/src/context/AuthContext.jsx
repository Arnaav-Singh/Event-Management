import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/authApi';
import { decodeToken } from '../utils/jwt';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(() => localStorage.getItem('token'));
	const [user, setUser] = useState(() => {
		const storedToken = localStorage.getItem('token');
		return storedToken ? decodeToken(storedToken) : null;
	});

	useEffect(() => {
		if (token) {
			localStorage.setItem('token', token);
			setUser(decodeToken(token));
		} else {
			localStorage.removeItem('token');
			setUser(null);
		}
	}, [token]);

	const login = async (email, password) => {
		const data = await apiLogin(email, password);
		if (data.token) {
			setToken(data.token);
		}
		return data;
	};

	const register = async (userData) => {
		const data = await apiRegister(userData);
		return data;
	};

	const logout = () => {
		setToken(null);
	};

	return (
		<AuthContext.Provider value={{ user, token, login, logout, register }}>
			{children}
		</AuthContext.Provider>
	);
};
