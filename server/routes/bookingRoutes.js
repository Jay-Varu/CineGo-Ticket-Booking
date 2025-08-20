const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (requires a token)
router.post('/', protect, async (req, res) => {
  // 'protect' runs first. If the token is invalid, this code will never be reached.
  
  const { movie, seats, showtime } = req.body;
  
  try {
    const newBooking = new Booking({
      movie,
      seats,
      showtime,
      user: req.user.id, // We get the user ID from the middleware
    });

    const booking = await newBooking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bookings/mybookings
// @desc    Get all bookings for the logged-in user
// @access  Private
router.get('/mybookings', protect, async (req, res) => {
  try {
    // Find all bookings where the 'user' field matches the logged-in user's ID
    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie', 'title posterUrl') // Populate with movie title and poster
      .sort({ showtime: -1 }); // Sort by most recent showtime first

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/bookings/taken-seats/:movieId/:showtime
// @desc    Get taken seats for a movie at a specific showtime
// @access  Public
router.get('/taken-seats/:movieId/:showtime', async (req, res) => {
  try {
    const { movieId, showtime } = req.params;
    
    // Find all bookings for that movie on that specific day (showtime)
    const bookings = await Booking.find({
      movie: movieId,
      showtime: new Date(showtime), // Ensure we're comparing Date objects
    });
    
    // Flatten the arrays of seats into a single array of taken seat numbers
    const takenSeats = bookings.flatMap(booking => booking.seats);
    
    res.json(takenSeats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;