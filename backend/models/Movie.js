const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required']
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
      trim: true
    },
    backdropUrl: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: '120 min'
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10
    },
    releaseDate: {
      type: String,
      default: '2026'
    },
    showtimes: {
      type: [String],
      required: [true, 'Showtimes array is required'],
      default: ['10:30 AM', '01:45 PM', '05:15 PM', '08:45 PM']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Movie', movieSchema);
