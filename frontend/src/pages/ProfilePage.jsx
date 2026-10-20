import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProfilePage({ user, onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserBookings = async () => {
      setLoading(true);
      try {
        // Fetch bookings matching this user from backend
        const url = user.id
          ? `http://localhost:5000/api/bookings?user=${user.id}`
          : 'http://localhost:5000/api/bookings';

        const token = localStorage.getItem('imovies_token');
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.ok) {
          const data = await response.json();
          // Filter if backend returned all bookings and user has specific id
          const userSpecific = user.id
            ? data.filter((b) => !b.user || b.user._id === user.id || b.user === user.id)
            : data;

          if (userSpecific.length > 0) {
            setBookings(userSpecific);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend bookings fetch error:', err.message);
      }

      // Check localStorage for offline demo bookings
      const localBookings = JSON.parse(
        localStorage.getItem('imovies_local_bookings') || '[]'
      );

      if (localBookings.length > 0) {
        setBookings(localBookings);
      } else {
        // Curated initial demo bookings for rich showcase
        const initialShowcaseBookings = [
          {
            _id: 'b-001',
            bookingReference: 'IMV-839210',
            movieTitle: 'Dune: Part Two',
            showtime: '06:15 PM',
            bookingDate: 'Today, 20 Oct',
            hall: 'Screen 1 (IMAX 3D)',
            selectedSeats: ['B4', 'B5'],
            totalAmount: 41.58,
            status: 'Confirmed',
            createdAt: new Date().toISOString()
          },
          {
            _id: 'b-002',
            bookingReference: 'IMV-482019',
            movieTitle: 'Oppenheimer',
            showtime: '08:30 PM',
            bookingDate: 'Fri, 24 Oct',
            hall: 'Screen 3 (70MM Dolby)',
            selectedSeats: ['D6', 'D7'],
            totalAmount: 32.40,
            status: 'Confirmed',
            createdAt: new Date().toISOString()
          }
        ];
        setBookings(initialShowcaseBookings);
      }
      setLoading(false);
    };

    fetchUserBookings();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="profile-container main-container">
      {/* User Information Card */}
      <section className="profile-card">
        <div className="profile-info-wrap">
          <div className="profile-large-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="profile-name">{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <div className="profile-tags">
              <span className="tag-vip-badge">⭐ VIP Premier Member</span>
              {user.isAdmin && <span className="tag-admin-badge">⚡ Cinema Admin</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {user.isAdmin && (
            <Link to="/admin" className="btn-secondary">
              ⚡ Open Admin Console
            </Link>
          )}
          <Link to="/" className="btn-primary">
            🎟️ Book New Tickets
          </Link>
          <button type="button" className="btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </section>

      {/* Booking History Section */}
      <div className="history-title-row">
        <h2 className="section-title">
          <span>🎟️</span> My Booking History ({bookings.length})
        </h2>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          All active and past digital ticket passes
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading your reserved tickets...
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state-card">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍿</div>
          <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>
            No Bookings Found
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            You haven't reserved any tickets yet. Explore our current blockbusters!
          </p>
          <Link to="/" className="btn-primary">
            Explore Now Showing Movies
          </Link>
        </div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((item) => (
            <article key={item._id || item.bookingReference} className="booking-item-card">
              <div className="booking-item-header">
                <div>
                  <h3 className="booking-movie-title">{item.movieTitle}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>
                    REF: {item.bookingReference}
                  </span>
                </div>
                <span className="booking-status-tag">{item.status || 'Confirmed'}</span>
              </div>

              <div className="booking-item-meta">
                <div>
                  <strong>Showtime:</strong> {item.bookingDate || '2026'} at {item.showtime}
                </div>
                <div>
                  <strong>Auditorium:</strong> {item.hall || 'Screen 2 (IMAX 3D)'}
                </div>
                <div>
                  <strong>Seats:</strong>
                  <div className="booking-seats-list">
                    {Array.isArray(item.selectedSeats) &&
                      item.selectedSeats.map((seat) => (
                        <span key={seat} className="booking-seat-chip">
                          {seat}
                        </span>
                      ))}
                  </div>
                </div>
              </div>

              <div className="booking-footer-row">
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Total Paid
                  </div>
                  <div className="booking-total-price">
                    ${Number(item.totalAmount || 0).toFixed(2)}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '8px 14px' }}
                  onClick={() => setSelectedTicket(item)}
                >
                  View Digital Pass
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Ticket Pass Modal */}
      {selectedTicket && (
        <div className="modal-backdrop">
          <div className="ticket-pass">
            <div className="ticket-top">
              <span className="ticket-badge">E-Ticket Confirmed</span>
              <h2 className="ticket-movie-title">{selectedTicket.movieTitle}</h2>
              <div className="ticket-grid">
                <div>
                  <div className="ticket-label">Date & Time</div>
                  <div className="ticket-val">
                    {selectedTicket.bookingDate || 'Today'} • {selectedTicket.showtime}
                  </div>
                </div>
                <div>
                  <div className="ticket-label">Hall / Screen</div>
                  <div className="ticket-val">
                    {selectedTicket.hall || 'Screen 2 (IMAX 3D)'}
                  </div>
                </div>
                <div>
                  <div className="ticket-label">Seats</div>
                  <div className="ticket-val" style={{ color: 'var(--accent-gold)' }}>
                    {selectedTicket.selectedSeats.join(', ')}
                  </div>
                </div>
                <div>
                  <div className="ticket-label">Amount Paid</div>
                  <div className="ticket-val">
                    ${Number(selectedTicket.totalAmount || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-bottom">
              <div className="barcode-mock"></div>
              <div className="ref-code">
                BOOKING REF: {selectedTicket.bookingReference}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Present this barcode ticket pass at the auditorium entrance.
              </p>
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setSelectedTicket(null)}
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
