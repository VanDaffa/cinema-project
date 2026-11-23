import React from 'react';
import { HiSparkles } from 'react-icons/hi2';

// Judul halaman, jumlah hasil, dan tombol "Pilihkan ... Acak"
const SearchHeader = ({
  pageHeading,
  loading,
  typeLabel,
  itemCount,
  totalResults,
  showRandomizer,
  isPickingRandom,
  onRandomize,
}) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <div className="flex items-center gap-3">
        <span className="w-1 h-7 bg-red-600 rounded-full" />
        <h1 className="text-2xl sm:text-3xl font-bold text-white">{pageHeading}</h1>
      </div>
      <p className="text-sm text-slate-400 mt-1.5 pl-4">
        {loading
          ? `Memuat daftar ${typeLabel.toLowerCase()}...`
          : `Menampilkan ${itemCount} dari ${totalResults.toLocaleString('id-ID')} hasil ditemukan`}
      </p>
    </div>

    {showRandomizer && (
      <button
        type="button"
        onClick={onRandomize}
        disabled={isPickingRandom}
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-red-600/20 transition-all self-start md:self-auto shrink-0"
      >
        <HiSparkles className={`w-4 h-4 ${isPickingRandom ? 'animate-spin' : ''}`} />
        <span>{isPickingRandom ? 'Mengacak...' : `Pilihkan ${typeLabel} Acak`}</span>
      </button>
    )}
  </div>
);

export default SearchHeader;
