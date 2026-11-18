import React from 'react';
import { FreelancerInicioMobile } from './FreelancerInicioMobile';
import { FreelancerInicioDesktop } from './FreelancerInicioDesktop';

export const FreelancerInicio: React.FC = () => {
  return (
    <div className="w-full">
      {/* Mobile View */}
      <div className="block lg:hidden w-full">
        <FreelancerInicioMobile />
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block w-full">
        <FreelancerInicioDesktop />
      </div>
    </div>
  );
};

export default FreelancerInicio;
