import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import SeatSelector from '../components/SeatSelector';
import './MovieDetailPage.css';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');

    fetch(`http://localhost:5000/api/movies/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data._id) {
          setMovie(data);
        } else {
          throw new Error('Movie data not found in response.');
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleShowtimeClick = (showtime) => {
    if (!token) {
      alert('Please log in to book tickets.');
      return;
    }
    setSelectedShowtime(showtime);
    setIsSelectorOpen(true);
  };

  const handleConfirmBooking = async (selectedSeats) => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    const bookingDetails = {
      movie: movie._id,
      seats: selectedSeats,
      showtime: selectedShowtime,
    };

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingDetails),
      });

      if (res.ok) {
        alert(`Booking successful for seats: ${selectedSeats.join(', ')}`);
        setIsSelectorOpen(false);
      } else {
        const data = await res.json();
        alert(`Booking failed: ${data.msg}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!movie) return <p>Movie not found!</p>;

  return (
    <>
      <div className="movie-detail-container">
        <div className="movie-detail-card">
          <img src={movie.posterUrl} alt={movie.title} />
          <div className="movie-detail-info">
            <h2>{movie.title}</h2>
            <p className="detail-item"><strong>Genre:</strong> {movie.genre}</p>
            <div className="showtime-selection">
              <h3>Select a Showtime:</h3>
              <div className="showtime-buttons">
                {movie.showtimes.map((showtimeStr) => {
                  const showtime = new Date(showtimeStr);
                  const isPast = showtime < new Date();

                  return (
                    <button
                      key={showtimeStr}
                      className="book-ticket-btn"
                      onClick={() => handleShowtimeClick(showtime)}
                      disabled={isPast}
                      title={isPast ? 'This showtime has already passed' : ''}
                    >
                      {showtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  );
                })}
              </div>
            </div>
            {!token && <p>Please <Link to="/login">log in</Link> to book tickets.</p>}
          </div>
        </div>
      </div>

      {isSelectorOpen && (
        <SeatSelector
          movieId={movie._id}
          showtime={selectedShowtime}
          onBookingConfirm={handleConfirmBooking}
          onClose={() => setIsSelectorOpen(false)}
        />
      )}
    </>
  );
};

export default MovieDetailPage;
