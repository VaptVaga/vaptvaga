import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: 'home', path: '/freelancer/dashboard', label: 'Início', activeIcon: true },
    { icon: 'search', path: '/search', label: 'Buscar' },
    { icon: 'work', path: '/applications', label: 'Vagas' },
    { icon: 'chat', path: '/chat', label: 'Chat' },
    { icon: 'person', path: '/profile', label: 'Perfil' },
  ];

  // Do not show BottomNav on Landing, Login, Onboarding or Desktop Views
  if (['/', '/login', '/pricing'].includes(path) || path.includes('/onboarding')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 mb-6 lg:hidden">
      <div className="bg-surface-container-lowest/90 backdrop-blur-xl floating pill rounded-full h-20 shadow-[0px_24px_48px_rgba(17,28,45,0.06)] flex justify-around items-center w-full px-4 border border-outline-variant/10">
        {navItems.map((item) => {
          const isActive = path === item.path || path.startsWith(item.path + '/');
          
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center transition-all duration-200",
                isActive 
                  ? "bg-primary text-white rounded-full w-12 h-12 active:scale-90" 
                  : "text-on-surface-variant hover:opacity-80 active:scale-95"
              )}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
