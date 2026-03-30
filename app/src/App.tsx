import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Layout
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { Landing } from './pages/Landing.tsx';
import { Login } from './pages/Login.tsx';
import { OnboardingRole } from './pages/OnboardingRole.tsx';
// import { FreelancerDashboard } from './pages/FreelancerDashboard';
// import { CompanyDashboard } from './pages/CompanyDashboard';

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

const AnimatedRoutes = () => {
  const location = useLocation();
  const showLoginBtn = location.pathname === '/';

  return (
    <>
      <Header showLoginBtn={showLoginBtn} />
      
      <main className="w-full pb-32 lg:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/onboarding/role" element={<PageWrapper><OnboardingRole /></PageWrapper>} />
            
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

      <BottomNav />
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
