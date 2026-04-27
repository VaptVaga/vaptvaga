import React from 'react';
import { SignupMobile } from './SignupMobile.tsx';
import { SignupDesktop } from './SignupDesktop.tsx';

export const Signup: React.FC = () => {
  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="block lg:hidden w-full">
        <SignupMobile />
      </div>
      
      {/* Desktop View */}
      <div className="hidden lg:block w-full">
        <SignupDesktop />
      </div>
    </div>
  );
};
