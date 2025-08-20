const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// @route   GET /api/movies
// @desc    Get all movies
router.get('/', async (req, res) => {
  try {
    // Use the Movie model to find all documents in the movies collection
    const movies = await Movie.find();
    res.json(movies); // Send the movies back as a JSON response
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/movies/:id
// @desc    Get a single movie by its ID
router.get('/:id', async (req, res) => {
  try {
    // req.params.id gets the 'id' value from the URL
    const movie = await Movie.findById(req.params.id);

    if(!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }

    res.json(movie); // Send the found movie back as a JSON response

  } catch (err) {
    console.error(err.message);
    //if ID is not a valid format, it might cause a server error
    res.status(500).send('Server Error');
  }
});


module.exports = router;