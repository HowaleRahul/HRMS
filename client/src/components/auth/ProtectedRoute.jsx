import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user, token, loading, permissions } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Could replace with a proper Loader component
  }
  
  const currentToken = token || localStorage.getItem('token');

  // If no token exists at all, bounce to login
  if (!currentToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists but user isn't populated yet, show a loader to prevent race conditions during login redirection
  if (!user) {
    return <div>Loading...</div>;
  }

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/403" replace />; // Assuming a 403 page will exist or redirect to dashboard
  }

  return children;
};

export default ProtectedRoute;
