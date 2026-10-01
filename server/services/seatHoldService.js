const crypto = require('crypto');
const mongoose = require('mongoose');
const Screening = require('../models/Screening');
const ScreeningSeat = require('../models/ScreeningSeat');
const SeatHold = require('../models/SeatHold');

const HOLD_MINUTES = 10;

const releaseExpiredHolds = async (screeningId) => {
  const expiredHolds = await SeatHold.find({
    screening: screeningId,
    status: 'active',
    expiresAt: { $lte: new Date() },
  }).select('_id');

  if (expiredHolds.length === 0) return;

  const holdIds = expiredHolds.map((hold) => hold._id);
  await ScreeningSeat.updateMany(
    { screening: screeningId, status: 'held', hold: { $in: holdIds } },
    { $set: { status: 'available' }, $unset: { hold: 1, holdExpiresAt: 1 } }
  );
  await SeatHold.updateMany(
    { _id: { $in: holdIds } },
    { $set: { status: 'expired' } }
  );
};

const createSeatHold = async ({ screeningId, seatIds, userId }) => {
  if (!mongoose.isValidObjectId(screeningId) || !mongoose.isValidObjectId(userId)) {
    const error = new Error('Invalid screening or user ID');
    error.statusCode = 400;
    throw error;
  }

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    const error = new Error('Select at least one seat');
    error.statusCode = 400;
    throw error;
  }

  const uniqueSeatIds = [...new Set(seatIds.map(String))];
  if (uniqueSeatIds.length !== seatIds.length || uniqueSeatIds.some((id) => !mongoose.isValidObjectId(id))) {
    const error = new Error('Seats must be unique valid seat IDs');
    error.statusCode = 400;
    throw error;
  }

  await releaseExpiredHolds(screeningId);

  const screening = await Screening.findById(screeningId);
  if (!screening) {
    const error = new Error('Screening not found');
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  if (screening.status !== 'on-sale' || now < screening.salesOpenAt || now >= screening.salesCloseAt) {
    const error = new Error('This screening is not currently accepting bookings');
    error.statusCode = 409;
    throw error;
  }

  const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);
  const token = crypto.randomUUID();
  const hold = await SeatHold.create({
    token,
    user: userId,
    screening: screeningId,
    seats: uniqueSeatIds,
    expiresAt,
  });

  const claimed = [];
  try {
    for (const seatId of uniqueSeatIds) {
      const seat = await ScreeningSeat.findOneAndUpdate(
        {
          screening: screeningId,
          seat: seatId,
          $or: [
            { status: 'available' },
            { status: 'held', holdExpiresAt: { $lte: now } },
          ],
        },
        {
          $set: { status: 'held', hold: hold._id, holdExpiresAt: expiresAt },
        },
        { new: true }
      );

      if (!seat) {
        const error = new Error('One or more seats are no longer available');
        error.statusCode = 409;
        throw error;
      }
      claimed.push(seat._id);
    }
  } catch (error) {
    if (claimed.length > 0) {
      await ScreeningSeat.updateMany(
        { _id: { $in: claimed }, hold: hold._id },
        { $set: { status: 'available' }, $unset: { hold: 1, holdExpiresAt: 1 } }
      );
    }
    await SeatHold.findByIdAndUpdate(hold._id, { status: 'released' });
    throw error;
  }

  return { hold, expiresAt };
};

const releaseSeatHold = async ({ token, userId }) => {
  const hold = await SeatHold.findOne({ token, user: userId, status: 'active' });
  if (!hold) {
    const error = new Error('Active hold not found');
    error.statusCode = 404;
    throw error;
  }

  const status = hold.expiresAt <= new Date() ? 'expired' : 'released';
  await ScreeningSeat.updateMany(
    { hold: hold._id },
    { $set: { status: 'available' }, $unset: { hold: 1, holdExpiresAt: 1 } }
  );
  hold.status = status;
  await hold.save();
  return hold;
};

module.exports = { createSeatHold, releaseSeatHold, releaseExpiredHolds, HOLD_MINUTES };
