import React from 'react';
import { CompanyLandingMobile } from './CompanyLandingMobile.tsx';
import { CompanyLandingDesktop } from './CompanyLandingDesktop.tsx';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const CompanyLanding: React.FC = () => {
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
        <CompanyLandingMobile />
      </div>
      
      {/* Desktop View */}
      <div className="hidden lg:block w-full">
        <CompanyLandingDesktop />
      </div>
    </div>
  );
};
