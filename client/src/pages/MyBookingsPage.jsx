import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/useAuth';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchBookings = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/bookings/mybookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        const now = new Date();
        const upcoming = [];
        const past = [];

        data.forEach(booking => {
          if (new Date(booking.showtime) > now) {
            upcoming.push(booking);
          } else {
            past.push(booking);
          }
        });

        setUpcomingBookings(upcoming);
        setPastBookings(past);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [fetchBookings, token]);

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          fetchBookings(); // Refresh bookings after cancellation
        }
      } catch (err) {
        console.error("Failed to cancel booking:", err);
      }
    }
  };

  if (loading) return <p>Loading your bookings...</p>;

  return (
    <div className="bookings-container">
      <h2>My Bookings</h2>

      <h3>Upcoming Shows</h3>
      {upcomingBookings.length === 0 ? (
        <p>You have no upcoming bookings.</p>
      ) : (
        <div className="bookings-list">
          {upcomingBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              {booking.movie ? <img src={booking.movie.posterUrl} alt={booking.movie.title} /> : <div className="booking-movie-unavailable">Movie unavailable</div>}
              <div className="booking-details">
                <h3>{booking.movie?.title || 'Movie unavailable'}</h3>
                <p><strong>Showtime:</strong> {new Date(booking.showtime).toLocaleString()}</p>
                <p><strong>Seats:</strong> {booking.seats.join(', ')}</p>
                <p><strong>Booked on:</strong> {new Date(booking.bookedAt).toLocaleDateString()}</p>
                <button onClick={() => handleCancel(booking._id)} className="cancel-btn">Cancel Booking</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '2rem' }}>Booking History</h3>
      {pastBookings.length === 0 ? (
        <p>You have no past bookings.</p>
      ) : (
        <div className="bookings-list">
          {pastBookings.map((booking) => (
            <div key={booking._id} className="booking-card past-booking">
              {booking.movie ? <img src={booking.movie.posterUrl} alt={booking.movie.title} /> : <div className="booking-movie-unavailable">Movie unavailable</div>}
              <div className="booking-details">
                <h3>{booking.movie?.title || 'Movie unavailable'}</h3>
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