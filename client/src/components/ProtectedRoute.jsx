import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole = 'admin', children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') return <Navigate to="/nomination" replace />;
  if (requiredRole === 'user' && !['user', 'admin'].includes(user?.role)) return <Navigate to="/login" replace />;

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
