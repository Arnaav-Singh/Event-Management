import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

export const sendNotification = async (userId, message, token) => {
  const res = await axios.post(`${API_BASE}/notification`, { userId, message }, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

export const getNotifications = async (token) => {
  const res = await axios.get(`${API_BASE}/notification`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

export const markAsRead = async (id, token) => {
  const res = await axios.patch(`${API_BASE}/notification/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};
