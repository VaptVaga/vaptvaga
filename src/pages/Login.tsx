import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginMobile } from './LoginMobile';
import { LoginDesktop } from './LoginDesktop';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="block lg:hidden w-full">
        <LoginMobile />
      </div>
      
      {/* Desktop View */}
      <div className="hidden lg:block w-full">
        <LoginDesktop />
      </div>
    </div>
  );
};
