const mongoose = require('mongoose');

const screeningSeatSchema = new mongoose.Schema(
  {
    screening: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screening',
      required: true,
      index: true,
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'held', 'sold', 'blocked'],
      default: 'available',
      index: true,
    },
    holdExpiresAt: Date,
    hold: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SeatHold',
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  { timestamps: true }
);

screeningSeatSchema.index({ screening: 1, seat: 1 }, { unique: true });

module.exports = mongoose.model('ScreeningSeat', screeningSeatSchema);
