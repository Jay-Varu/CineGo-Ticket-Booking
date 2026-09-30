const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    auditorium: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auditorium',
      required: true,
      index: true,
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    salesOpenAt: {
      type: Date,
      required: true,
    },
    salesCloseAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'on-sale', 'sold-out', 'cancelled', 'completed'],
      default: 'scheduled',
      index: true,
    },
    language: {
      type: String,
      default: 'Original',
      trim: true,
    },
    format: {
      type: String,
      default: '2D',
      trim: true,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

screeningSchema.index({ movie: 1, auditorium: 1, startsAt: 1 }, { unique: true });

module.exports = mongoose.model('Screening', screeningSchema);
