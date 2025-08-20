import React from 'react';
import { Link } from 'react-router-dom';

// This component receives 'movie' data as a prop from its parent
const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movie/${movie._id}`} className="movie-card-link">
      <div className="movie-card">
        <img src={movie.posterUrl} alt={movie.title} />
        <h3>{movie.title}</h3>
        <p>Genre: {movie.genre}</p>
        <p>Rating: {movie.rating}</p>
      </div>
    </Link>
  );
};

export default MovieCard;