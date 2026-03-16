import { useAuth } from '@/lib/authContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import FreelancerDashboard from './FreelancerDashboard';
import CompanyDashboard from './CompanyDashboard';

const Dashboard = () => {
  const { user, authUser, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authUser) return <Navigate to="/" replace />;
  if (!user?.role) return <Navigate to="/onboarding" replace />;

  return user.role === 'company' ? <CompanyDashboard /> : <FreelancerDashboard />;
};

export default Dashboard;
