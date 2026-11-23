import React from 'react';
import { HiArrowPath } from 'react-icons/hi2';

// Filter genre, tahun, rating minimum, dan urutan (khusus film & serial TV)
const FilterBar = ({
  genres,
  selectedGenre,
  selectedYear,
  minRating,
  sortBy,
  sortDisabled,
  onGenreChange,
  onYearChange,
  onRatingChange,
  onSortChange,
  onReset,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center mt-4 pt-4 border-t border-slate-800/80">
      <select
        value={selectedGenre}
        onChange={(e) => onGenreChange(e.target.value)}
        className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500"
      >
        <option value="">Semua Genre</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>

      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500"
      >
        <option value="">Semua Tahun</option>
        {years.map((yr) => (
          <option key={yr} value={yr}>
            Tahun {yr}
          </option>
        ))}
      </select>

      <select
        value={minRating}
        onChange={(e) => onRatingChange(Number(e.target.value))}
        className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500"
      >
        <option value={0}>Semua Rating</option>
        <option value={6}>Rating ≥ 6.0</option>
        <option value={7}>Rating ≥ 7.0</option>
        <option value={8}>Rating ≥ 8.0</option>
      </select>

      <select
        value={sortBy}
        disabled={sortDisabled}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500 disabled:opacity-50"
      >
        <option value="popularity.desc">Paling Populer</option>
        <option value="vote_average.desc">Rating Tertinggi</option>
        <option value="primary_release_date.desc">Rilis Terbaru</option>
      </select>

      <button
        type="button"
        onClick={onReset}
        className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium py-2.5 px-4 rounded-xl border border-slate-700 transition-colors"
      >
        <HiArrowPath className="w-4 h-4" />
        <span>Reset Filter</span>
      </button>
    </div>
  );
};

export default FilterBar;
