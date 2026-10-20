import React, { useState, useEffect, useMemo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams
} from 'react-router-dom';
import './App.css';

// Components & Pages
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';

// Curated Initial Movies Dataset
const INITIAL_MOVIES = [
  {
    _id: '1',
    title: 'Dune: Part Two',
    description:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    genre: ['Sci-Fi', 'Action', 'Adventure'],
    posterUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    duration: '166 min',
    rating: 8.9,
    releaseDate: '2024',
    format: 'IMAX 3D • Dolby Atmos',
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler'],
    showtimes: ['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM']
  },
  {
    _id: '2',
    title: 'Oppenheimer',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    genre: ['Drama', 'Biography', 'History'],
    posterUrl:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
    duration: '180 min',
    rating: 8.9,
    releaseDate: '2023',
    format: '70MM IMAX',
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    showtimes: ['10:00 AM', '01:30 PM', '05:00 PM', '08:30 PM']
  },
  {
    _id: '3',
    title: 'Interstellar',
    description:
      'When Earth becomes increasingly uninhabitable, an ex-NASA pilot leads a team of astronauts through a newly discovered wormhole in search of humanity’s new home.',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    posterUrl:
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    duration: '169 min',
    rating: 8.7,
    releaseDate: '2014',
    format: 'IMAX Laser Experience',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    showtimes: ['12:15 PM', '03:45 PM', '07:15 PM', '10:30 PM']
  },
  {
    _id: '4',
    title: 'Spider-Man: Across the Spider-Verse',
    description:
      'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    genre: ['Animation', 'Action', 'Adventure'],
    posterUrl:
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    backdropUrl:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80',
    duration: '140 min',
    rating: 8.8,
    releaseDate: '2023',
    format: '4DX • 3D',
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
    showtimes: ['10:45 AM', '01:15 PM', '04:30 PM', '07:45 PM']
  }
];

// Seat Tier Pricing Configurations
const TIER_CONFIG = {
  VIP: { name: 'VIP Lounger', price: 18.0, rows: ['A', 'B'], colorClass: 'vip' },
  PREMIUM: { name: 'Premium Club', price: 14.0, rows: ['C', 'D', 'E'], colorClass: 'premium' },
  STANDARD: { name: 'Standard Classic', price: 10.0, rows: ['F', 'G', 'H'], colorClass: 'standard' }
};

// 1. Cinematic Home Page
function HomePage({ movies, searchQuery }) {
  const [activeGenre, setActiveGenre] = useState('All');
  const navigate = useNavigate();

  const genres = ['All', 'Sci-Fi', 'Action', 'Drama', 'Adventure', 'Animation'];

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const movieGenres = Array.isArray(movie.genre) ? movie.genre : [movie.genre];
      const matchGenre =
        activeGenre === 'All' ||
        movieGenres.some((g) => g.toLowerCase() === activeGenre.toLowerCase());
      const matchSearch =
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movieGenres.some((g) =>
          g.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchGenre && matchSearch;
    });
  }, [movies, activeGenre, searchQuery]);

  const heroMovie = movies[0] || INITIAL_MOVIES[0];

  return (
    <main className="main-container">
      {/* Featured Blockbuster Billboard Hero */}
      <section
        className="hero-billboard"
        style={{ backgroundImage: `url(${heroMovie.backdropUrl || heroMovie.posterUrl})` }}
      >
        <div className="billboard-overlay"></div>
        <div className="billboard-content">
          <div className="billboard-badge">
            <span className="pulse-dot"></span>
            Featured Spotlight • In Theaters Now
          </div>
          <h1 className="billboard-title">{heroMovie.title}</h1>
          <div className="billboard-meta">
            <div className="rating-star">
              <span>★</span> {heroMovie.rating} / 10
            </div>
            <span>•</span>
            <span>{heroMovie.duration}</span>
            <span>•</span>
            <span>{heroMovie.releaseDate}</span>
            <span>•</span>
            <span className="tag-genre">
              {Array.isArray(heroMovie.genre)
                ? heroMovie.genre.join(', ')
                : heroMovie.genre}
            </span>
          </div>
          <p className="billboard-desc">{heroMovie.description}</p>
          <div className="billboard-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/book/${heroMovie._id}`)}
            >
              🎟️ Book Tickets Now
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(`/movie/${heroMovie._id}`)}
            >
              ℹ️ View Details
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Showcase Section */}
      <section className="filter-bar">
        <h2 className="section-title">
          <span>🎬</span> Now Showing in Theaters
        </h2>
        <div className="genre-pills">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={`genre-pill ${activeGenre === genre ? 'active' : ''}`}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>

      {/* Movies Grid */}
      <section className="movie-grid">
        {filteredMovies.map((movie) => (
          <article key={movie._id} className="movie-card">
            <div className="poster-wrapper">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="poster-img"
                loading="lazy"
              />
              <div className="rating-badge">
                <span>★</span> {movie.rating}
              </div>
              <div className="format-badge">{movie.format || 'IMAX 2D'}</div>
            </div>
            <div className="movie-info">
              <h3 className="movie-card-title">{movie.title}</h3>
              <div className="movie-card-meta">
                <span>{movie.duration}</span>
                <span>•</span>
                <span>
                  {Array.isArray(movie.genre) ? movie.genre[0] : movie.genre}
                </span>
              </div>
              <div className="quick-showtimes">
                {Array.isArray(movie.showtimes) &&
                  movie.showtimes.slice(0, 3).map((st, idx) => (
                    <span key={idx} className="showtime-pill">
                      {st}
                    </span>
                  ))}
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="btn-card-details"
                  onClick={() => navigate(`/movie/${movie._id}`)}
                >
                  Overview
                </button>
                <button
                  type="button"
                  className="btn-card-book"
                  onClick={() => navigate(`/book/${movie._id}`)}
                >
                  Book Seats
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

// 2. Movie Details Page
function MovieDetailsPage({ movies }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const movie = movies.find((m) => m._id === id) || INITIAL_MOVIES[0];

  const dates = [
    { day: 'Today', num: '20 Oct', active: true },
    { day: 'Tomorrow', num: '21 Oct' },
    { day: 'Wed', num: '22 Oct' },
    { day: 'Thu', num: '23 Oct' },
    { day: 'Fri', num: '24 Oct' }
  ];

  const defaultShowtimes = Array.isArray(movie.showtimes) && movie.showtimes.length > 0
    ? movie.showtimes
    : ['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM'];

  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedShowtime, setSelectedShowtime] = useState(defaultShowtimes[0]);

  return (
    <div className="details-page main-container">
      <div
        className="details-hero"
        style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}
      >
        <div className="details-hero-overlay"></div>
        <div className="details-header-content">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="details-poster"
          />
          <div className="details-main-info">
            <span className="billboard-badge">Now Showing</span>
            <h1 className="details-title">{movie.title}</h1>
            <div className="billboard-meta">
              <div className="rating-star">
                <span>★</span> {movie.rating} / 10
              </div>
              <span>•</span>
              <span>{movie.duration}</span>
              <span>•</span>
              <span>{movie.releaseDate}</span>
              <span>•</span>
              <span className="tag-genre">
                {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
              </span>
            </div>
            <p className="billboard-desc">{movie.description}</p>
            {movie.director && (
              <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '8px' }}>
                <strong>Director:</strong> {movie.director}
              </p>
            )}
            {movie.cast && (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                <strong>Cast:</strong> {Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="booking-step-section">
        <div className="step-label">Step 1: Choose Date</div>
        <div className="date-selector-row">
          {dates.map((d, index) => (
            <div
              key={index}
              className={`date-card ${selectedDate === d.day ? 'active' : ''}`}
              onClick={() => setSelectedDate(d.day)}
            >
              <div className="date-day">{d.day}</div>
              <div className="date-num">{d.num}</div>
            </div>
          ))}
        </div>

        <div className="step-label">Step 2: Choose Showtime</div>
        <div className="showtimes-grid-box">
          {defaultShowtimes.map((st, index) => (
            <button
              key={index}
              type="button"
              className={`showtime-select-btn ${
                selectedShowtime === st ? 'active' : ''
              }`}
              onClick={() => setSelectedShowtime(st)}
            >
              {st} • Auditorium 4
            </button>
          ))}
        </div>

        <div style={{ marginTop: '32px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              navigate(`/book/${movie._id}?time=${selectedShowtime}&date=${selectedDate}`)
            }
          >
            Select Your Seats ({selectedShowtime}) →
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. Interactive Seat Selection Grid with Dynamic Tier Pricing
function SeatSelectionPage({ movies }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const movie = movies.find((m) => m._id === id) || INITIAL_MOVIES[0];

  const defaultShowtime = Array.isArray(movie.showtimes) && movie.showtimes.length > 0
    ? movie.showtimes[0]
    : '06:15 PM';

  const queryParams = new URLSearchParams(window.location.search);
  const showtime = queryParams.get('time') || defaultShowtime;
  const showDate = queryParams.get('date') || 'Today, 20 Oct';

  // Realistic Pre-booked / Reserved Seats
  const reservedSeats = useMemo(
    () => new Set(['A4', 'A5', 'C6', 'C7', 'C8', 'D5', 'F3', 'F4', 'G8']),
    []
  );

  const [selectedSeats, setSelectedSeats] = useState(['C4', 'C5']);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const getSeatTier = (row) => {
    if (TIER_CONFIG.VIP.rows.includes(row)) return TIER_CONFIG.VIP;
    if (TIER_CONFIG.PREMIUM.rows.includes(row)) return TIER_CONFIG.PREMIUM;
    return TIER_CONFIG.STANDARD;
  };

  const handleSeatClick = (seatId) => {
    if (reservedSeats.has(seatId)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  // Dynamic Pricing Calculation
  const priceCalculation = useMemo(() => {
    let subtotal = 0;
    const tierCounts = { VIP: 0, PREMIUM: 0, STANDARD: 0 };

    selectedSeats.forEach((seatId) => {
      const row = seatId.charAt(0);
      const tier = getSeatTier(row);
      subtotal += tier.price;
      if (tier.name.includes('VIP')) tierCounts.VIP++;
      else if (tier.name.includes('Premium')) tierCounts.PREMIUM++;
      else tierCounts.STANDARD++;
    });

    const convenienceFee = selectedSeats.length * 1.5;
    const taxes = Number((subtotal * 0.08).toFixed(2));
    const grandTotal = Number((subtotal + convenienceFee + taxes).toFixed(2));

    return { subtotal, convenienceFee, taxes, grandTotal, tierCounts };
  }, [selectedSeats]);

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;

    const storedUser = JSON.parse(localStorage.getItem('imovies_user') || 'null');

    const payload = {
      user: storedUser ? storedUser.id : null,
      movieTitle: movie.title,
      movieId: movie._id,
      showtime,
      bookingDate: showDate,
      selectedSeats,
      totalAmount: priceCalculation.grandTotal
    };

    let newBooking = null;

    try {
      const token = localStorage.getItem('imovies_token');
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        newBooking = data.booking;
      }
    } catch {
      // offline fallback
    }

    if (!newBooking) {
      newBooking = {
        _id: 'bk-' + Date.now(),
        bookingReference: `IMV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        movieTitle: movie.title,
        showtime,
        bookingDate: showDate,
        hall: 'Screen 2 (IMAX 3D)',
        selectedSeats,
        totalAmount: priceCalculation.grandTotal,
        status: 'Confirmed',
        user: storedUser || { name: 'VIP Guest', email: 'guest@imovies.com' }
      };
    }

    // Persist to local bookings cache for profile history
    const existingLocal = JSON.parse(
      localStorage.getItem('imovies_local_bookings') || '[]'
    );
    localStorage.setItem(
      'imovies_local_bookings',
      JSON.stringify([newBooking, ...existingLocal])
    );

    setBookingResult(newBooking);
    setShowConfirmationModal(true);
  };

  const leftAisle = [1, 2, 3];
  const centerAisle = [4, 5, 6, 7, 8, 9];
  const rightAisle = [10, 11, 12];

  return (
    <div className="main-container">
      <div style={{ margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <h2 style={{ fontSize: '22px', color: '#fff' }}>{movie.title}</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {showDate} • {showtime} • Screen 2 (IMAX 3D)
          </span>
        </div>
      </div>

      <div className="booking-view-container">
        {/* Hall & Seating Grid */}
        <section className="theater-hall-card">
          <div className="screen-wrapper">
            <div className="screen-curved-bar"></div>
            <div className="screen-projection-glow"></div>
            <span className="screen-label">IMAX Projection Screen</span>
          </div>

          {/* Group 1: VIP Tier */}
          <div className="seat-tier-section">
            <div className="tier-header vip">
              <span className="tier-name vip">👑 VIP Lounger (Rows A - B)</span>
              <span className="tier-price-tag">${TIER_CONFIG.VIP.price.toFixed(2)}</span>
            </div>
            {['A', 'B'].map((row) => (
              <div key={row} className="seat-row">
                <span className="row-letter">{row}</span>
                <div className="seat-cluster">
                  {leftAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node vip-seat ${
                          isReserved ? 'reserved' : ''
                        } ${isSelected ? 'selected' : ''}`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • VIP • $${TIER_CONFIG.VIP.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="aisle-gap"></div>
                <div className="seat-cluster">
                  {centerAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node vip-seat ${
                          isReserved ? 'reserved' : ''
                        } ${isSelected ? 'selected' : ''}`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • VIP • $${TIER_CONFIG.VIP.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="aisle-gap"></div>
                <div className="seat-cluster">
                  {rightAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node vip-seat ${
                          isReserved ? 'reserved' : ''
                        } ${isSelected ? 'selected' : ''}`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • VIP • $${TIER_CONFIG.VIP.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Group 2: Premium Tier */}
          <div className="seat-tier-section">
            <div className="tier-header premium">
              <span className="tier-name premium">💎 Premium Club (Rows C - E)</span>
              <span className="tier-price-tag">${TIER_CONFIG.PREMIUM.price.toFixed(2)}</span>
            </div>
            {['C', 'D', 'E'].map((row) => (
              <div key={row} className="seat-row">
                <span className="row-letter">{row}</span>
                <div className="seat-cluster">
                  {leftAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node premium-seat ${
                          isReserved ? 'reserved' : ''
                        } ${isSelected ? 'selected' : ''}`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • Premium • $${TIER_CONFIG.PREMIUM.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="aisle-gap"></div>
                <div className="seat-cluster">
                  {centerAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node premium-seat ${
                          isReserved ? 'reserved' : ''
                        } ${isSelected ? 'selected' : ''}`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • Premium • $${TIER_CONFIG.PREMIUM.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="aisle-gap"></div>
                <div className="seat-cluster">
                  {rightAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node premium-seat ${
                          isReserved ? 'reserved' : ''
                        } ${isSelected ? 'selected' : ''}`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • Premium • $${TIER_CONFIG.PREMIUM.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Group 3: Standard Tier */}
          <div className="seat-tier-section">
            <div className="tier-header standard">
              <span className="tier-name standard">🎬 Classic Standard (Rows F - H)</span>
              <span className="tier-price-tag">${TIER_CONFIG.STANDARD.price.toFixed(2)}</span>
            </div>
            {['F', 'G', 'H'].map((row) => (
              <div key={row} className="seat-row">
                <span className="row-letter">{row}</span>
                <div className="seat-cluster">
                  {leftAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node ${isReserved ? 'reserved' : ''} ${
                          isSelected ? 'selected' : ''
                        }`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • Standard • $${TIER_CONFIG.STANDARD.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="aisle-gap"></div>
                <div className="seat-cluster">
                  {centerAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node ${isReserved ? 'reserved' : ''} ${
                          isSelected ? 'selected' : ''
                        }`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • Standard • $${TIER_CONFIG.STANDARD.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
                <div className="aisle-gap"></div>
                <div className="seat-cluster">
                  {rightAisle.map((num) => {
                    const seatId = `${row}${num}`;
                    const isReserved = reservedSeats.has(seatId);
                    const isSelected = selectedSeats.includes(seatId);
                    return (
                      <button
                        key={seatId}
                        type="button"
                        className={`seat-node ${isReserved ? 'reserved' : ''} ${
                          isSelected ? 'selected' : ''
                        }`}
                        disabled={isReserved}
                        onClick={() => handleSeatClick(seatId)}
                        title={`Seat ${seatId} • Standard • $${TIER_CONFIG.STANDARD.price}`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Legend Bar */}
          <div className="seat-legend">
            <div className="legend-item">
              <div className="legend-swatch swatch-available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch swatch-selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-swatch swatch-reserved"></div>
              <span>Reserved</span>
            </div>
            <div className="legend-item">
              <span style={{ color: 'var(--seat-vip)', fontWeight: 'bold' }}>●</span>
              <span>VIP ($18)</span>
            </div>
            <div className="legend-item">
              <span style={{ color: 'var(--seat-premium)', fontWeight: 'bold' }}>●</span>
              <span>Premium ($14)</span>
            </div>
            <div className="legend-item">
              <span style={{ color: 'var(--seat-standard)', fontWeight: 'bold' }}>●</span>
              <span>Standard ($10)</span>
            </div>
          </div>
        </section>

        {/* Dynamic Pricing Summary Sidebar */}
        <aside className="checkout-panel">
          <h3 className="checkout-header">Booking Summary</h3>
          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '4px' }}>
              {movie.title}
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {showDate} • {showtime}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Selected Seats ({selectedSeats.length}):
            </span>
            <div className="selected-seats-badge-wrap" style={{ marginTop: '8px' }}>
              {selectedSeats.length === 0 ? (
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Please click on seats to select
                </span>
              ) : (
                selectedSeats.map((seatId) => (
                  <div key={seatId} className="seat-token">
                    <span>{seatId}</span>
                    <button type="button" onClick={() => handleSeatClick(seatId)}>
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="price-breakdown">
            {priceCalculation.tierCounts.VIP > 0 && (
              <div className="breakdown-row">
                <span>VIP Lounger ({priceCalculation.tierCounts.VIP}x)</span>
                <span>${(priceCalculation.tierCounts.VIP * 18).toFixed(2)}</span>
              </div>
            )}
            {priceCalculation.tierCounts.PREMIUM > 0 && (
              <div className="breakdown-row">
                <span>Premium Club ({priceCalculation.tierCounts.PREMIUM}x)</span>
                <span>${(priceCalculation.tierCounts.PREMIUM * 14).toFixed(2)}</span>
              </div>
            )}
            {priceCalculation.tierCounts.STANDARD > 0 && (
              <div className="breakdown-row">
                <span>Standard ({priceCalculation.tierCounts.STANDARD}x)</span>
                <span>${(priceCalculation.tierCounts.STANDARD * 10).toFixed(2)}</span>
              </div>
            )}
            <div className="breakdown-row">
              <span>Convenience Fee</span>
              <span>${priceCalculation.convenienceFee.toFixed(2)}</span>
            </div>
            <div className="breakdown-row">
              <span>Taxes (8%)</span>
              <span>${priceCalculation.taxes.toFixed(2)}</span>
            </div>
            <div className="breakdown-row total">
              <span>Grand Total</span>
              <span className="total-val">
                ${priceCalculation.grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={selectedSeats.length === 0}
            onClick={handleConfirmBooking}
          >
            Confirm & Pay ${priceCalculation.grandTotal.toFixed(2)}
          </button>
        </aside>
      </div>

      {/* Ticket Pass Confirmation Modal */}
      {showConfirmationModal && bookingResult && (
        <div className="modal-backdrop">
          <div className="ticket-pass">
            <div className="ticket-top">
              <span className="ticket-badge">E-Ticket Confirmed</span>
              <h2 className="ticket-movie-title">{movie.title}</h2>
              <div className="ticket-grid">
                <div>
                  <div className="ticket-label">Date & Time</div>
                  <div className="ticket-val">
                    {showDate} • {showtime}
                  </div>
                </div>
                <div>
                  <div className="ticket-label">Cinema Hall</div>
                  <div className="ticket-val">Screen 2 (IMAX 3D)</div>
                </div>
                <div>
                  <div className="ticket-label">Seats</div>
                  <div className="ticket-val" style={{ color: 'var(--accent-gold)' }}>
                    {selectedSeats.join(', ')}
                  </div>
                </div>
                <div>
                  <div className="ticket-label">Amount Paid</div>
                  <div className="ticket-val">
                    ${priceCalculation.grandTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            <div className="ticket-bottom">
              <div className="barcode-mock"></div>
              <div className="ref-code">
                BOOKING REF: {bookingResult.bookingReference || 'IMV-98721'}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Please present this digital pass at the theater entry gate or scanner kiosk.
              </p>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setShowConfirmationModal(false);
                    navigate('/profile');
                  }}
                >
                  View in Profile
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => {
                    setShowConfirmationModal(false);
                    navigate('/');
                  }}
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Application Root
export default function App() {
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

  // Initialize user from localStorage if logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('imovies_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore parse error
    }
  }, []);

  // Proactively fetch movies from Express backend if server is active
  useEffect(() => {
    fetch('http://localhost:5000/api/movies')
      .then((res) => {
        if (!res.ok) throw new Error('Network response not ok');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMovies(data);
        }
      })
      .catch(() => {
        // Keeps the initial curated sample movies as resilient fallback
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('imovies_token');
    localStorage.removeItem('imovies_user');
    setUser(null);
  };

  return (
    <Router>
      <div className="imovies-app">
        <Navbar
          user={user}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Routes>
          <Route
            path="/"
            element={<HomePage movies={movies} searchQuery={searchQuery} />}
          />
          <Route
            path="/movie/:id"
            element={<MovieDetailsPage movies={movies} />}
          />
          <Route
            path="/book/:id"
            element={<SeatSelectionPage movies={movies} />}
          />
          <Route
            path="/login"
            element={<LoginPage onLoginSuccess={(u) => setUser(u)} />}
          />
          <Route
            path="/register"
            element={<RegisterPage onLoginSuccess={(u) => setUser(u)} />}
          />
          <Route
            path="/profile"
            element={<ProfilePage user={user} onLogout={handleLogout} />}
          />
          <Route
            path="/admin"
            element={
              <AdminDashboard
                user={user}
                movies={movies}
                setMovies={setMovies}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
