import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, User, LogOut, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser, user, signOut } = useAuth();
  const isCompanyPage = location.pathname === '/empresas';
  const isLoggedIn = !!authUser;

  // Public nav links (for non-logged-in users)
  const publicNavLinks = [
    { label: 'Início', path: '/' },
    { label: 'Planos', path: '#planos', isAnchor: true },
    { 
      label: isCompanyPage ? 'Para Freelancers' : 'Para Empresas', 
      path: isCompanyPage ? '/' : '/empresas' 
    },
  ];

  // Logged-in nav links
  const authNavLinks = [
    { label: 'Dashboard', path: user?.role === 'company' ? '/company/dashboard' : '/freelancer/dashboard', icon: LayoutDashboard },
    { label: 'Mensagens', path: '/chat', icon: MessageSquare },
    { label: 'Perfil', path: '/profile', icon: User },
  ];

  const navLinks = isLoggedIn ? authNavLinks : publicNavLinks;

  const handleNavClick = (e: React.MouseEvent, path: string, isAnchor?: boolean) => {
    if (isAnchor) {
      e.preventDefault();
      const targetId = path.split('#')[1];
      if (targetId) {
        const element = document.getElementById(targetId);
        if (element && (location.pathname === '/' || location.pathname === '/empresas')) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState(null, '', `/#${targetId}`);
        } else {
          window.location.href = `/#${targetId}`;
        }
      }
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-surface/80 backdrop-blur-lg top-0 sticky z-50 flex justify-between items-center w-full px-6 h-16 shadow-sm border-b border-outline-variant/10">
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-primary tracking-tighter italic">VaptVaga</Link>
        <div className="flex items-center gap-2">
          {!isLoggedIn && (
            <Link to="/login" className="text-primary font-bold px-4 py-2 hover:bg-primary/5 transition-colors rounded-full active:scale-95 duration-100">
              Entrar
            </Link>
          )}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:scale-90"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[51] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-surface z-[52] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-outline-variant/10">
                <span className="text-xl font-bold text-on-surface">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full hover:bg-surface-container active:scale-90 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User info for logged-in users */}
              {isLoggedIn && user && (
                <div className="p-6 border-b border-outline-variant/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
                    {user.imgUrl ? (
                      <img src={user.imgUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{user.name}</span>
                    <span className="text-xs text-on-surface-variant capitalize">{user.role}</span>
                  </div>
                </div>
              )}

              <nav className="flex-1 p-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={'isAnchor' in link && link.isAnchor ? `/${link.path}` : link.path}
                    onClick={(e) => handleNavClick(e, link.path, 'isAnchor' in link ? link.isAnchor : false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface font-bold transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center gap-3">
                      {'icon' in link && link.icon && <link.icon className="w-5 h-5 text-on-surface-variant" />}
                      {link.label}
                    </div>
                    <ChevronRight className="w-5 h-5 text-outline-variant group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-outline-variant/10 space-y-4">
                {isLoggedIn ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-surface-container-low hover:bg-destructive/10 text-on-surface font-bold transition-all active:scale-95"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair
                  </button>
                ) : (
                  <Link
                    to={isCompanyPage ? "/onboarding/role?type=company" : "/onboarding/role?type=freelancer"}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full bg-primary text-on-primary p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    {isCompanyPage ? 'Publicar Vaga' : 'Encontrar Vaga'}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-on-surface tracking-tight italic">VaptVaga</Link>
          
          <nav className="flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={'isAnchor' in link && link.isAnchor ? `/${link.path}` : link.path} 
                onClick={(e) => handleNavClick(e, link.path, 'isAnchor' in link ? link.isAnchor : false)}
                className="text-on-surface-variant font-bold hover:text-primary transition-all active:scale-95 flex items-center gap-2"
              >
                {'icon' in link && link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
                    {user?.imgUrl ? (
                      <img src={user.imgUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-on-surface-variant" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-on-surface">{user?.name?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full hover:bg-destructive/10 text-on-surface-variant hover:text-destructive transition-all"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-primary font-bold hover:opacity-80 transition-all active:scale-95">Entrar</Link>
                <Link to={isCompanyPage ? "/onboarding/role?type=company" : "/onboarding/role?type=freelancer"} className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/10 hover:translate-y-[-2px] active:scale-95 transition-all">
                  {isCompanyPage ? 'Publicar Vaga' : 'Encontrar Vaga'}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
