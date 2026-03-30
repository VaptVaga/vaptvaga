import React from 'react';
import { LoginMobile } from './LoginMobile.tsx';
import { LoginDesktop } from './LoginDesktop.tsx';

export const Login: React.FC = () => {
  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="block lg:hidden w-full">
        <LoginMobile />
      </div>
      
      {/* Desktop View */}
      <div className="hidden lg:block w-full">
        <LoginDesktop />
      </div>
    </div>
  );
};
