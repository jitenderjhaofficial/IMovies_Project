import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      // Store JWT token and user info
      localStorage.setItem('imovies_token', data.token);
      localStorage.setItem('imovies_user', JSON.stringify(data.user));

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      if (data.user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      // Local fallback simulation if backend server is unreachable
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        const fallbackUser = {
          id: 'mock-user-123',
          name: email.split('@')[0] || 'VIP Member',
          email,
          isAdmin: email.toLowerCase().includes('admin')
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        localStorage.setItem('imovies_token', mockToken);
        localStorage.setItem('imovies_user', JSON.stringify(fallbackUser));

        if (onLoginSuccess) onLoginSuccess(fallbackUser);
        navigate(fallbackUser.isAdmin ? '/admin' : '/profile');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (asAdmin = false) => {
    const demoUser = asAdmin
      ? {
          id: 'admin-001',
          name: 'Cinema Admin',
          email: 'admin@imovies.com',
          isAdmin: true
        }
      : {
          id: 'user-001',
          name: 'Alex Johnson',
          email: 'alex@imovies.com',
          isAdmin: false
        };

    const mockToken = 'mock-jwt-token-' + Date.now();
    localStorage.setItem('imovies_token', mockToken);
    localStorage.setItem('imovies_user', JSON.stringify(demoUser));

    if (onLoginSuccess) onLoginSuccess(demoUser);
    navigate(asAdmin ? '/admin' : '/profile');
  };

  return (
    <div className="auth-page main-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">🍿 Welcome Back</div>
          <h1 className="auth-title">Sign In to IMovies</h1>
          <p className="auth-subtitle">
            Access your reserved tickets, VIP perks, and member rewards.
          </p>
        </div>

        {error && <div className="auth-alert-error">⚠️ {error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In →'}
          </button>
        </form>

        {/* Quick Demo Access Helpers */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
            ⚡ Instant Demo Login:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '8px', justifyContent: 'center' }}
              onClick={() => handleQuickDemoLogin(false)}
            >
              Demo User
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '8px', justifyContent: 'center', borderColor: 'var(--accent-gold)' }}
              onClick={() => handleQuickDemoLogin(true)}
            >
              👑 Demo Admin
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an IMovies account?
          <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}
