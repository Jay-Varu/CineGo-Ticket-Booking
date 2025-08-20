import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeatSelector from '../components/SeatSelector';

const MovieDetailPage = () => {
  // useParams hook gets the dynamic part of the URL (the :id)
  const { id } = useParams(); 
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); // Get the token from our context
  const [isSelectorOpen, setIsSelectorOpen] = useState(false); // State to control the modal

  // Hardcode a showtime for simplicity. In a real app, this would be dynamic.
  const showtime = new Date("2025-08-20T20:00:00");

  useEffect(() => {
    // CRITICAL: Ensure this URL uses backticks (` `) for the template literal
    fetch(`http://localhost:5000/api/movies/${id}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch movie details:", err);
        setLoading(false);
      });
  }, [id]); // The effect re-runs if the id in the URL changes

  // This function is passed down to the SeatSelector component
  const handleConfirmBooking = async (selectedSeats) => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    const bookingDetails = {
      movie: movie._id,
      seats: selectedSeats,
      showtime: showtime,
    };
    
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingDetails),
      });

      if (res.ok) {
        alert(`Booking successful for seats: ${selectedSeats.join(', ')}`);
        setIsSelectorOpen(false); // Close the modal on success
      } else {
        const data = await res.json();
        alert(`Booking failed: ${data.msg}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <p>Loading details...</p>;
  }

  if (!movie) {
    return <p>Movie not found!</p>;
  }

  return (
    <div className="movie-detail-container">
      <h1>{movie.title}</h1>
      <img src={movie.posterUrl} alt={movie.title} />
      <p><strong>Genre:</strong> {movie.genre}</p>
      <p><strong>Rating:</strong> {movie.rating}</p>
      
      <div className="booking-section">
        {token ? (
          // If logged in, show the booking button
          <button onClick={handleBooking}>Book Tickets</button>
        ) : (
          // If logged out, show a message with a link to the login page
          <p>Please <Link to="/login">log in</Link> to book tickets.</p>
        )}
      </div>
    </div>
  );
};

export default MovieDetailPage;