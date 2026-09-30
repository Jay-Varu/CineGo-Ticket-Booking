const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (requires a token)
router.post('/', protect, async (req, res) => {
  // 'protect' runs first. If the token is invalid, this code will never be reached.
  
  const { movie, seats, showtime } = req.body;

  const showtimeDate = new Date(showtime);
  if (Number.isNaN(showtimeDate.getTime())) {
    return res.status(400).json({ msg: 'Please provide a valid showtime.' });
  }
  if (showtimeDate < new Date()) {
    return res.status(400).json({ msg: 'Cannot book a ticket for a past showtime.' });
  }
  
  try {
    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ msg: 'Please select at least one seat.' });
    }

    const movieExists = await Movie.exists({ _id: movie });
    if (!movieExists) {
      return res.status(404).json({ msg: 'Movie not found' });
    }

    const requestedSeats = [...new Set(seats)];
    if (requestedSeats.length !== seats.length) {
      return res.status(400).json({ msg: 'Please select unique seats.' });
    }

    const existingBooking = await Booking.findOne({
      movie,
      showtime: showtimeDate,
      seats: { $in: requestedSeats },
    });
    if (existingBooking) {
      return res.status(409).json({ msg: 'One or more selected seats are already booked.' });
    }

    const newBooking = new Booking({
      movie,
      seats: requestedSeats,
      showtime : showtimeDate,
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
      showtime: new Date(decodeURIComponent(showtime)),
    });
    
    // Flatten the arrays of seats into a single array of taken seat numbers
    const takenSeats = bookings.flatMap(booking => booking.seats);
    
    res.json(takenSeats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Delete a booking
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    // Verify that the user owns the booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    if (booking.showtime <= new Date()) {
      return res.status(400).json({ msg: 'Past bookings cannot be cancelled' });
    }

    // Use the model to find and delete the document by its ID directly.
    await Booking.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Booking removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;