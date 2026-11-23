import React from 'react';

const CatalogSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
    {Array.from({ length: 10 }).map((_, idx) => (
      <div key={idx} className="aspect-[2/3] rounded-xl bg-slate-800/80 animate-pulse" />
    ))}
  </div>
);

export default CatalogSkeleton;
