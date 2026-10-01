import React, { useEffect, useState } from 'react';
import './SeatSelector.css';

const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const SeatSelector = ({ screeningId, token, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seats, setSeats] = useState([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/screenings/${screeningId}/seats`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Unable to load seats.');
        setSeats(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSeats();
  }, [screeningId]);

  const handleSeatClick = (seat) => {
    if (seat.status !== 'available' || processing || paid) return;

    setSelectedSeats((previous) => (
      previous.includes(seat.seat._id)
        ? previous.filter((id) => id !== seat.seat._id)
        : [...previous, seat.seat._id]
    ));
  };

  const handlePayment = async () => {
    if (selectedSeats.length === 0) return;

    setProcessing(true);
    setError('');
    try {
      const orderResponse = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ screeningId, seatIds: selectedSeats }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.msg || 'Unable to create payment order.');

      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay Checkout could not be loaded.');

      const checkout = new window.Razorpay({
        key: orderData.payment.keyId,
        amount: orderData.payment.amount,
        currency: orderData.payment.currency,
        name: 'CineGo',
        description: 'Movie tickets',
        order_id: orderData.payment.orderId,
        handler: async (response) => {
          try {
            const confirmationResponse = await fetch(`http://localhost:5000/api/orders/${orderData.order._id}/confirm`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const confirmationData = await confirmationResponse.json();
            if (!confirmationResponse.ok) throw new Error(confirmationData.msg || 'Payment verification failed.');
            setPaid(true);
          } catch (err) {
            setError(err.message);
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      });

      checkout.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed.');
        setProcessing(false);
      });
      checkout.open();
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const rows = seats.reduce((grouped, seat) => {
    const row = seat.seat.row;
    grouped[row] = grouped[row] || [];
    grouped[row].push(seat);
    return grouped;
  }, {});

  return (
    <div className="seat-selector-modal">
      <div className="seat-selector-container">
        <h2>Select Your Seats</h2>
        <div className="screen"></div>
        <div className="seat-grid">
          {Object.entries(rows).map(([row, rowSeats]) => (
            <div key={row} className="seat-row">
              {rowSeats.map((seat) => {
                const isSelected = selectedSeats.includes(seat.seat._id);
                const isUnavailable = seat.status !== 'available';
                const seatClass = `seat ${isSelected ? 'selected' : ''} ${isUnavailable ? 'booked' : ''}`;

                return (
                  <div
                    key={seat.seat._id}
                    className={seatClass}
                    onClick={() => handleSeatClick(seat)}
                    role="button"
                    tabIndex={isUnavailable ? -1 : 0}
                    aria-label={`${seat.seat.label}${isUnavailable ? ' unavailable' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        {error && <p>{error}</p>}
        {paid && <p>Payment verified. Your tickets have been issued.</p>}
        <p>You have selected {selectedSeats.length} seats.</p>
        <div className="booking-actions">
          <button onClick={handlePayment} className="btn" disabled={selectedSeats.length === 0 || processing || paid}>
            {processing ? 'Processing...' : 'Pay with Razorpay'}
          </button>
          <button onClick={onClose} className="btn btn-secondary" disabled={processing}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;
