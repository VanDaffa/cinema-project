import React from "react";
import { useNavigate } from "react-router-dom";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { useWatchlist } from "../context/WatchlistContext";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const isSaved = isInWatchlist(movie.id);

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    if (isSaved) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const imgUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out hover:z-10 animate-slide-up"
    >
      {/* PERUBAHAN DI SINI:
         1. opacity-0: Defaultnya ngilang (transparan).
         2. group-hover:opacity-100: Muncul pas card di-hover.
         3. transition-opacity duration-300: Munculnya halus (fade in), gak kaget.
      */}
      <button
        onClick={handleWatchlistClick}
        className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/60 hover:bg-red-600 backdrop-blur-sm transition-all duration-300 shadow-lg group-hover:scale-110 opacity-0 group-hover:opacity-100"
        title={isSaved ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
      >
        {isSaved ? (
          <HiHeart className="w-5 h-5 text-red-500 hover:text-white" />
        ) : (
          <HiOutlineHeart className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Gambar Poster */}
      <img
        src={imgUrl}
        alt={movie.title}
        className="w-full h-full object-cover aspect-[2/3]"
      />

      {/* Overlay Hitam & Teks Judul */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight drop-shadow-md">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-yellow-400 text-xs font-bold">
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </span>
          <span className="text-gray-300 text-[10px] border border-gray-500 px-1 rounded">
            {movie.release_date ? movie.release_date.split("-")[0] : "Movie"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
