import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import SeatSelector from '../components/SeatSelector';
import './MovieDetailPage.css';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedScreening, setSelectedScreening] = useState(null);

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
      .then(async (data) => {
        if (data && data._id) {
          setMovie(data);
          const screeningsResponse = await fetch(`http://localhost:5000/api/screenings?movieId=${data._id}`);
          if (!screeningsResponse.ok) throw new Error('Unable to load screenings.');
          setScreenings(await screeningsResponse.json());
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

  const handleScreeningClick = (screening) => {
    if (!token) {
      alert('Please log in to book tickets.');
      return;
    }
    setSelectedScreening(screening);
    setIsSelectorOpen(true);
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
                {screenings.map((screening) => {
                  const showtime = new Date(screening.startsAt);
                  return (
                    <button
                      key={screening._id}
                      className="book-ticket-btn"
                      onClick={() => handleScreeningClick(screening)}
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
          screeningId={selectedScreening._id}
          token={token}
          onClose={() => setIsSelectorOpen(false)}
        />
      )}
    </>
  );
};

export default MovieDetailPage;
