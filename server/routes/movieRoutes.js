const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/movies
// @desc    Get all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/movies/:id
// @desc    Get a single movie by its ID
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/movies/admin/add
// @desc    Add a new movie (Admin only)
router.post('/admin/add', [protect, admin], async (req, res) => {
  const { title, genre, posterUrl, showtimes } = req.body;
  try {
    const newMovie = new Movie({ title, genre, posterUrl, showtimes });
    const movie = await newMovie.save();
    res.json(movie);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/movies/admin/edit/:id
// @desc    Update a movie (Admin only)
router.put('/admin/edit/:id', [protect, admin], async (req, res) => {
  const { title, genre, posterUrl, showtimes } = req.body;
  try {
    let movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    movie.title = title;
    movie.genre = genre;
    movie.posterUrl = posterUrl;
    movie.showtimes = showtimes;
    await movie.save();
    res.json(movie);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/movies/admin/delete/:id
// @desc    Delete a movie (Admin only)
router.delete('/admin/delete/:id', [protect, admin], async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    await Movie.findByIdAndDelete(movie._id);
    res.json({ msg: 'Movie removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;