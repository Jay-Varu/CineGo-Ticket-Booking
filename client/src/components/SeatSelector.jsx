import React, { useState, useEffect } from 'react';
import './SeatSelector.css';

// This component receives the movie ID and a function to call when booking is confirmed
const SeatSelector = ({ movieId, showtime, onBookingConfirm, onClose }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  // Define a static seat layout
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatsPerRow = 8;

  useEffect(() => {
    // Fetch the seats that are already booked for this movie and showtime
    const fetchBookedSeats = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/taken-seats/${movieId}/${showtime.toISOString().split('T')[0]}`);
        const data = await res.json();
        setBookedSeats(data);
      } catch (err) {
        console.error("Failed to fetch booked seats", err);
      }
    };
    fetchBookedSeats();
  }, [movieId, showtime]);

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return; // Can't select booked seats

    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId) // Deselect if already selected
        : [...prev, seatId] // Select if not already selected
    );
  };

  return (
    <div className="seat-selector-modal">
      <div className="seat-selector-container">
        <h2>Select Your Seats</h2>
        <div className="screen"></div>
        <div className="seat-grid">
          {rows.map(row => (
            <div key={row} className="seat-row">
              {Array.from({ length: seatsPerRow }, (_, i) => {
                const seatId = `${row}${i + 1}`;
                const isSelected = selectedSeats.includes(seatId);
                const isBooked = bookedSeats.includes(seatId);
                const seatClass = `seat ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`;
                
                return (
                  <div key={seatId} className={seatClass} onClick={() => handleSeatClick(seatId)} />
                );
              })}
            </div>
          ))}
        </div>
        <p>You have selected {selectedSeats.length} seats.</p>
        <button onClick={() => onBookingConfirm(selectedSeats)} disabled={selectedSeats.length === 0}>
          Confirm Booking
        </button>
        <button onClick={onClose} style={{ marginLeft: '1rem' }}>Cancel</button>
      </div>
    </div>
  );
};

export default SeatSelector;