import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
const API_URL = `${API_BASE}/events`;


export const getEvents = async (token) => {
	const headers = token ? { Authorization: `Bearer ${token}` } : {};
	const res = await axios.get(API_URL, { headers, withCredentials: true });
	return res.data;
};


export const getEvent = async (id, token) => {
	const headers = token ? { Authorization: `Bearer ${token}` } : {};
	const res = await axios.get(`${API_URL}/${id}`, { headers, withCredentials: true });
	return res.data;
};

export const createEvent = async (eventData, token) => {
	const res = await axios.post(API_URL, eventData, {
		headers: { Authorization: `Bearer ${token}` },
		withCredentials: true,
	});
	return res.data;
};

export const updateEvent = async (id, eventData, token) => {
	const res = await axios.put(`${API_URL}/${id}`, eventData, {
		headers: { Authorization: `Bearer ${token}` },
		withCredentials: true,
	});
	return res.data;
};

export const deleteEvent = async (id, token) => {
	const res = await axios.delete(`${API_URL}/${id}`, {
		headers: { Authorization: `Bearer ${token}` },
		withCredentials: true,
	});
	return res.data;
};
