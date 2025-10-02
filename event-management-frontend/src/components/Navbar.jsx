import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getRoleFromToken } from '../utils/jwt';
import './Navbar.css'; // import navbar styles

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const role = getRoleFromToken(token);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">Event Manager</Link>

        {/* Hamburger (only visible on mobile) */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        {/* Links */}
        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {role === 'admin' && (
            <>
              <Link to="/admin">Admin</Link>
              <Link to="/admin/events">Manage</Link>
            </>
          )}
          {role === 'coordinator' && <Link to="/coordinator">Coordinator</Link>}
          {role === 'attender' && <Link to="/attender">My Events</Link>}
          
          <Link to="/events">Events</Link>
          <Link to="/feedback">Feedback</Link>

          {token ? (
            <button onClick={logout} className="logout-btn">Logout</button>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
