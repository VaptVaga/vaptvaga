import { useAuth } from '@/lib/authContext';
import { Navigate } from 'react-router-dom';
import FreelancerDashboard from './FreelancerDashboard';
import CompanyDashboard from './CompanyDashboard';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return user?.role === 'company' ? <CompanyDashboard /> : <FreelancerDashboard />;
};

export default Dashboard;
