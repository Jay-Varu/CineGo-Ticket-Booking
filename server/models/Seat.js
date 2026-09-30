const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    auditorium: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auditorium',
      required: true,
      index: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    number: {
      type: Number,
      required: true,
      min: 1,
    },
    label: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['standard', 'accessible', 'companion'],
      default: 'standard',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

seatSchema.index({ auditorium: 1, label: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
