import { Home, Briefcase, ClipboardCheck, Calendar, MessageSquare, PlusCircle, LayoutDashboard } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  const isCompany = profile?.role === 'company';

  const navItems = isCompany
    ? [
        { icon: LayoutDashboard, label: 'Painel', path: '/company/dashboard' },
        { icon: Briefcase, label: 'Vagas', path: '/company/vagas' },
        { icon: PlusCircle, label: 'Publicar', path: '/post-job', isCenterAction: true },
        { icon: Calendar, label: 'Agenda', path: '/company/agenda' },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
      ]
    : [
        { icon: Home, label: 'Início', path: '/freelancer/inicio' },
        { icon: Briefcase, label: 'Vagas', path: '/freelancer/vagas' },
        { icon: Calendar, label: 'Agenda', path: '/freelancer/agenda' },
        { icon: ClipboardCheck, label: 'Aplicações', path: '/freelancer/candidaturas' },
        { icon: MessageSquare, label: 'Chat', path: '/chat' },
      ];

  return (
    <nav
      aria-label="Navegação móvel"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/80 bg-surface/95 backdrop-blur-xl px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_rgba(10,19,43,0.06)]"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/freelancer/dashboard' && location.pathname === '/freelancer/ganhos') ||
            (item.path !== '/profile' &&
              item.path !== '/post-job' &&
              item.path !== '/chat' &&
              location.pathname.startsWith(item.path));

          if ('isCenterAction' in item && item.isCenterAction) {
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-4 px-2 py-1"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark text-on-primary shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-surface">
                  <item.icon size={22} strokeWidth={2.4} />
                </div>
                <span className="text-[10px] font-headline font-bold text-primary mt-0.5 leading-tight">
                  {item.label}
                </span>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(item.path)}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-headline font-bold transition-all relative ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className="relative">
                <item.icon size={21} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-primary"
                  />
                )}
              </div>
              <span className="leading-tight">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
