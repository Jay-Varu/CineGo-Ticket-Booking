import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Header.css';

const Header = () => {
  const { token, logout, user } = useAuth();

  return (
    <header className="main-header">
      <Link to="/" className="logo">CineGo</Link>
      <nav>
        <ul>
          {token ? (
            // If user is logged in (token exists)
            <>
              {user && user.role === 'admin' && (
                <li><NavLink to="/admin/dashboard">Admin Dashboard</NavLink></li>
              )}
              <li><NavLink to="/my-bookings">My Bookings</NavLink></li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            // If user is logged out (no token)
            <>
              <li><NavLink to="/login">Login</NavLink></li>
              <li><NavLink to="/register">Register</NavLink></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;