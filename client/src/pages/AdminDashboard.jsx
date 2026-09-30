import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetch('http://localhost:5000/api/movies')
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error('Error fetching movies:', error));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      fetch(`http://localhost:5000/api/movies/admin/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            setMovies(movies.filter((movie) => movie._id !== id));
          } else {
            alert('Failed to delete movie');
          }
        })
        .catch((error) => console.error('Error deleting movie:', error));
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <Link to="/admin/movies/add" className="btn">Add New Movie</Link>
      </div>
      <div className="admin-movie-list">
        <table>
          <thead>
            <tr>
              <th>Movie</th>
              <th>Genre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie._id}>
                <td>
                  <div className="movie-info">
                    <img src={movie.posterUrl} alt={movie.title} />
                    <span>{movie.title}</span>
                  </div>
                </td>
                <td>{movie.genre}</td>
                <td className="actions">
                  <Link to={`/admin/movies/edit/${movie._id}`} className="btn-edit">Edit</Link>
                  <button onClick={() => handleDelete(movie._id)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;