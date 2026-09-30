import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Header.css';

const Header = () => {
  const { token, logout, user } = useAuth(); // Get token, logout function and user from context

  return (
    <header className="main-header">
      <Link to="/" className="logo">CineGo</Link>
      <nav>
        <ul>
          {token ? (
            // If user is logged in (token exists)
            <>
              {user && user.role === 'admin' && (
                <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
              )}
              <li><Link to="/my-bookings">My Bookings</Link></li> 
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          ) : (
            // If user is logged out (no token)
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;