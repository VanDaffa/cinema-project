import React from 'react';

// Judul bagian dengan garis aksen merah di kiri
const SectionHeading = ({ children, className = 'mb-4' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <span className="w-1 h-6 bg-red-600 rounded-full" />
    <h2 className="text-xl sm:text-2xl font-bold">{children}</h2>
  </div>
);

export default SectionHeading;
