import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { getRoleFromToken } from '../../utils/jwt';
import Loader from '../../components/Loader';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import './Login.css'; // Import CSS file

const Login = () => {
  const { login } = useContext(AuthContext);
  const { notify } = useContext(ToastContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.token) {
        notify('Welcome back!', 'success');
        const role = getRoleFromToken(res.token);
        if (role === 'admin') navigate('/admin');
        else if (role === 'coordinator') navigate('/coordinator');
        else if (role === 'attender') navigate('/attender');
        else navigate('/');
      } else {
        setError(res.message || 'Login failed');
        notify(res.message || 'Login failed', 'error');
      }
    } catch (err) {
      setError('Login failed');
      notify('Login failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Heading */}
        <div className="login-header">
          <h2>Welcome Back 👋</h2>
          <p>Login to your account</p>
        </div>


        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? <Loader /> : "Login"}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="mt-4 flex flex-col items-center">
          <GoogleLoginButton
            onSuccess={async (tokenId) => {
              try {
                const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
                const res = await fetch(`${API_BASE}/google/login`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tokenId }),
                });
                const data = await res.json();
                if (data.token) {
                  notify('Google login successful!', 'success');
                  const role = data.role;
                  if (role === 'admin') navigate('/admin');
                  else if (role === 'coordinator') navigate('/coordinator');
                  else if (role === 'attender') navigate('/attender');
                  else navigate('/');
                } else {
                  setError(data.message || 'Google login failed');
                  notify(data.message || 'Google login failed', 'error');
                }
              } catch {
                setError('Google login failed');
                notify('Google login failed', 'error');
              }
            }}
            onFailure={(msg) => {
              setError(msg);
              notify(msg, 'error');
            }}
          />
        </div>

        {/* Footer */}
        <div className="login-footer">
          <span>Don’t have an account? </span>
          <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
