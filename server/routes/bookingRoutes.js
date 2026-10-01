const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, (req, res) => {
  res.status(410).json({ msg: 'Direct booking is retired. Hold screening seats before payment.' });
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