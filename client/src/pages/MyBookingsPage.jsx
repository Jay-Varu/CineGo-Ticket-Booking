import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/api/bookings/mybookings', {
          headers: {
            'Authorization': `Bearer ${token}`, // Send the token to access the protected route
          },
        });
        const data = await res.json();
        if (res.ok) {
          setBookings(data);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  if (loading) return <p>Loading your bookings...</p>;

  return (
    <div className="bookings-container">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <img src={booking.movie.posterUrl} alt={booking.movie.title} />
              <div className="booking-details">
                <h3>{booking.movie.title}</h3>
                <p><strong>Showtime:</strong> {new Date(booking.showtime).toLocaleString()}</p>
                <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
                <p><strong>Booked on:</strong> {new Date(booking.bookedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;