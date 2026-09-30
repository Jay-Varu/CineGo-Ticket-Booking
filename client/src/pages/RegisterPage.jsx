import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token); // Use the login function
        navigate('/'); // Redirect to home page on success
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" name="name" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" onChange={handleChange} required />
        </div>
        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;