import React, { useState, useEffect } from 'react';
import axios from '../services/tmdb';
import { Link } from 'react-router-dom';

const Row = ({ title, fetchUrl, isLargeRow = false, icon = null }) => {
  const [movies, setMovies] = useState([]);
  const base_url = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    async function fetchData() {
      const request = await axios.get(fetchUrl);
      setMovies(request.data.results);
      return request;
    }
    fetchData();
  }, [fetchUrl]);

  return (
    <div className="ml-5 md:ml-10 text-white mt-8 relative z-30">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-red-600 rounded"></div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          {title}
        </h2>
        <span className="ml-auto mr-8 text-xs text-gray-400 hover:text-white cursor-pointer transition-colors hidden md:block">
          Lihat Semua &gt;
        </span>
      </div>
      
      <div className="flex overflow-y-hidden overflow-x-scroll py-4 scrollbar-hide space-x-4 pl-2">
        {movies.map(
          (movie) =>
            movie.poster_path && (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="min-w-fit relative group">
                <img
                  className={`object-cover transition-transform duration-300 group-hover:scale-105 group-hover:z-50 cursor-pointer rounded-lg shadow-lg ${
                    isLargeRow ? 'w-48 md:w-56 h-auto' : 'w-36 md:w-44 h-auto'
                  }`}
                  src={`${base_url}${movie.poster_path}`}
                  alt={movie.name || movie.title}
                />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-3 pointer-events-none group-hover:scale-105 z-50">
                  <h3 className="text-sm md:text-base font-bold text-white mb-1 line-clamp-2">
                    {movie.title || movie.name}
                  </h3>
                  <div className="flex gap-2 text-xs text-red-400 font-semibold">
                    <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                    <span>{movie.release_date?.substring(0,4)}</span>
                  </div>
                </div>
              </Link>
            )
        )}
      </div>
    </div>
  );
};

export default Row;
