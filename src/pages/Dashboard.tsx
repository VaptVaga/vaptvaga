import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import FreelancerDashboard from './FreelancerDashboard';
import CompanyDashboard from './CompanyDashboard';

const Dashboard = () => {
  const { profile, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (!profile?.role) return <Navigate to="/onboarding" replace />;

  return profile.role === 'company' ? <CompanyDashboard /> : <FreelancerDashboard />;
};

export default Dashboard;
