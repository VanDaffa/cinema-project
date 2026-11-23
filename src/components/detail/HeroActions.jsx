import React from 'react';
import { HiPlay, HiPlus, HiCheck, HiCheckCircle } from 'react-icons/hi2';

// Tombol aksi utama: Tonton Trailer, Watchlist, dan Tandai Selesai
const HeroActions = ({
  hasTrailer,
  journalStatus,
  isSaving,
  onToggleWatchlist,
  onMarkAsWatched,
}) => (
  <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
    {hasTrailer && (
      <a
        href="#video-player-section"
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-red-600/25 transition-colors"
      >
        <HiPlay className="w-5 h-5" />
        <span>Tonton Trailer</span>
      </a>
    )}

    <button
      type="button"
      onClick={onToggleWatchlist}
      disabled={isSaving}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-colors ${
        journalStatus === 'watchlist'
          ? 'bg-red-600/20 border-red-500/60 text-red-300 hover:bg-red-600/30'
          : 'bg-slate-800/85 border-slate-600 text-white hover:bg-slate-700'
      }`}
    >
      {journalStatus === 'watchlist' ? (
        <>
          <HiCheck className="w-5 h-5 text-red-400" />
          <span>Di Watchlist</span>
        </>
      ) : (
        <>
          <HiPlus className="w-5 h-5" />
          <span>Watchlist</span>
        </>
      )}
    </button>

    <button
      type="button"
      onClick={onMarkAsWatched}
      disabled={isSaving}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-colors ${
        journalStatus === 'watched'
          ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300 hover:bg-emerald-600/30'
          : 'bg-slate-800/85 border-slate-600 text-white hover:bg-slate-700'
      }`}
    >
      <HiCheckCircle
        className={`w-5 h-5 ${journalStatus === 'watched' ? 'text-emerald-400' : 'text-slate-400'}`}
      />
      <span>{journalStatus === 'watched' ? 'Sudah Ditonton' : 'Tandai Selesai'}</span>
    </button>
  </div>
);

export default HeroActions;
