const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const Screening = require('../models/Screening');
const ScreeningSeat = require('../models/ScreeningSeat');
const { protect } = require('../middleware/authMiddleware');
const { createPaymentOrder, verifyRazorpaySignature } = require('../services/paymentService');

const router = express.Router();
const orderNumber = () => `CG-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
const ticketNumber = () => `T-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

const validateRequest = ({ screeningId, seatIds }) => {
  if (!mongoose.isValidObjectId(screeningId)) {
    const error = new Error('Invalid screening ID');
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
  return uniqueSeatIds;
};

const finalizeWithoutTransaction = async ({ order, userId, paymentId, signature }) => {
  const currentOrder = await Order.findOne({
    _id: order._id,
    user: userId,
    status: 'pending_payment',
  });
  if (!currentOrder) {
    const error = new Error('Order is no longer pending payment');
    error.statusCode = 409;
    throw error;
  }

  const seats = await ScreeningSeat.find({
    screening: currentOrder.screening,
    seat: { $in: currentOrder.seatIds },
    status: 'available',
  });
  if (seats.length !== currentOrder.seatIds.length) {
    const error = new Error('One or more selected seats were purchased by another customer');
    error.statusCode = 409;
    throw error;
  }

  const seatIds = seats.map((seat) => seat._id);
  const updateResult = await ScreeningSeat.updateMany(
    { _id: { $in: seatIds }, status: 'available' },
    { $set: { status: 'sold', order: currentOrder._id } }
  );
  if (updateResult.modifiedCount !== currentOrder.seatIds.length) {
    const error = new Error('Unable to finalize all selected seats');
    error.statusCode = 409;
    throw error;
  }

  try {
    await Ticket.insertMany(currentOrder.seatIds.map((seat) => ({
      ticketNumber: ticketNumber(),
      order: currentOrder._id,
      screening: currentOrder.screening,
      seat,
      price: Math.round(currentOrder.amount / currentOrder.seatIds.length),
    })));
    currentOrder.status = 'paid';
    currentOrder.paidAt = new Date();
    currentOrder.razorpayPaymentId = paymentId;
    currentOrder.razorpaySignature = signature;
    return currentOrder.save();
  } catch (error) {
    await ScreeningSeat.updateMany(
      { _id: { $in: seatIds }, order: currentOrder._id, status: 'sold' },
      { $set: { status: 'available' }, $unset: { order: 1 } }
    );
    throw error;
  }
};

router.post('/', protect, async (req, res) => {
  try {
    const seatIds = validateRequest(req.body);
    const screening = await Screening.findById(req.body.screeningId);
    if (!screening) return res.status(404).json({ msg: 'Screening not found' });

    const now = new Date();
    if (screening.status !== 'on-sale' || now < screening.salesOpenAt || now >= screening.salesCloseAt) {
      return res.status(409).json({ msg: 'This screening is not currently accepting bookings' });
    }

    const seats = await ScreeningSeat.find({
      screening: screening._id,
      seat: { $in: seatIds },
      status: 'available',
    });
    if (seats.length !== seatIds.length) {
      return res.status(409).json({ msg: 'One or more selected seats are no longer available' });
    }

    const amount = Math.round(screening.basePrice * 100) * seatIds.length;
    const currentOrderNumber = orderNumber();
    const payment = await createPaymentOrder({
      amount,
      currency: screening.currency,
      receipt: currentOrderNumber,
    });

    const order = await Order.create({
      orderNumber: currentOrderNumber,
      user: req.user.id,
      screening: screening._id,
      seatIds,
      status: 'pending_payment',
      amount,
      currency: screening.currency,
      paymentProvider: 'razorpay',
      razorpayOrderId: payment.id,
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    });

    res.status(201).json({
      order,
      payment: {
        keyId: payment.keyId,
        orderId: payment.id,
        amount,
        currency: screening.currency,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(err.statusCode || 500).json({ msg: err.message || 'Server error' });
  }
});

const finalizeOrder = async ({ orderId, userId, paymentId, signature }) => {
  if (!mongoose.isValidObjectId(orderId)) {
    const error = new Error('Invalid order ID');
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  if (order.status !== 'pending_payment') return order;
  if (order.expiresAt <= new Date()) {
    const error = new Error('Payment window has expired');
    error.statusCode = 409;
    throw error;
  }
  if (!paymentId || !verifyRazorpaySignature({
    orderId: order.razorpayOrderId,
    paymentId,
    signature,
  })) {
    const error = new Error('Invalid Razorpay payment signature');
    error.statusCode = 400;
    throw error;
  }

  const session = await mongoose.startSession();
  try {
    let confirmedOrder;
    await session.withTransaction(async () => {
      const currentOrder = await Order.findOne({
        _id: order._id,
        user: userId,
        status: 'pending_payment',
      }).session(session);
      if (!currentOrder) {
        const error = new Error('Order is no longer pending payment');
        error.statusCode = 409;
        throw error;
      }

      const seats = await ScreeningSeat.find({
        screening: currentOrder.screening,
        seat: { $in: currentOrder.seatIds },
        status: 'available',
      }).session(session);
      if (seats.length !== currentOrder.seatIds.length) {
        const error = new Error('One or more selected seats were purchased by another customer');
        error.statusCode = 409;
        throw error;
      }

      const updateResult = await ScreeningSeat.updateMany(
        { _id: { $in: seats.map((seat) => seat._id) }, status: 'available' },
        { $set: { status: 'sold', order: currentOrder._id } },
        { session }
      );
      if (updateResult.modifiedCount !== currentOrder.seatIds.length) {
        const error = new Error('Unable to finalize all selected seats');
        error.statusCode = 409;
        throw error;
      }

      await Ticket.insertMany(
        currentOrder.seatIds.map((seat) => ({
          ticketNumber: ticketNumber(),
          order: currentOrder._id,
          screening: currentOrder.screening,
          seat,
          price: Math.round(currentOrder.amount / currentOrder.seatIds.length),
        })),
        { session }
      );

      currentOrder.status = 'paid';
      currentOrder.paidAt = new Date();
      currentOrder.razorpayPaymentId = paymentId;
      currentOrder.razorpaySignature = signature;
      confirmedOrder = await currentOrder.save({ session });
    });
    return confirmedOrder;
  } catch (error) {
    const transactionUnsupported = error.code === 20
      || error.message.includes('Transaction numbers are only allowed');
    if (transactionUnsupported) {
      return finalizeWithoutTransaction({ order, userId, paymentId, signature });
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

router.post('/:id/confirm', protect, async (req, res) => {
  try {
    const order = await finalizeOrder({
      orderId: req.params.id,
      userId: req.user.id,
      paymentId: req.body.razorpayPaymentId,
      signature: req.body.razorpaySignature,
    });
    res.json({ order, msg: 'Payment confirmed' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ msg: err.message || 'Server error' });
  }
});

router.get('/', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .populate({
      path: 'screening',
      select: 'startsAt endsAt currency movie auditorium',
      populate: { path: 'movie', select: 'title posterUrl' },
    })
    .populate({
      path: 'tickets',
      select: 'ticketNumber seat price status',
      populate: { path: 'seat', select: 'label' },
    })
    .sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;
