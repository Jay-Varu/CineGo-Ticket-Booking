import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const AdminRoute = () => {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
