import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from './services/tmdb';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { FaPlay, FaPlus, FaCheck } from 'react-icons/fa';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    window.scrollTo(0, 0);
    async function fetchData() {
      setLoading(true);
      try {
        const [movieReq, creditsReq, recReq, videosReq] = await Promise.all([
          axios.get(`/movie/${id}?api_key=${API_KEY}&language=en-US`),
          axios.get(`/movie/${id}/credits?api_key=${API_KEY}&language=en-US`),
          axios.get(`/movie/${id}/recommendations?api_key=${API_KEY}&language=en-US`),
          axios.get(`/movie/${id}/videos?api_key=${API_KEY}&language=en-US`)
        ]);

        setMovie(movieReq.data);
        setCast(creditsReq.data.cast.slice(0, 10));
        setRecommendations(recReq.data.results.slice(0, 12));
        
        const trailerVid = videosReq.data.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube');
        setTrailer(trailerVid ? trailerVid.key : null);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, API_KEY]);

  useEffect(() => {
    async function checkWatchlist() {
      if (user && movie) {
        const docRef = doc(db, 'users', user.uid, 'watchlist', movie.id.toString());
        const docSnap = await getDoc(docRef);
        setInWatchlist(docSnap.exists());
      }
    }
    checkWatchlist();
  }, [user, movie]);

  const toggleWatchlist = async () => {
    if (!user) return alert("Silakan Login terlebih dahulu!");
    
    const docRef = doc(db, 'users', user.uid, 'watchlist', movie.id.toString());
    if (inWatchlist) {
      await deleteDoc(docRef);
      setInWatchlist(false);
    } else {
      await setDoc(docRef, {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        addedAt: new Date()
      });
      setInWatchlist(true);
    }
  };

  if (loading) return <div className="text-white text-center mt-32 text-2xl font-bold tracking-widest animate-pulse">Memuat Data Film...</div>;
  if (!movie) return <div className="text-white text-center mt-20">Film tidak ditemukan.</div>;

  return (
    <div className="bg-[#0f172a] min-h-screen text-white pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="h-[80vh] relative bg-cover bg-center flex items-center pt-20"
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`}}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-[#0f172a]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-5 w-full relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title} 
            className="w-56 md:w-72 rounded-xl shadow-2xl border border-gray-700/50"
          />
          <div className="flex-1 mt-4 md:mt-10 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-3 tracking-tight">{movie.title}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center mb-6 text-sm text-gray-300 font-semibold">
              <span className="bg-gray-800 px-3 py-1 rounded-md">{movie.release_date?.substring(0, 4)}</span>
              <span className="text-yellow-500 text-lg">⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>•</span>
              <span>{movie.runtime} min</span>
              <span>•</span>
              <span className="text-gray-400">{movie.genres?.map(g => g.name).join(', ')}</span>
            </div>
            
            <p className="italic text-gray-400 mb-6 font-light">"{movie.tagline}"</p>
            
            <div className="flex justify-center md:justify-start gap-4 mb-8">
              <button 
                onClick={toggleWatchlist}
                className="flex items-center gap-2 border border-gray-500 hover:border-white px-6 py-2.5 rounded-full font-bold transition-all bg-gray-900/50 hover:bg-gray-800"
              >
                {inWatchlist ? <FaCheck className="text-green-500" /> : <FaPlus />} 
                {inWatchlist ? "Di Watchlist" : "Watchlist"}
              </button>
              
              {trailer && (
                <a 
                  href={`#trailer-section`}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-2.5 rounded-full font-bold shadow-lg shadow-red-600/30 transition-all"
                >
                  <FaPlay /> Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-5 relative z-20 -mt-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Left Column */}
          <div className="flex-1">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-6 bg-red-600 rounded"></div>
                <h2 className="text-2xl font-bold">Storyline</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
            </div>
            
            {trailer && (
              <div id="trailer-section" className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-red-600 rounded"></div>
                  <h2 className="text-2xl font-bold">Official Trailer</h2>
                </div>
                <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border border-gray-800">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${trailer}`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
              </div>
            )}
            
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-red-600 rounded"></div>
                <h2 className="text-2xl font-bold">Top Cast</h2>
              </div>
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide snap-x">
                {cast.map(actor => (
                  <Link to={`/actor/${actor.id}`} key={actor.id} className="min-w-[100px] text-center snap-start group cursor-pointer">
                    <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-transparent group-hover:border-red-500 transition-colors shadow-lg">
                      {actor.profile_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                          alt={actor.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center font-bold text-gray-500">?</div>
                      )}
                    </div>
                    <p className="text-sm font-bold group-hover:text-red-400 transition-colors">{actor.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{actor.character}</p>
                  </Link>
                ))}
              </div>
            </div>
            
          </div>
          
          {/* Right Column (Info Sidebar) */}
          <div className="w-full lg:w-80">
            <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700/50 shadow-xl">
              <h3 className="text-xl font-bold text-red-500 mb-6 border-b border-gray-700 pb-2">Info Film</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Status</span>
                  <span className="font-semibold text-right">{movie.status}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Bahasa</span>
                  <span className="font-semibold uppercase text-right">{movie.original_language}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Budget</span>
                  <span className="font-semibold text-right">${movie.budget?.toLocaleString() || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Revenue</span>
                  <span className="font-semibold text-right">${movie.revenue?.toLocaleString() || '-'}</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <span className="text-gray-400">Produksi</span>
                  <span className="font-semibold text-right leading-relaxed">
                    {movie.production_companies?.map(c => c.name).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-10 border-t border-gray-800 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-red-600 rounded"></div>
              <h2 className="text-2xl font-bold">Mungkin Kamu Suka</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendations.map(rec => rec.poster_path && (
                <Link to={`/movie/${rec.id}`} key={rec.id} className="relative group">
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${rec.poster_path}`} 
                    alt={rec.title}
                    className="w-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col justify-end p-3 pointer-events-none group-hover:scale-105 z-50">
                    <h3 className="text-xs font-bold text-white mb-1 line-clamp-2">{rec.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default MovieDetail;
