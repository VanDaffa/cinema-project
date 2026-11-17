import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { HiStar, HiHeart, HiOutlineHeart, HiCheckCircle } from 'react-icons/hi2';

const MovieCard = ({ movie, mediaTypeOverride = '', className = '', onWatchlistChange = null }) => {
  const { user } = useAuth();
  const [savedStatus, setSavedStatus] = useState(null); // null | 'watchlist' | 'watched'
  const [isSaving, setIsSaving] = useState(false);

  const mediaType =
    mediaTypeOverride ||
    movie?.media_type ||
    (movie?.first_air_date && !movie?.release_date ? 'tv' : 'movie');

  const title = movie?.title || movie?.name || 'Untitled';
  const releaseDate = movie?.release_date || movie?.first_air_date || '';
  const year = releaseDate ? releaseDate.split('-')[0] : 'TBA';
  const rating = movie?.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const detailPath = mediaType === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;
  const docKey = `${mediaType}_${movie.id}`;

  useEffect(() => {
    let isMounted = true;

    const checkWatchlistStatus = async () => {
      if (!user || !movie?.id) {
        if (isMounted) setSavedStatus(null);
        return;
      }
      try {
        // Cek format ID baru (movie_123 / tv_123) terlebih dahulu
        const typedRef = doc(db, 'users', user.uid, 'watchlist', docKey);
        const typedSnap = await getDoc(typedRef);

        if (typedSnap.exists()) {
          if (isMounted) setSavedStatus(typedSnap.data()?.status || 'watchlist');
          return;
        }

        // Fallback untuk data lama yang masih memakai ID numerik saja
        if (mediaType === 'movie') {
          const legacyRef = doc(db, 'users', user.uid, 'watchlist', String(movie.id));
          const legacySnap = await getDoc(legacyRef);
          if (legacySnap.exists() && isMounted) {
            setSavedStatus(legacySnap.data()?.status || 'watchlist');
            return;
          }
        }

        if (isMounted) setSavedStatus(null);
      } catch (error) {
        console.error('Gagal memeriksa status watchlist:', error);
      }
    };

    checkWatchlistStatus();
    return () => {
      isMounted = false;
    };
  }, [user, movie?.id, docKey, mediaType]);

  const handleToggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk menyimpan tayangan.');
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    const typedRef = doc(db, 'users', user.uid, 'watchlist', docKey);
    const legacyRef = doc(db, 'users', user.uid, 'watchlist', String(movie.id));

    try {
      if (savedStatus) {
        await Promise.all([
          deleteDoc(typedRef),
          mediaType === 'movie' ? deleteDoc(legacyRef) : Promise.resolve(),
        ]);
        setSavedStatus(null);
        toast.success(`"${title}" dihapus dari koleksi.`);
        if (onWatchlistChange) onWatchlistChange(movie.id, mediaType, null);
      } else {
        await setDoc(typedRef, {
          id: movie.id,
          media_type: mediaType,
          title,
          poster_path: movie.poster_path || null,
          release_date: releaseDate,
          vote_average: movie.vote_average || 0,
          status: 'watchlist',
          userRating: 0,
          review: '',
          addedAt: new Date().toISOString(),
        });
        setSavedStatus('watchlist');
        toast.success(`"${title}" ditambahkan ke Watchlist.`);
        if (onWatchlistChange) onWatchlistChange(movie.id, mediaType, 'watchlist');
      }
    } catch (error) {
      console.error('Gagal memperbarui watchlist:', error);
      toast.error('Terjadi kesalahan saat memperbarui koleksi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Link
      to={detailPath}
      className={`group relative block rounded-xl overflow-hidden bg-slate-800/80 border border-slate-800 hover:border-slate-600 shadow-md transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-slate-900 relative">
        <img
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/500x750/1e293b/94a3b8?text=No+Poster'
          }
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge Rating & Tipe Tayangan di Kiri Atas */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm border border-slate-700/70 px-2 py-0.5 rounded-md text-xs font-semibold text-amber-400">
            <HiStar className="w-3.5 h-3.5 shrink-0" />
            <span>{rating}</span>
          </div>
          {mediaType === 'tv' && (
            <span className="bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md">
              TV
            </span>
          )}
        </div>

        {/* Tombol Simpan / Indikator Sudah Ditonton di Kanan Atas */}
        <button
          type="button"
          onClick={handleToggleWatchlist}
          disabled={isSaving}
          title={
            savedStatus === 'watched'
              ? 'Sudah Ditonton (Klik untuk hapus dari koleksi)'
              : savedStatus === 'watchlist'
              ? 'Hapus dari Watchlist'
              : 'Simpan ke Watchlist'
          }
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-sm border transition-all duration-200 z-10 ${
            savedStatus === 'watched'
              ? 'bg-emerald-600/90 border-emerald-500 text-white'
              : savedStatus === 'watchlist'
              ? 'bg-red-600/90 border-red-500 text-white'
              : 'bg-slate-950/75 border-slate-700/70 text-slate-200 hover:bg-red-600 hover:border-red-500 hover:text-white'
          }`}
        >
          {savedStatus === 'watched' ? (
            <HiCheckCircle className="w-4 h-4" />
          ) : savedStatus === 'watchlist' ? (
            <HiHeart className="w-4 h-4" />
          ) : (
            <HiOutlineHeart className="w-4 h-4" />
          )}
        </button>

        {/* Overlay Gradient & Judul */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

        <div className="absolute inset-x-0 bottom-0 p-3.5 flex flex-col justify-end">
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1 font-medium">
            <span>{year}</span>
            {movie.userRating > 0 && (
              <span className="text-emerald-400 font-semibold">
                Skormu: {movie.userRating}/10
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;