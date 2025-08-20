const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // This field must exist
  },
  genre: {
    type: String,
    required: true,
  },
  posterUrl: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
  }
});

// A Model is a wrapper on the Schema that provides an interface
// to the database for creating, querying, updating, deleting records, etc.
const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;