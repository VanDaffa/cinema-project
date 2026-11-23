import React from 'react';
import { HiFilm, HiTv, HiUsers } from 'react-icons/hi2';

// Sakelar 3 kategori: Film | Serial TV | Pemeran
const MediaTypeSwitch = ({ mediaType, onSwitch }) => (
  <div className="inline-flex p-1 rounded-xl bg-slate-800 border border-slate-700 shrink-0 self-start">
    <button
      type="button"
      onClick={() => onSwitch('movie')}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
        mediaType === 'movie' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
      }`}
    >
      <HiFilm className="w-4 h-4" />
      <span>Film</span>
    </button>

    <button
      type="button"
      onClick={() => onSwitch('tv')}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
        mediaType === 'tv' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
      }`}
    >
      <HiTv className="w-4 h-4" />
      <span>Serial TV</span>
    </button>

    <button
      type="button"
      onClick={() => onSwitch('person')}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
        mediaType === 'person' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
      }`}
    >
      <HiUsers className="w-4 h-4" />
      <span>Pemeran</span>
    </button>
  </div>
);

export default MediaTypeSwitch;
