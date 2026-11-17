import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from './services/tmdb';
import Navbar from './components/Navbar';

const ActorDetail = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      setLoading(true);
      try {
        const [personReq, moviesReq] = await Promise.all([
          axios.get(`/person/${id}?api_key=${API_KEY}&language=en-US`),
          axios.get(`/person/${id}/movie_credits?api_key=${API_KEY}&language=en-US`)
        ]);
        setPerson(personReq.data);
        // Sort by popularity and get top ones
        const sortedMovies = moviesReq.data.cast
          .filter(m => m.poster_path)
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10);
        setMovies(sortedMovies);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, API_KEY]);

  if (loading) return <div className="text-white text-center mt-32 text-2xl font-bold animate-pulse">Memuat Profil...</div>;
  if (!person) return <div className="text-white text-center mt-20">Artis tidak ditemukan.</div>;

  return (
    <div className="bg-[#0f172a] min-h-screen text-white pt-24 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-5">
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column: Photo & Personal Info */}
          <div className="w-full md:w-80 flex-shrink-0">
            <img 
              src={`https://image.tmdb.org/t/p/h632${person.profile_path}`} 
              alt={person.name}
              className="w-full rounded-2xl shadow-2xl border border-gray-700/50 mb-8 object-cover"
            />
            
            <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-red-500 mb-6 border-b border-gray-700 pb-2">Personal Info</h3>
              
              <div className="space-y-5 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Dikenal Sebagai</p>
                  <p className="font-semibold">{person.known_for_department}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Jenis Kelamin</p>
                  <p className="font-semibold">{person.gender === 1 ? 'Perempuan' : person.gender === 2 ? 'Laki-laki' : 'Lainnya'}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Tanggal Lahir</p>
                  <p className="font-semibold">{person.birthday || '-'}</p>
                </div>
                {person.deathday && (
                  <div>
                    <p className="text-gray-400 mb-1">Meninggal</p>
                    <p className="font-semibold">{person.deathday}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 mb-1">Tempat Lahir</p>
                  <p className="font-semibold">{person.place_of_birth || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Bio & Movies */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight">{person.name}</h1>
            
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-red-600 rounded"></div>
                <h2 className="text-2xl font-bold">Biografi</h2>
              </div>
              <div className="text-gray-300 text-base leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-600">
                {person.biography || "Tidak ada biografi tersedia."}
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-red-600 rounded"></div>
                <h2 className="text-2xl font-bold">Dikenal Atas</h2>
              </div>
              <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                {movies.map(movie => (
                  <Link to={`/movie/${movie.id}`} key={movie.id} className="min-w-[140px] md:min-w-[160px] relative group">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                      alt={movie.title}
                      className="w-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-3 pointer-events-none group-hover:scale-105 z-50">
                      <h3 className="text-xs font-bold text-white mb-1 line-clamp-2">{movie.title}</h3>
                      <p className="text-[10px] text-gray-400">sebagai {movie.character}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActorDetail;
