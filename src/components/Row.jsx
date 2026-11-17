import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from '../services/tmdb';
import MovieCard from './MovieCard';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Row = ({ title, fetchUrl, isLargeRow = false, icon = null, genreId = '', mediaType = '' }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLeftEnd, setIsLeftEnd] = useState(true);
  const [isRightEnd, setIsRightEnd] = useState(false);

  const sliderRef = useRef(null);
  const resolvedMediaType =
    mediaType || (fetchUrl?.includes('/tv') ? 'tv' : fetchUrl?.includes('/movie') ? 'movie' : '');

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const request = await axios.get(fetchUrl);
        const filtered = (request.data.results || []).filter((m) => m.poster_path);
        if (isMounted) {
          setMovies(filtered);
        }
      } catch (error) {
        console.error(`Gagal memuat baris "${title}":`, error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [fetchUrl, title]);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setIsLeftEnd(scrollLeft <= 2);
    setIsRightEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2);
  };

  useEffect(() => {
    handleScroll();
  }, [movies]);

  const slideLeft = () => {
    if (!sliderRef.current) return;
    const distance = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({ left: -distance, behavior: 'smooth' });
  };

  const slideRight = () => {
    if (!sliderRef.current) return;
    const distance = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const resolvedGenreId =
    genreId ||
    (() => {
      const match = fetchUrl?.match(/with_genres=(\d+)/);
      return match ? match[1] : '';
    })();

  const searchParams = new URLSearchParams();
  if (resolvedMediaType) searchParams.set('type', resolvedMediaType);
  if (resolvedGenreId) searchParams.set('genre', resolvedGenreId);
  if (title) searchParams.set('title', title);
  const exploreLink = `/search?${searchParams.toString()}`;

  const cardWidthClass = isLargeRow
    ? 'w-44 sm:w-48 md:w-52 shrink-0'
    : 'w-36 sm:w-40 md:w-44 shrink-0';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="w-1 h-6 bg-red-600 rounded-full shrink-0" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            <span>{title}</span>
          </h2>
        </div>

        <Link
          to={exploreLink}
          className="text-xs sm:text-sm font-medium text-slate-400 hover:text-red-400 transition-colors shrink-0"
        >
          Lihat Semua &gt;
        </Link>
      </div>

      <div className="relative flex items-center">
        {!isLeftEnd && movies.length > 0 && (
          <button
            type="button"
            onClick={slideLeft}
            aria-label="Geser ke kiri"
            className="absolute -left-3 sm:-left-4 z-30 bg-slate-900/90 hover:bg-red-600 text-white p-2 rounded-full border border-slate-700 shadow-lg backdrop-blur-sm transition-colors"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-hide py-2 w-full"
        >
          {loading
            ? Array.from({ length: 7 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`${cardWidthClass} aspect-[2/3] rounded-xl bg-slate-800/80 animate-pulse`}
                />
              ))
            : movies.map((movie) => (
                <div key={movie.id} className={cardWidthClass}>
                  <MovieCard movie={movie} mediaTypeOverride={resolvedMediaType} />
                </div>
              ))}
        </div>

        {!isRightEnd && movies.length > 0 && (
          <button
            type="button"
            onClick={slideRight}
            aria-label="Geser ke kanan"
            className="absolute -right-3 sm:-right-4 z-30 bg-slate-900/90 hover:bg-red-600 text-white p-2 rounded-full border border-slate-700 shadow-lg backdrop-blur-sm transition-colors"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default Row;