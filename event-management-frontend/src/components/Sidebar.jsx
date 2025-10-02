import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRoleFromToken } from '../utils/jwt';
import './Sidebar.css';

const Sidebar = () => {
  const { token } = useContext(AuthContext);
  const role = getRoleFromToken(token);
  const location = useLocation();

  // Function to check if the current path matches
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Menu</h2>

      <nav className="sidebar-links">
        {role === 'admin' && (
          <>
            <Link to="/admin" className={`sidebar-link ${isActive("/admin")}`}>📊 Dashboard</Link>
            <Link to="/admin/events" className={`sidebar-link ${isActive("/admin/events")}`}>📅 Manage Events</Link>
          </>
        )}
        {role === 'coordinator' && (
          <Link to="/coordinator" className={`sidebar-link ${isActive("/coordinator")}`}>📌 Coordinator</Link>
        )}
        {role === 'attender' && (
          <Link to="/attender" className={`sidebar-link ${isActive("/attender")}`}>🎟 My Dashboard</Link>
        )}

        <Link to="/events" className={`sidebar-link ${isActive("/events")}`}>🎉 Events</Link>
        <Link to="/feedback" className={`sidebar-link ${isActive("/feedback")}`}>💬 Feedback</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
