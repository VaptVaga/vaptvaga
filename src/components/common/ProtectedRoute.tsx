import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'freelancer' | 'company';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { authUser, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user && user.role !== allowedRole) {
    const homeRedirect = user.role === 'company' ? '/company/dashboard' : '/freelancer/dashboard';
    return <Navigate to={homeRedirect} replace />;
  }

  return <>{children}</>;
};
