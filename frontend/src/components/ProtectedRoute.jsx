import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { employee, token, role } = useAuth();

  if (!token || !employee) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-card">
          <h2>403 - Access Denied</h2>
          <p>
            You must have the <strong>{requiredRole.toUpperCase()}</strong> role to access this page.
          </p>
          <p>Your current role is: <code>{role || 'employee'}</code></p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
