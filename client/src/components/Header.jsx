import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  // Import the custom hook
import './Header.css';

const Header = () => {
  const { token, logout } = useAuth(); // Get token and logout function from context

  return (
    <header className="main-header">
      <Link to="/" className="logo">CineGo</Link>
      <nav>
        <ul>
          {token ? (
            // If user is logged in (token exists)
            <li>
              <li><Link to="/my-bookings">My Bookings</Link></li> 
              <button onClick={logout}>Logout</button>
            </li>
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