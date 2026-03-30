import React from 'react';
import { LandingMobile } from './LandingMobile.tsx';
import { LandingDesktop } from './LandingDesktop.tsx';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const Landing: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#planos') {
      const scrollToPlanos = () => {
        const elements = document.querySelectorAll('#planos');
        const visibleElement = Array.from(elements).find(el => (el as HTMLElement).offsetParent !== null);
        if (visibleElement) {
          visibleElement.scrollIntoView({ behavior: 'smooth' });
        }
      };

      // Small timeout to ensure components are rendered
      const timer = setTimeout(scrollToPlanos, 100);
      return () => clearTimeout(timer);
    }
  }, [hash]);
  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="block lg:hidden w-full">
        <LandingMobile />
      </div>
      
      {/* Desktop View */}
      <div className="hidden lg:block w-full">
        <LandingDesktop />
      </div>
    </div>
  );
};
