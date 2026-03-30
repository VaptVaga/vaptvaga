import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';

interface HeaderProps {
  showLoginBtn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showLoginBtn = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isCompanyPage = location.pathname === '/empresas';

  const navLinks = [
    { label: 'Início', path: '/' },
    { label: 'Planos', path: '#planos', isAnchor: true },
    { 
      label: isCompanyPage ? 'Para Freelancers' : 'Para Empresas', 
      path: isCompanyPage ? '/' : '/empresas' 
    },
  ];

  const handleNavClick = (e: React.MouseEvent, path: string, isAnchor?: boolean) => {
    if (isAnchor) {
      e.preventDefault();
      // Find all elements with the ID 'planos' (since we have desktop/mobile versions)
      const elements = document.querySelectorAll('#planos');
      const visibleElement = Array.from(elements).find(el => (el as HTMLElement).offsetParent !== null) as HTMLElement | undefined;

      if (visibleElement) {
        visibleElement.scrollIntoView({ behavior: 'smooth' });
        // Update URL hash without reload
        window.history.pushState(null, '', path);
      } else {
        // If element not found (e.g., on another page), navigate to home with hash
        window.location.href = '/' + path;
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-surface/80 backdrop-blur-lg top-0 sticky z-50 flex justify-between items-center w-full px-6 h-16 shadow-sm border-b border-outline-variant/10">
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black text-primary tracking-tighter italic">VaptVaga</Link>
        <div className="flex items-center gap-2">
          {showLoginBtn && (
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

              <nav className="flex-1 p-6 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.isAnchor ? `/${link.path}` : link.path}
                    onClick={(e) => handleNavClick(e, link.path, link.isAnchor)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface font-bold transition-all active:scale-[0.98] group"
                  >
                    {link.label}
                    <ChevronRight className="w-5 h-5 text-outline-variant group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-outline-variant/10 space-y-4">
                <Link
                  to="/onboarding/role?type=company"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full bg-primary text-on-primary p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  Publicar Vaga
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Header */}
      <header className="hidden lg:block sticky top-0 z-50 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl font-black text-on-surface tracking-tight italic">VaptVaga</Link>
          <nav className="flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.isAnchor ? `/${link.path}` : link.path} 
                onClick={(e) => handleNavClick(e, link.path, link.isAnchor)}
                className="text-on-surface-variant font-bold hover:text-primary transition-all active:scale-95"
              >
                {link.label}
              </Link>
            ))}
            {showLoginBtn && (
              <Link to="/login" className="text-primary font-bold hover:opacity-80 transition-all active:scale-95">Entrar</Link>
            )}
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/onboarding/role?type=company" className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-bold shadow-lg shadow-primary/10 hover:translate-y-[-2px] active:scale-95 transition-all">
              Publicar Vaga
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};
