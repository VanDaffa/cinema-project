import React from 'react';
import { HiFunnel } from 'react-icons/hi2';

const EmptyResults = ({ typeLabel, onReset }) => (
  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 px-6 text-center flex flex-col items-center">
    <HiFunnel className="w-10 h-10 text-slate-500 mb-3" />
    <h2 className="text-xl font-bold text-white mb-1.5">{typeLabel} tidak ditemukan</h2>
    <p className="text-sm text-slate-400 max-w-md mb-5">
      Tidak ada hasil yang cocok dengan kata kunci atau filter yang dipilih.
    </p>
    <button
      type="button"
      onClick={onReset}
      className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
    >
      Tampilkan Daftar Populer
    </button>
  </div>
);

export default EmptyResults;
