import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
const API_URL = `${API_BASE}/auth`;

export const login = async (email, password) => {
	const res = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
	return res.data;
};

export const register = async (userData) => {
	const res = await axios.post(`${API_URL}/register`, userData, { withCredentials: true });
	return res.data;
};
