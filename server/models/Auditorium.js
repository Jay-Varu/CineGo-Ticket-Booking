const mongoose = require('mongoose');

const auditoriumSchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

auditoriumSchema.index({ venue: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Auditorium', auditoriumSchema);
