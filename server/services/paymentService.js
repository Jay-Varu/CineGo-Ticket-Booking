const crypto = require('crypto');
const Razorpay = require('razorpay');

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

const createPaymentOrder = async ({ amount, currency, receipt }) => {
  if (!razorpay) {
    const error = new Error('Razorpay test credentials are not configured');
    error.statusCode = 503;
    throw error;
  }

  const order = await razorpay.orders.create({ amount, currency, receipt });
  return { id: order.id, keyId: process.env.RAZORPAY_KEY_ID };
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET || typeof signature !== 'string') return false;
  const digest = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  const expected = Buffer.from(digest);
  const actual = Buffer.from(signature);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

module.exports = { createPaymentOrder, verifyRazorpaySignature };
