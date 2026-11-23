import React from 'react';
import Navbar from '../Navbar';

const DetailSkeleton = () => (
  <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
    <Navbar />
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-56 md:w-72 aspect-[2/3] bg-slate-800 rounded-2xl mx-auto md:mx-0 shrink-0" />
        <div className="flex-1 space-y-4 pt-4">
          <div className="h-10 bg-slate-800 rounded-xl w-3/4" />
          <div className="h-5 bg-slate-800 rounded w-1/2" />
          <div className="h-24 bg-slate-800 rounded-xl w-full" />
          <div className="flex gap-3 pt-2">
            <div className="h-11 w-36 bg-slate-800 rounded-full" />
            <div className="h-11 w-36 bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DetailSkeleton;
