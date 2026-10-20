import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminDashboard({ user, movies, setMovies }) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'movies'
  const [allBookings, setAllBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingSearch, setBookingSearch] = useState('');
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const navigate = useNavigate();

  // Add Movie Form State
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    posterUrl: '',
    backdropUrl: '',
    duration: '145 min',
    rating: 8.5,
    releaseDate: '2026',
    showtimes: '10:30 AM, 02:00 PM, 06:15 PM, 09:30 PM'
  });
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch all bookings for admin
  useEffect(() => {
    const fetchAllBookings = async () => {
      setLoadingBookings(true);
      try {
        const token = localStorage.getItem('imovies_token');
        const response = await fetch('http://localhost:5000/api/bookings', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setAllBookings(data);
            setLoadingBookings(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend all bookings error:', err.message);
      }

      // Check localStorage bookings or seed sample admin bookings
      const localBookings = JSON.parse(
        localStorage.getItem('imovies_local_bookings') || '[]'
      );

      const demoAdminBookings = [
        {
          _id: 'bk-101',
          bookingReference: 'IMV-839210',
          movieTitle: 'Dune: Part Two',
          showtime: '06:15 PM',
          bookingDate: 'Today, 20 Oct',
          user: { name: 'Sarah Connor', email: 'sarah@skynet.com' },
          selectedSeats: ['B4', 'B5'],
          totalAmount: 41.58,
          status: 'Confirmed'
        },
        {
          _id: 'bk-102',
          bookingReference: 'IMV-482019',
          movieTitle: 'Oppenheimer',
          showtime: '08:30 PM',
          bookingDate: 'Fri, 24 Oct',
          user: { name: 'Bruce Wayne', email: 'bruce@wayne.corp' },
          selectedSeats: ['D6', 'D7'],
          totalAmount: 32.40,
          status: 'Confirmed'
        },
        {
          _id: 'bk-103',
          bookingReference: 'IMV-992144',
          movieTitle: 'Interstellar',
          showtime: '07:15 PM',
          bookingDate: 'Sat, 25 Oct',
          user: { name: 'Peter Parker', email: 'peter@dailybugle.com' },
          selectedSeats: ['A1', 'A2', 'A3'],
          totalAmount: 62.37,
          status: 'Confirmed'
        },
        ...localBookings
      ];

      setAllBookings(demoAdminBookings);
      setLoadingBookings(false);
    };

    fetchAllBookings();
  }, []);

  // Filter Bookings by search query
  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const q = bookingSearch.toLowerCase();
      const matchMovie = b.movieTitle && b.movieTitle.toLowerCase().includes(q);
      const matchRef =
        b.bookingReference && b.bookingReference.toLowerCase().includes(q);
      const matchCustomer =
        b.user &&
        ((b.user.name && b.user.name.toLowerCase().includes(q)) ||
          (b.user.email && b.user.email.toLowerCase().includes(q)));
      return matchMovie || matchRef || matchCustomer;
    });
  }, [allBookings, bookingSearch]);

  // Overall Statistics Calculation
  const stats = useMemo(() => {
    const totalBookingsCount = allBookings.length;
    const totalRevenue = allBookings.reduce(
      (sum, b) => sum + (Number(b.totalAmount) || 0),
      0
    );
    const totalSeatsBooked = allBookings.reduce(
      (count, b) => count + (b.selectedSeats ? b.selectedSeats.length : 0),
      0
    );
    const totalMoviesCount = movies ? movies.length : 0;

    return {
      revenue: totalRevenue.toFixed(2),
      bookings: totalBookingsCount,
      seats: totalSeatsBooked,
      movies: totalMoviesCount
    };
  }, [allBookings, movies]);

  // Handle Add New Movie Submission
  const handleAddMovie = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!newMovie.title || !newMovie.description || !newMovie.posterUrl) {
      setFormError('Title, description, and poster URL are mandatory');
      return;
    }

    setFormSubmitting(true);

    const formattedMovie = {
      title: newMovie.title,
      description: newMovie.description,
      genre: newMovie.genre.split(',').map((g) => g.trim()),
      posterUrl: newMovie.posterUrl,
      backdropUrl: newMovie.backdropUrl || newMovie.posterUrl,
      duration: newMovie.duration,
      rating: Number(newMovie.rating),
      releaseDate: newMovie.releaseDate,
      showtimes: newMovie.showtimes.split(',').map((st) => st.trim())
    };

    try {
      const token = localStorage.getItem('imovies_token');
      const response = await fetch('http://localhost:5000/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formattedMovie)
      });

      if (response.ok) {
        const saved = await response.json();
        setMovies((prev) => [saved, ...prev]);
      } else {
        // Fallback local update
        const mockSaved = { ...formattedMovie, _id: 'm-' + Date.now() };
        setMovies((prev) => [mockSaved, ...prev]);
      }

      setShowAddMovieModal(false);
      setNewMovie({
        title: '',
        description: '',
        genre: 'Action, Sci-Fi',
        posterUrl: '',
        backdropUrl: '',
        duration: '145 min',
        rating: 8.5,
        releaseDate: '2026',
        showtimes: '10:30 AM, 02:00 PM, 06:15 PM, 09:30 PM'
      });
    } catch {
      const mockSaved = { ...formattedMovie, _id: 'm-' + Date.now() };
      setMovies((prev) => [mockSaved, ...prev]);
      setShowAddMovieModal(false);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete Movie
  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;

    try {
      const token = localStorage.getItem('imovies_token');
      await fetch(`http://localhost:5000/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (err) {
      console.warn('Delete movie error:', err);
    }

    setMovies((prev) => prev.filter((m) => m._id !== movieId));
  };

  // Guard check for non-admin
  if (!user || !user.isAdmin) {
    return (
      <div className="auth-page main-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '44px', marginBottom: '12px' }}>🔒</div>
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>Admin Access Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '14px' }}>
            You need administrator credentials to access the IMovies management console.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/login" className="btn-primary">
              Sign In as Admin
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard main-container">
      {/* Header Row */}
      <div className="admin-header-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="section-title">
              <span>⚡</span> Cinema Administration Console
            </h1>
            <span className="nav-badge-admin">Verified Admin</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Monitor real-time theater revenue, live reservations, and movie programming.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowAddMovieModal(true)}
        >
          ➕ Add New Movie
        </button>
      </div>

      {/* Stats KPI Overview Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon gold">💰</div>
          <div>
            <div className="stat-num">${stats.revenue}</div>
            <div className="stat-label">Total Box Office Revenue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">🎟️</div>
          <div>
            <div className="stat-num">{stats.bookings}</div>
            <div className="stat-label">Total Reservations</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">💺</div>
          <div>
            <div className="stat-num">{stats.seats}</div>
            <div className="stat-label">Total Seats Occupied</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">🎬</div>
          <div>
            <div className="stat-num">{stats.movies}</div>
            <div className="stat-label">Active Blockbusters</div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          🎟️ All Customer Bookings ({allBookings.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => setActiveTab('movies')}
        >
          🎬 Movie Catalogue Management ({movies ? movies.length : 0})
        </button>
      </div>

      {/* TAB 1: ALL BOOKINGS TABLE */}
      {activeTab === 'bookings' && (
        <section>
          <div style={{ marginBottom: '16px', maxWidth: '380px' }}>
            <input
              type="text"
              placeholder="Filter by customer, movie, or reference..."
              value={bookingSearch}
              onChange={(e) => setBookingSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px'
              }}
            />
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Movie Title</th>
                  <th>Customer Info</th>
                  <th>Showtime & Date</th>
                  <th>Seats</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingBookings ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                      Loading bookings records...
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                      No matching reservations found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b._id || b.bookingReference}>
                      <td style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                        {b.bookingReference || 'IMV-XXXX'}
                      </td>
                      <td style={{ color: '#fff', fontWeight: 600 }}>{b.movieTitle}</td>
                      <td>
                        <div>{b.user && b.user.name ? b.user.name : 'Walk-in Guest'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {b.user && b.user.email ? b.user.email : 'guest@imovies.com'}
                        </div>
                      </td>
                      <td>
                        {b.bookingDate || 'Today'} • {b.showtime}
                      </td>
                      <td>
                        {Array.isArray(b.selectedSeats) ? b.selectedSeats.join(', ') : 'N/A'}
                      </td>
                      <td style={{ fontWeight: 'bold', color: '#fff' }}>
                        ${Number(b.totalAmount || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className="booking-status-tag">{b.status || 'Confirmed'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: MOVIE CATALOGUE MANAGEMENT */}
      {activeTab === 'movies' && (
        <section>
          <div className="movie-grid">
            {movies.map((movie) => (
              <article key={movie._id} className="movie-card">
                <div className="poster-wrapper">
                  <img src={movie.posterUrl} alt={movie.title} className="poster-img" />
                  <div className="rating-badge">★ {movie.rating}</div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-card-title">{movie.title}</h3>
                  <div className="movie-card-meta">
                    <span>{movie.duration}</span>
                    <span>•</span>
                    <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
                  </div>
                  <div className="card-actions" style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-card-details"
                      onClick={() => navigate(`/movie/${movie._id}`)}
                    >
                      View Live
                    </button>
                    <button
                      type="button"
                      className="btn-card-book"
                      style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ff6b6b' }}
                      onClick={() => handleDeleteMovie(movie._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* MODAL: ADD NEW MOVIE */}
      {showAddMovieModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#fff', fontSize: '22px' }}>🎬 Add New Blockbuster</h2>
              <button
                type="button"
                style={{ background: 'none', color: '#fff', fontSize: '20px' }}
                onClick={() => setShowAddMovieModal(false)}
              >
                ✕
              </button>
            </div>

            {formError && <div className="auth-alert-error" style={{ marginBottom: '16px' }}>⚠️ {formError}</div>}

            <form onSubmit={handleAddMovie} className="auth-form">
              <div className="form-group">
                <label>Movie Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Gladiator II"
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description / Synopsis *</label>
                <textarea
                  rows="3"
                  placeholder="Compelling movie storyline..."
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Genres (comma-separated)</label>
                  <input
                    type="text"
                    value={newMovie.genre}
                    onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={newMovie.duration}
                    onChange={(e) => setNewMovie({ ...newMovie, duration: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={newMovie.rating}
                    onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Release Year</label>
                  <input
                    type="text"
                    value={newMovie.releaseDate}
                    onChange={(e) => setNewMovie({ ...newMovie, releaseDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Poster Image URL *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newMovie.posterUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Backdrop Banner URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newMovie.backdropUrl}
                  onChange={(e) => setNewMovie({ ...newMovie, backdropUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Showtimes (comma-separated)</label>
                <input
                  type="text"
                  value={newMovie.showtimes}
                  onChange={(e) => setNewMovie({ ...newMovie, showtimes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowAddMovieModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Saving...' : 'Publish Movie →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
