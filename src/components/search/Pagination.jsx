import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ page, totalPages, onPrev, onNext }) => (
  <div className="mt-12 flex items-center justify-center gap-4">
    <button
      type="button"
      disabled={page <= 1}
      onClick={onPrev}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-sm font-medium border border-slate-700 transition-colors"
    >
      <HiChevronLeft className="w-4 h-4" />
      <span>Sebelumnya</span>
    </button>

    <span className="text-sm text-slate-300 font-medium px-2">
      Halaman <span className="text-white font-bold">{page}</span> dari{' '}
      <span className="text-white font-bold">{totalPages}</span>
    </span>

    <button
      type="button"
      disabled={page >= totalPages}
      onClick={onNext}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-sm font-medium border border-slate-700 transition-colors"
    >
      <span>Berikutnya</span>
      <HiChevronRight className="w-4 h-4" />
    </button>
  </div>
);

export default Pagination;
