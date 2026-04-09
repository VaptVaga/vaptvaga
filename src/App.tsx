import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Layout
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';

// Pages
import { FreelancerLanding } from './pages/FreelancerLanding';
import { CompanyLanding } from './pages/CompanyLanding';
import { Login } from './pages/Login';
import { OnboardingRole } from './pages/OnboardingRole';
import { FreelancerOnboarding } from './pages/FreelancerOnboarding';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

// Redirects logged-in users away from the landing page
const HomeRedirect: React.FC = () => {
  const { profile, user, loading } = useAuth();

  if (loading) {
    return <FreelancerLanding />;
  }

  if (user) {
    if (!profile?.role) {
      return <Navigate to="/onboarding/role" replace />;
    }
    if (profile.role === 'freelancer') {
      // Redirect to onboarding if profile is incomplete, otherwise to dashboard
      const isProfileComplete = profile.skills && profile.skills.length > 0 && profile.cidade;
      return <Navigate to={isProfileComplete ? '/freelancer/dashboard' : '/freelancer/onboarding'} replace />;
    }
    return <Navigate to="/company/dashboard" replace />;
  }

  return <FreelancerLanding />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Hide global header on onboarding pages (they have their own)
  const hideHeader = location.pathname.startsWith('/freelancer/onboarding') ||
                     location.pathname.startsWith('/onboarding');
  

  return (
    <>
      {!hideHeader && <Header />}
      
      <main className={`w-full ${
        location.pathname === '/' ? 'pt-14 pb-0' : 
        location.pathname === '/empresas' ? 'pt-8 pb-0' : 
        'pt-[72px] pb-32 lg:pb-0'
      }`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><HomeRedirect /></PageWrapper>} />
            <Route path="/empresas" element={<PageWrapper><CompanyLanding /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/onboarding/role" element={<PageWrapper><OnboardingRole /></PageWrapper>} />
            <Route path="/freelancer/onboarding" element={<PageWrapper><FreelancerOnboarding /></PageWrapper>} />
            <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
            <Route path="/contato" element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/termos" element={<PageWrapper><TermsOfService /></PageWrapper>} />
            <Route path="/privacidade" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
            
            <Route 
              path="/freelancer/dashboard" 
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <PageWrapper><div className="p-6">Freelancer Dashboard</div></PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/company/dashboard" 
              element={
                <ProtectedRoute allowedRole="company">
                  <PageWrapper><div className="p-6">Company Dashboard</div></PageWrapper>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <PageWrapper><div className="p-6">Chat Interface</div></PageWrapper>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>

      {user && <BottomNav />}
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
