import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../context/useAuth';
import './MovieForm.css';

const AddMoviePage = () => {
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [poster, setPoster] = useState('');
  const [showtimes, setShowtimes] = useState([new Date()]);
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleShowtimeChange = (date, index) => {
    const newShowtimes = [...showtimes];
    newShowtimes[index] = date;
    setShowtimes(newShowtimes);
  };

  const addShowtime = () => {
    setShowtimes([...showtimes, new Date()]);
  };

  const removeShowtime = (index) => {
    const newShowtimes = showtimes.filter((_, i) => i !== index);
    setShowtimes(newShowtimes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !genre || !poster || showtimes.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    const movieData = { title, genre, posterUrl: poster, showtimes };

    fetch('http://localhost:5000/api/movies/admin/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(movieData),
    })
      .then((response) => {
        if (response.ok) {
          navigate('/admin/dashboard');
        } else {
          alert('Failed to add movie');
        }
      })
      .catch((error) => console.error('Error adding movie:', error));
  };

  return (
    <div className="movie-form-container">
      <h2>Add Movie</h2>
      <form onSubmit={handleSubmit} className="movie-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="genre">Genre</label>
          <input id="genre" type="text" value={genre} onChange={(e) => setGenre(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="poster">Poster URL</label>
          <input id="poster" type="text" value={poster} onChange={(e) => setPoster(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Showtimes</label>
          {showtimes.map((showtime, index) => (
            <div key={index} className="showtime-input">
              <DatePicker
                selected={showtime}
                onChange={(date) => handleShowtimeChange(date, index)}
                showTimeSelect
                dateFormat="Pp"
              />
              <button type="button" onClick={() => removeShowtime(index)} className="btn-remove">Remove</button>
            </div>
          ))}
          <button type="button" onClick={addShowtime} className="btn-add">Add Showtime</button>
        </div>
        <button type="submit" className="btn">Add Movie</button>
      </form>
    </div>
  );
};

export default AddMoviePage;
