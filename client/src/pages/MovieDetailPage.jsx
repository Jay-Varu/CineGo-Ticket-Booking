import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeatSelector from '../components/SeatSelector';

const MovieDetailPage = () => {
  // useParams hook gets the dynamic part of the URL (the :id)
  const { id } = useParams(); 
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); 
  const { token } = useAuth();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false); // State to control the modal
  const [selectedShowtime, setSelectedShowtime] = useState(null); // State for the selected showtime

  useEffect(() => {
    console.log("Fetching movie with ID:", id);
    setLoading(true);
    setError('');

    fetch(`http://localhost:5000/api/movies/${id}`)
      .then(res => {
        console.log("Received response from server:", res);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log("Received movie data:", data);
        if (data && data._id) {
          setMovie(data);
        } else {
          throw new Error("Movie data not found in response.");
        }
      })
      .catch(err => {
        console.error("Failed to fetch movie details:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        console.log("Finished fetching.");
      });
  }, [id]); 

  const handleShowtimeClick = (showtime) => {
    if (!token) {
      alert("Please log in to book tickets.");
      return;
    }
    setSelectedShowtime(showtime);
    setIsSelectorOpen(true);
  };

  // This function is passed down to the SeatSelector component
  const handleConfirmBooking = async (selectedSeats) => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
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

  if (loading) return <p>Loading details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!movie) return <p>Movie not found!</p>;

  return (
    <>
      <div className="movie-detail-container">
        <h1>{movie.title}</h1>
        <img src={movie.posterUrl} alt={movie.title} />
        <p><strong>Genre:</strong> {movie.genre}</p>
        <p><strong>Rating:</strong> {movie.rating}</p>
        
        <div className="showtime-selection">
          <h3>Select a Showtime:</h3>
          <div className="showtime-buttons">
            {movie && movie.showtimes && movie.showtimes.map((showtimeStr) => {
              const showtime = new Date(showtimeStr);
              const isPast = showtime < new Date(); 

              return (
                <button 
                  key={showtimeStr} 
                  onClick={() => handleShowtimeClick(showtime)}
                  disabled={isPast} // Disable the button if the showtime is in the past
                  title={isPast ? "This showtime has already passed" : ""}
                >
                  {showtime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </button>
              );
            })}
          </div>
        </div>
        
        {!token && <p>Please <Link to="/login">log in</Link> to book tickets.</p>}
      </div>

      {/* Conditionally render the SeatSelector modal */}
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