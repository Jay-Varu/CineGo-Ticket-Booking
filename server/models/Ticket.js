const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    screening: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screening',
      required: true,
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['issued', 'checked_in', 'cancelled'],
      default: 'issued',
    },
  },
  { timestamps: true }
);

ticketSchema.index({ order: 1, seat: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
