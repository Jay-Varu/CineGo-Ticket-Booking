import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard'; // Import the new component

const MovieListPage = () => {
  const [movies, setMovies] = useState([]); // State to store the list of movies
  const [loading, setLoading] = useState(true); // State to handle loading status

  useEffect(() => {
    fetch('http://localhost:5000/api/movies')
      .then(res => res.json())
      .then(data => {
        setMovies(data);   // Update state with the fetched movies
        setLoading(false); // Set loading to false
      })
      .catch(err => {
        console.error("Failed to fetch movies:", err);
        setLoading(false);  // Also stop loading on error
      });
  }, []);  // Empty dependency array means this runs once on component mount

  if (loading) {
    return <p>Loading movies...</p>;
  }

  return (
    <div className="movie-list">
      {movies.map(movie => (
        <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieListPage;