import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const PageLoader = () => (
  <div className="min-h-screen bg-[#0f172a] flex flex-col">
    {/* Garis progres tipis di bagian paling atas layar */}
    <div className="fixed top-0 inset-x-0 h-0.5 bg-slate-800 z-50 overflow-hidden">
      <div className="h-full w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-top-progress" />
    </div>
  </div>
);

const PageTransition = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-page-enter">
      {children}
    </div>
  );
};

export default PageTransition;