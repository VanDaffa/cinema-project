import React from 'react';
import SectionHeading from './SectionHeading';

// Daftar season khusus serial TV
const SeasonList = ({ seasons, fallbackPosterPath }) => (
  <section className="mb-12">
    <SectionHeading className="mb-5">Daftar Season</SectionHeading>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {seasons.map((season) => (
        <div
          key={season.id}
          className="flex gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 items-center"
        >
          <img
            src={
              season.poster_path
                ? `https://image.tmdb.org/t/p/w300${season.poster_path}`
                : fallbackPosterPath
                  ? `https://image.tmdb.org/t/p/w300${fallbackPosterPath}`
                  : 'https://via.placeholder.com/150x225/1e293b/94a3b8?text=Season'
            }
            alt={season.name}
            className="w-16 h-24 object-cover rounded-xl bg-slate-800 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-white truncate">{season.name}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {season.air_date ? season.air_date.slice(0, 4) : 'TBA'} •{' '}
              <span className="text-slate-200 font-semibold">{season.episode_count} Episode</span>
            </p>
            {season.overview && (
              <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                {season.overview}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default SeasonList;
