const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_imovies_jwt_key_2026';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';

// Import Models
const User = require('./models/User');
const Movie = require('./models/Movie');
const Booking = require('./models/Booking');

// Middleware configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Atlas Connection Setup
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas successfully.');
    await autoSeedInitialMovies();
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB connection lost. Attempting to reconnect...');
});

// Auto-seed helper for out-of-the-box demonstration
async function autoSeedInitialMovies() {
  try {
    const count = await Movie.countDocuments();
    if (count === 0) {
      console.log('🎬 Seeding initial curated blockbuster movies...');
      const sampleMovies = [
        {
          title: 'Dune: Part Two',
          description:
            'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
          genre: ['Sci-Fi', 'Adventure', 'Action'],
          posterUrl:
            'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
          backdropUrl:
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
          duration: '166 min',
          rating: 8.9,
          releaseDate: '2024',
          showtimes: ['11:00 AM', '02:30 PM', '06:15 PM', '09:45 PM']
        },
        {
          title: 'Oppenheimer',
          description:
            'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
          genre: ['Biography', 'Drama', 'History'],
          posterUrl:
            'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
          backdropUrl:
            'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
          duration: '180 min',
          rating: 8.9,
          releaseDate: '2023',
          showtimes: ['10:00 AM', '01:30 PM', '05:00 PM', '08:30 PM']
        },
        {
          title: 'Interstellar',
          description:
            'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft to find a new planet.',
          genre: ['Sci-Fi', 'Adventure', 'Drama'],
          posterUrl:
            'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
          backdropUrl:
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
          duration: '169 min',
          rating: 8.7,
          releaseDate: '2014',
          showtimes: ['12:15 PM', '03:45 PM', '07:15 PM', '10:30 PM']
        },
        {
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
          showtimes: ['10:45 AM', '01:15 PM', '04:30 PM', '07:45 PM']
        }
      ];
      await Movie.insertMany(sampleMovies);
      console.log('✨ Seeded 4 initial movies into the database.');
    }
  } catch (err) {
    console.error('Seed helper error:', err.message);
  }
}

/* ========================================================
   API ROUTES
======================================================== */

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'IMovies Backend API is running smoothly',
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/* ========================================================
   USER AUTHENTICATION ROUTES
======================================================== */

// Register a new user
app.post('/api/users/register', async (req, res, next) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: Boolean(isAdmin)
    });

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email, isAdmin: savedUser.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        isAdmin: savedUser.isAdmin
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login existing user
app.post('/api/users/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify hashed password or plain text compatibility
    let isMatch = false;
    if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
app.get('/api/users/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Movie Routes
app.get('/api/movies', async (req, res, next) => {
  try {
    const { genre, search } = req.query;
    let query = {};

    if (genre && genre !== 'All') {
      query.genre = { $in: [new RegExp(genre, 'i')] };
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const movies = await Movie.find(query).sort({ rating: -1 });
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

app.get('/api/movies/:id', async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    next(error);
  }
});

app.post('/api/movies', async (req, res, next) => {
  try {
    const movie = new Movie(req.body);
    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/movies/:id', async (req, res, next) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ message: 'Movie deleted successfully', movie: deletedMovie });
  } catch (error) {
    next(error);
  }
});

// Booking Routes
app.post('/api/bookings', async (req, res, next) => {
  try {
    const { user, movieTitle, movieId, showtime, selectedSeats, totalAmount, bookingDate } =
      req.body;

    if (!movieTitle || !showtime || !selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({
        message: 'movieTitle, showtime, and at least one seat are required.'
      });
    }

    // Default or mock user id fallback for quick testing
    const userId = user || new mongoose.Types.ObjectId();

    const booking = new Booking({
      user: userId,
      movieTitle,
      movieId: movieId || null,
      showtime,
      bookingDate: bookingDate || new Date().toISOString().split('T')[0],
      selectedSeats,
      totalAmount: totalAmount || 0
    });

    const savedBooking = await booking.save();
    res.status(201).json({
      success: true,
      message: 'Seats booked successfully!',
      booking: savedBooking
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/bookings', async (req, res, next) => {
  try {
    const { user, movieTitle } = req.query;
    let query = {};
    if (user) query.user = user;
    if (movieTitle) query.movieTitle = movieTitle;

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

app.get('/api/bookings/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    next(error);
  }
});

// Seed API trigger for convenience
app.post('/api/seed', async (req, res, next) => {
  try {
    await Movie.deleteMany({});
    await autoSeedInitialMovies();
    res.json({ message: 'Demo movies refreshed successfully!' });
  } catch (error) {
    next(error);
  }
});

// Root fallback
app.get('/', (req, res) => {
  res.send('🍿 IMovies API Server is active. Access endpoints via /api/movies or /api/health');
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found on IMovies API server' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Internal Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 IMovies Backend Server running on port ${PORT}`);
  console.log(`🔗 Local API: http://localhost:${PORT}/api/health`);
});
