const express = require('express');
const mongoose = require('mongoose');
const Screening = require('../models/Screening');
const ScreeningSeat = require('../models/ScreeningSeat');
const { protect } = require('../middleware/authMiddleware');
const { createSeatHold, releaseSeatHold, releaseExpiredHolds, HOLD_MINUTES } = require('../services/seatHoldService');
require('../models/Auditorium');
require('../models/Venue');
require('../models/Seat');

const router = express.Router();

router.get('/', async (req, res) => {
  const { movieId, date } = req.query;

  if (movieId && !mongoose.isValidObjectId(movieId)) {
    return res.status(400).json({ msg: 'Invalid movie ID' });
  }

  const query = { status: { $nin: ['cancelled', 'completed'] } };
  if (movieId) query.movie = movieId;

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ msg: 'Invalid date' });
    }
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    query.startsAt = { $gte: start, $lt: end };
  }

  try {
    const screenings = await Screening.find(query)
      .populate('movie', 'title genre posterUrl rating')
      .populate({
        path: 'auditorium',
        select: 'name venue',
        populate: { path: 'venue', select: 'name timezone address' },
      })
      .sort({ startsAt: 1 });

    res.json(screenings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid screening ID' });
  }

  try {
    const screening = await Screening.findById(req.params.id)
      .populate('movie', 'title genre posterUrl rating')
      .populate({
        path: 'auditorium',
        select: 'name venue',
        populate: { path: 'venue', select: 'name timezone address' },
      });

    if (!screening) return res.status(404).json({ msg: 'Screening not found' });
    res.json(screening);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/:id/seats', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid screening ID' });
  }

  try {
    const screening = await Screening.exists({ _id: req.params.id });
    if (!screening) return res.status(404).json({ msg: 'Screening not found' });

    await releaseExpiredHolds(req.params.id);

    const seats = await ScreeningSeat.find({ screening: req.params.id })
      .populate('seat', 'row number label type')
      .sort({ 'seat.row': 1, 'seat.number': 1 });

    res.json(seats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/:id/holds', protect, async (req, res) => {
  try {
    const result = await createSeatHold({
      screeningId: req.params.id,
      seatIds: req.body.seatIds,
      userId: req.user.id,
    });

    res.status(201).json({
      token: result.hold.token,
      screeningId: result.hold.screening,
      seatIds: result.hold.seats,
      expiresAt: result.expiresAt,
      holdMinutes: HOLD_MINUTES,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ msg: err.message || 'Server error' });
  }
});

router.delete('/:id/holds/:token', protect, async (req, res) => {
  try {
    await releaseSeatHold({ token: req.params.token, userId: req.user.id });
    res.json({ msg: 'Seat hold released' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
