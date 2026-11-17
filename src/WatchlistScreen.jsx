import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Navbar from './components/Navbar';

const WatchlistScreen = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    async function fetchWatchlist() {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'watchlist'), 
          orderBy('addedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const movies = [];
        querySnapshot.forEach((doc) => {
          movies.push(doc.data());
        });
        setWatchlist(movies);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }

    fetchWatchlist();
  }, [user, navigate]);

  if (loading) return <div className="text-white text-center mt-32 text-2xl font-bold animate-pulse">Memuat Watchlist...</div>;

  return (
    <div className="bg-[#0f172a] min-h-screen text-white pt-24 pb-10">
      <Navbar />
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
          <div className="w-1.5 h-8 bg-red-600 rounded"></div>
          <h1 className="text-3xl font-bold">Watchlist Saya</h1>
        </div>
        
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlist.map(movie => movie.poster_path && (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="relative group">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title}
                  className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 object-cover border border-gray-800"
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
          <div className="text-center mt-32 flex flex-col items-center bg-[#1e293b] p-10 rounded-2xl max-w-lg mx-auto shadow-2xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Watchlist Masih Kosong</h2>
            <p className="text-gray-500 mb-8">Anda belum menambahkan film apapun ke daftar tontonan Anda.</p>
            <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg shadow-red-600/30">
              Jelajahi Film
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistScreen;
