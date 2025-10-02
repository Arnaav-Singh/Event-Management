import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import axios from 'axios';
import './AdminDashboard.css'; // <-- you will create this
import {createEvent, deleteEvent, getEvents, updateEvent} from "../../api/eventApi";
const iconMap = {
  events: "📅",
  users: "👤",
  attendees: "👥",
  feedbacks: "💬",
  // add icons for each stat relevant to your app
};

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
        const res = await axios.get(`${API_BASE}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setStats(res.data);
      } catch (err) {
        setError('Failed to fetch stats');
      }
      setLoading(false);
    };
    fetchStats();
  }, [token]);

  if (loading) return <Loader />;
  if (error) return <div className="admin-error">{error}</div>;
  if (!stats) return null;

  return (
    <div className="admin-dashboard-root">
      <h1 className="admin-dashboard-title">Admin Dashboard</h1>
      <p className="admin-dashboard-subtitle">Quick insights into your platform</p>
      <div className="admin-dashboard-stats">
        {Object.entries(stats).map(([key, value]) => (
          <div className="admin-dashboard-stat-card" key={key}>
            <div className="admin-stat-icon">{iconMap[key] || "📊"}</div>
            <div className="admin-stat-info">
              <span className="admin-stat-count">{value}</span>
              <span className="admin-stat-label">{key[0].toUpperCase() + key.slice(1)}</span>
            </div>
          </div>
        ))}
      </div>
      {/* You can add more breakdowns or tables here */}
    </div>
  );
};

export default AdminDashboard;
