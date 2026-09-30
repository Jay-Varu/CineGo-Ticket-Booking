import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './contextValue';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      if (token) {
        const decoded = jwtDecode(token);
        setUser(decoded.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const decoded = jwtDecode(newToken);
      setUser(decoded.user);
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
