import React from 'react';
import { HiSparkles, HiXMark, HiStar, HiArrowPath, HiInformationCircle } from 'react-icons/hi2';
import { getDisplayTitle } from '../../utils/title';

// Jendela spotlight hasil "Pilihkan ... Acak"
const RandomPickModal = ({ pick, isPicking, onClose, onRandomizeAgain, onViewDetail }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
          <HiSparkles className="w-4 h-4" />
          <span>Rekomendasi Acak Untukmu</span>
        </span>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <HiXMark className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        <img
          src={`https://image.tmdb.org/t/p/w500${pick.poster_path}`}
          alt={getDisplayTitle(pick)}
          className="w-36 aspect-[2/3] object-cover rounded-xl shadow-lg border border-slate-700 shrink-0"
        />
        <div className="flex-1 text-center sm:text-left min-w-0">
          <h3 className="text-xl font-bold text-white leading-snug">{getDisplayTitle(pick)}</h3>
          <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-300 mt-1.5 mb-3">
            <span>{(pick.release_date || pick.first_air_date || 'TBA').slice(0, 4)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
              <HiStar className="w-3.5 h-3.5" />
              {pick.vote_average ? pick.vote_average.toFixed(1) : 'N/A'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-4 leading-relaxed">
            {pick.overview || 'Sinopsis belum tersedia.'}
          </p>
        </div>
      </div>

      <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onRandomizeAgain}
          disabled={isPicking}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          <HiArrowPath className={`w-4 h-4 ${isPicking ? 'animate-spin' : ''}`} />
          <span>Acak Lagi</span>
        </button>
        <button
          type="button"
          onClick={onViewDetail}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-semibold text-white transition-colors"
        >
          <HiInformationCircle className="w-4 h-4" />
          <span>Lihat Detail</span>
        </button>
      </div>
    </div>
  </div>
);

export default RandomPickModal;
