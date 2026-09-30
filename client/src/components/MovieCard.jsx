import React from 'react';
import './MovieCard.css';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <img src={movie.posterUrl || 'https://via.placeholder.com/400x600'} alt={movie.title} />
      <div className="movie-card-content">
        <h3>{movie.title}</h3>
        <p>{movie.genre}</p>
        <Link to={`/movie/${movie._id}`} className="movie-card-link">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;