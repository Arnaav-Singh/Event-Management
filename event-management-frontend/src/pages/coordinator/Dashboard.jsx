import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import axios from 'axios';
import './CoordinatorDashboard.css'; // Import for styles
// ...existing code...

const statCards = [
  { key: 'assignedEvents', label: 'Assigned Events', icon: '📅', color: 'blue' },
  { key: 'totalAttendees', label: 'Total Attendees', icon: '👥', color: 'green' },
  { key: 'avgRating', label: 'Avg Rating', icon: '⭐', color: 'yellow' }
];

const CoordinatorDashboard = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ assignedEvents: 0, totalAttendees: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', date: '', location: '' });
  const [creating, setCreating] = useState(false);

// Removed stray import statement

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5050/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data || []);
      setStats({
        assignedEvents: res.data?.length || 0,
        totalAttendees: res.data?.reduce((sum, ev) => sum + (ev.attendees || 0), 0),
        avgRating: !res.data?.length ? 0 :
          (res.data.reduce((sum, ev) => sum + (ev.rating || 0), 0) / res.data.length).toFixed(1)
      });
    } catch (err) {
      setError('Failed to fetch events');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createEvent(form, token);
      setForm({ title: '', description: '', date: '', location: '' });
      fetchEvents();
    } catch {
      setError('Failed to create event');
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteEvent(id, token);
      fetchEvents();
    } catch {
      setError('Failed to delete event');
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="coordinator-dashboard-root">
      <h1 className="coordinator-dashboard-title">Coordinator Dashboard</h1>
      <div className="coordinator-dashboard-stats">
        {statCards.map(card => (
          <div key={card.key} className={`stat-card ${card.color}`}>
            <span className="stat-icon">{card.icon}</span>
            <span className="stat-label">{card.label}</span>
            <span className="stat-value">{stats[card.key]}</span>
          </div>
        ))}
      </div>

      <h2 className="coordinator-dashboard-subtitle">Add New Event</h2>
      <form onSubmit={handleCreate} className="event-form mb-8">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
        <input name="date" value={form.date} onChange={handleChange} placeholder="Date" type="datetime-local" required />
        <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
        <button type="submit" disabled={creating}>Add Event</button>
      </form>

      <h2 className="coordinator-dashboard-subtitle">Assigned Events</h2>
      <div className="coordinator-events-list">
        {events.map(ev => (
          <div key={ev._id} className="event-card">
            <div className="event-header">
              <span className="event-title">{ev.title}</span>
              <span className="event-date">{ev.date}</span>
            </div>
            <p className="event-desc">{ev.description}</p>
            <span className="event-location">{ev.location}</span>
            <button onClick={() => handleDelete(ev._id)} className="delete-btn">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
