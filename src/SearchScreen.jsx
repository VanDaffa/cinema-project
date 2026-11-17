import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from './services/tmdb';
import Navbar from './components/Navbar';

const SearchScreen = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    if (query) {
      setLoading(true);
      axios.get(`/search/movie?api_key=${API_KEY}&query=${query}&language=en-US`)
        .then(res => {
          setMovies(res.data.results);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [query, API_KEY]);

  return (
    <div className="bg-[#0f172a] min-h-screen text-white pt-24 pb-10">
      <Navbar />
      <div className="max-w-7xl mx-auto px-5">
        <h1 className="text-2xl font-bold mb-6">
          Hasil pencarian untuk: <span className="text-red-500">"{query}"</span>
        </h1>
        
        {loading ? (
          <p className="text-center text-gray-400 mt-20">Mencari...</p>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map(movie => movie.poster_path && (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="relative group">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 object-cover"
                />
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-3 pointer-events-none group-hover:scale-105 z-50">
                  <h3 className="text-sm font-bold text-white mb-1 line-clamp-2">
                    {movie.title}
                  </h3>
                  <div className="flex gap-2 text-xs text-red-400 font-semibold">
                    <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center mt-20 text-gray-400 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-2">Film tidak ditemukan</h2>
            <p>Coba gunakan kata kunci lain untuk mencari film kesukaanmu.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
