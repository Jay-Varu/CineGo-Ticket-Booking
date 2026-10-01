const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    screening: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screening',
      required: true,
      index: true,
    },
    seatIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ['pending_payment', 'paid', 'payment_failed', 'cancelled', 'expired', 'refunded'],
      default: 'pending_payment',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
    },
    paymentProvider: {
      type: String,
      enum: ['dummy', 'razorpay'],
      required: true,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

orderSchema.virtual('tickets', {
  ref: 'Ticket',
  localField: '_id',
  foreignField: 'order',
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
