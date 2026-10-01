import React, { useState, useEffect } from 'react';
import './SeatSelector.css';

const SeatSelector = ({ screeningId, token, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seats, setSeats] = useState([]);
  const [hold, setHold] = useState(null);
  const [error, setError] = useState('');

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
    if (seat.status !== 'available' || hold) return;

    setSelectedSeats(prev => 
      prev.includes(seat.seat._id)
        ? prev.filter(id => id !== seat.seat._id)
        : [...prev, seat.seat._id]
    );
  };

  const handleHold = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/screenings/${screeningId}/holds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ seatIds: selectedSeats }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Unable to hold seats.');
      setHold(data);
      setSeats(prev => prev.map((seat) => selectedSeats.includes(seat.seat._id) ? { ...seat, status: 'held' } : seat));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = async () => {
    if (hold) {
      await fetch(`http://localhost:5000/api/screenings/${screeningId}/holds/${hold.token}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    onClose();
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
                  <div key={seat.seat._id} className={seatClass} onClick={() => handleSeatClick(seat)} />
                );
              })}
            </div>
          ))}
        </div>
        {error && <p>{error}</p>}
        {hold && <p>Seats held until {new Date(hold.expiresAt).toLocaleTimeString()}.</p>}
        <p>You have selected {selectedSeats.length} seats.</p>
        <div className="booking-actions">
          <button onClick={handleHold} className="btn" disabled={selectedSeats.length === 0 || Boolean(hold)}>
            Hold Seats
          </button>
          <button onClick={handleClose} className="btn btn-secondary">Release & Close</button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelector;