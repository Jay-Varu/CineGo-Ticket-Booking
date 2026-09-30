import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token);
        navigate('/');
      } else {
        alert(data.msg);
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" name="email" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" name="password" onChange={handleChange} required />
        </div>
        <button type="submit" className="btn">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;