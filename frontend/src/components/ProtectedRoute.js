import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { authenticated, loading, user } = useAuth();

  // Pendant le chargement, attendre (ne pas rediriger)
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  // Si non authentifié après le chargement, rediriger vers login
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si adminOnly est activé et que l'utilisateur n'est pas admin, rediriger vers dashboard
  if (adminOnly && !user?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

