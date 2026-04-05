import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Layout
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuth } from './lib/authContext';

// Pages
import { FreelancerLanding } from './pages/FreelancerLanding.tsx';
import { CompanyLanding } from './pages/CompanyLanding.tsx';
import { Login } from './pages/Login.tsx';
import { OnboardingRole } from './pages/OnboardingRole.tsx';
import { FreelancerOnboarding } from './pages/FreelancerOnboarding.tsx';
import { FAQ } from './pages/FAQ.tsx';
import { Contact } from './pages/Contact.tsx';
import { TermsOfService } from './pages/TermsOfService.tsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.tsx';

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
  const { user, authUser, isLoading } = useAuth();

  // We render the landing page as a fallback even during loading to avoid a blank screen.
  // If the user turns out to be logged in, the useEffect/Navigate will handle the transition.
  if (isLoading) {
    return <FreelancerLanding />;
  }

  if (authUser) {
    // User is logged in — redirect based on profile status
    if (!user?.role) {
      return <Navigate to="/onboarding/role" replace />;
    }
    if (user.role === 'freelancer') {
      return <Navigate to="/freelancer/onboarding" replace />;
    }
    return <Navigate to="/company/dashboard" replace />;
  }

  return <FreelancerLanding />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { authUser } = useAuth();

  // Hide global header on onboarding pages (they have their own)
  const hideHeader = location.pathname.startsWith('/freelancer/onboarding') ||
                     location.pathname.startsWith('/onboarding');
  
  const isLandingPage = location.pathname === '/' || location.pathname === '/empresas';

  return (
    <>
      {!hideHeader && <Header />}
      
      <main className={`w-full ${isLandingPage ? 'pb-0' : 'pb-32 lg:pb-0'}`}>
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

      {authUser && <BottomNav />}
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
