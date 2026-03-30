import React from 'react';
import { OnboardingRoleMobile } from './OnboardingRoleMobile.tsx';
import { OnboardingRoleDesktop } from './OnboardingRoleDesktop.tsx';

export const OnboardingRole: React.FC = () => {
  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="block lg:hidden w-full">
        <OnboardingRoleMobile />
      </div>
      
      {/* Desktop View */}
      <div className="hidden lg:block w-full">
        <OnboardingRoleDesktop />
      </div>
    </div>
  );
};
