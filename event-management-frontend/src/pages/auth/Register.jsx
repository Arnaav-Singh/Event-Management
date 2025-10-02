import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import './Register.css'; // Import CSS

const Register = () => {
  const { register } = useContext(AuthContext);
  const { notify } = useContext(ToastContext);
  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'attender' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await register(form);
      if (res && res.token) {
        setSuccess('Registration successful!');
        notify('Registration successful!', 'success');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(res?.message || 'Registration failed');
        notify(res?.message || 'Registration failed', 'error');
      }
    } catch (err) {
      setError('Registration failed');
      notify('Registration failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Heading */}
        <h2 className="register-title">Create Account ✨</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="register-form">
          <input 
            name="name" 
            type="text" 
            placeholder="Name" 
            value={form.name} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
          <select 
            name="role" 
            value={form.role} 
            onChange={handleChange}
          >
            <option value="attender">Attender</option>
            <option value="coordinator">Coordinator</option>
          </select>
          
          <button type="submit" disabled={loading}>
            {loading ? <Loader /> : "Register"}
          </button>

          {/* Feedback */}
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>

        {/* Footer */}
        <div className="register-footer">
          <span>Already have an account? </span>
          <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
