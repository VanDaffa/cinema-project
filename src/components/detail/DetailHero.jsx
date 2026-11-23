import React from 'react';
import { HiStar } from 'react-icons/hi2';

// Bagian atas halaman: backdrop, poster, judul, info singkat, dan tombol aksi (children)
const DetailHero = ({ detail, mediaType, title, secondaryTitle, releaseYear, children }) => (
  <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
    {detail.backdrop_path && (
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${detail.backdrop_path})`,
        }}
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/90 to-[#0f172a]/70" />
    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row gap-8 lg:gap-10 items-center md:items-start">
      <img
        src={
          detail.poster_path
            ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
            : 'https://via.placeholder.com/500x750/1e293b/94a3b8?text=No+Poster'
        }
        alt={title}
        className="w-52 sm:w-60 lg:w-72 aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-slate-700/60 shrink-0"
      />

      <div className="flex-1 text-center md:text-left md:pt-3">
        <div className="inline-flex items-center gap-2 mb-2.5">
          <span
            className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
              mediaType === 'tv'
                ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {mediaType === 'tv' ? 'Serial TV' : 'Film Layar Lebar'}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-snug pb-2 tracking-tight">
          {title}
        </h1>
        {secondaryTitle && (
          <p className="text-base sm:text-lg text-slate-400 font-medium -mt-1 mb-2">
            {secondaryTitle}
          </p>
        )}

        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-1 mb-5 text-xs sm:text-sm text-slate-300 font-medium">
          <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-white font-semibold">
            {releaseYear}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-base">
            <HiStar className="w-4 h-4" />
            {detail.vote_average ? detail.vote_average.toFixed(1) : 'N/A'}
          </span>

          {mediaType === 'movie' && detail.runtime > 0 && (
            <>
              <span>•</span>
              <span>{detail.runtime} menit</span>
            </>
          )}

          {mediaType === 'tv' && detail.number_of_seasons > 0 && (
            <>
              <span>•</span>
              <span>
                {detail.number_of_seasons} Season ({detail.number_of_episodes} Episode)
              </span>
            </>
          )}

          {detail.genres?.length > 0 && (
            <>
              <span>•</span>
              <span className="text-slate-300">{detail.genres.map((g) => g.name).join(', ')}</span>
            </>
          )}
        </div>

        {detail.tagline && (
          <p className="italic text-slate-400 text-sm sm:text-base mb-6">"{detail.tagline}"</p>
        )}

        {children}
      </div>
    </div>
  </div>
);

export default DetailHero;
