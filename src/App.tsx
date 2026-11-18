import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Layout
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AppShell } from './components/layout/AppShell';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { getCachedProfile } from './lib/profileCache';

// Public Pages
import { FreelancerLanding } from './pages/FreelancerLanding';
import { CompanyLanding } from './pages/CompanyLanding';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import Pricing from './pages/Pricing';
import { FAQ } from './pages/FAQ';
import { Contact } from './pages/Contact';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';

// Onboarding Pages
import { FreelancerOnboarding } from './pages/FreelancerOnboarding';
import Onboarding from './pages/Onboarding';

// Internal App Pages
import Profile from './pages/Profile';
import FreelancerInicio from './pages/FreelancerInicio';
import FreelancerFeed from './pages/FreelancerFeed';
import FreelancerApplications from './pages/FreelancerApplications';
import Financial from './pages/Financial';
import CompanyDashboard from './pages/CompanyDashboard';
import PostJob from './pages/PostJob';
import Chat from './pages/Chat';
import Schedule from './pages/Schedule';
import { Toaster } from '@/components/ui/toaster';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    const effectiveProfile = profile || getCachedProfile(user.id);
    if (effectiveProfile?.role === 'company') {
      return <Navigate to="/company/dashboard" replace />;
    }
    const isProfileComplete = Boolean(
      (effectiveProfile?.skills && effectiveProfile.skills.length > 0) ||
        effectiveProfile?.cidade
    );
    return (
      <Navigate
        to={isProfileComplete ? '/freelancer/inicio' : '/freelancer/onboarding'}
        replace
      />
    );
  }

  return <FreelancerLanding />;
};

const DashboardRedirect: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (profile?.role === 'company') {
    return <Navigate to="/company/dashboard" replace />;
  }
  return <Navigate to="/freelancer/inicio" replace />;
};

const PUBLIC_ROUTES = [
  '/',
  '/empresas',
  '/planos',
  '/faq',
  '/contato',
  '/termos',
  '/privacidade',
  '/login',
];

const AnimatedRoutes = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  const publicMainPadding =
    location.pathname === '/'
      ? 'pt-14 pb-0'
      : location.pathname === '/empresas'
        ? 'pt-8 pb-0'
        : isPublicRoute
          ? 'pt-[72px] pb-10 lg:pb-0'
          : '';

  return (
    <>
      {isPublicRoute && <Header />}

      <main className={`w-full ${publicMainPadding}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<PageWrapper><HomeRedirect /></PageWrapper>} />
            <Route path="/empresas" element={<PageWrapper><CompanyLanding /></PageWrapper>} />
            <Route path="/planos" element={<PageWrapper><Pricing /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/cadastro" element={<PageWrapper><Signup /></PageWrapper>} />
            <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
            <Route path="/contato" element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/termos" element={<PageWrapper><TermsOfService /></PageWrapper>} />
            <Route path="/privacidade" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />

            {/* Onboarding Flows */}
            <Route path="/freelancer/onboarding" element={<PageWrapper><FreelancerOnboarding /></PageWrapper>} />
            <Route path="/onboarding" element={<PageWrapper><Onboarding /></PageWrapper>} />

            {/* Freelancer Internal App Routes */}
            <Route
              path="/freelancer/inicio"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <AppShell>
                    <PageWrapper><FreelancerInicio /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/vagas"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <AppShell>
                    <PageWrapper><FreelancerFeed /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/candidaturas"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <AppShell>
                    <PageWrapper><FreelancerApplications /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/dashboard"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <AppShell>
                    <PageWrapper><Financial /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/ganhos"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <AppShell>
                    <PageWrapper><Financial /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/financeiro"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <AppShell>
                    <PageWrapper><Financial /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/freelancer/agenda"
              element={
                <ProtectedRoute allowedRole="freelancer">
                  <AppShell>
                    <PageWrapper><Schedule /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Company Internal App Routes */}
            <Route
              path="/company/dashboard"
              element={
                <ProtectedRoute allowedRole="company">
                  <AppShell>
                    <PageWrapper><CompanyDashboard /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/vagas"
              element={
                <ProtectedRoute allowedRole="company">
                  <AppShell>
                    <PageWrapper><CompanyDashboard /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/candidatos"
              element={
                <ProtectedRoute allowedRole="company">
                  <AppShell>
                    <PageWrapper><CompanyDashboard /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/agenda"
              element={
                <ProtectedRoute allowedRole="company">
                  <AppShell>
                    <PageWrapper><Schedule /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/company/financeiro"
              element={
                <ProtectedRoute allowedRole="company">
                  <AppShell>
                    <PageWrapper><Financial /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute allowedRole="company">
                  <AppShell>
                    <PageWrapper><PostJob /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Shared Internal App Routes */}
            <Route
              path="/financeiro"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PageWrapper><Financial /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PageWrapper><Schedule /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PageWrapper><Chat /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <PageWrapper><Profile /></PageWrapper>
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Route Aliases */}
            <Route path="/vagas" element={<Navigate to="/freelancer/vagas" replace />} />
            <Route path="/jobs" element={<Navigate to="/freelancer/vagas" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      {isPublicRoute && !user && <Footer />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
