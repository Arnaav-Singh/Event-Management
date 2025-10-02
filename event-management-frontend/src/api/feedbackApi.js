import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
const API_URL = `${API_BASE}/feedback`;

export const submitFeedback = async (feedbackData, token) => {
	const res = await axios.post(API_URL, feedbackData, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};
