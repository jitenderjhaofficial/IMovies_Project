import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ user, onLogout, searchQuery, setSearchQuery }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('imovies_token');
      localStorage.removeItem('imovies_user');
      navigate('/login');
    }
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="cinema-navbar">
      <div className="main-container nav-content">
        {/* Brand Logo */}
        <Link
          to="/"
          className="brand-logo"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="brand-icon">🍿</div>
          <div className="brand-text">
            I<span>MOVIES</span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="nav-search">
          <span className="nav-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search blockbusters, genres, directors..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <span>🎬</span> Movies
          </Link>

          {user && (
            <Link
              to="/profile"
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            >
              <span>🎟️</span> My Bookings
            </Link>
          )}

          {user && user.isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
            >
              <span>⚡</span> Admin
              <span className="nav-badge-admin">Console</span>
            </Link>
          )}
        </nav>

        {/* Desktop Actions & Authentication */}
        <div className="nav-actions">
          <div className="location-chip">
            <span>📍</span>
            <strong>New York (IMAX)</strong>
          </div>

          {user ? (
            <div className="user-nav-dropdown">
              <Link to="/profile" className="user-badge" style={{ textDecoration: 'none' }}>
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user.name}</span>
                {user.isAdmin && <span className="nav-badge-admin">Admin</span>}
              </Link>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogoutClick}
                title="Sign out of IMovies"
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="btn-nav-login">
                Sign In
              </Link>
              <Link to="/register" className="btn-nav-register">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer main-container">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            🎬 Movies & Theaters
          </Link>

          {user && (
            <Link
              to="/profile"
              className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              🎟️ My Bookings & Tickets
            </Link>
          )}

          {user && user.isAdmin && (
            <Link
              to="/admin"
              className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ⚡ Admin Management Console
            </Link>
          )}

          <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {user ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{user.name}</span>
                </div>
                <button
                  type="button"
                  className="btn-logout"
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <Link
                  to="/login"
                  className="btn-nav-login"
                  style={{ flex: 1, textAlign: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-nav-register"
                  style={{ flex: 1, textAlign: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
