import React from "react";
import { useNavigate } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  // Cek kalau poster gak ada, pakai gambar placeholder abu-abu
  const imgUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out hover:z-10"
    >
      {/* Poster Image */}
      <img
        src={imgUrl}
        alt={movie.title}
        className="w-full h-full object-cover aspect-[2/3]"
      />

      {/* Overlay Hitam (Muncul pas hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <h3 className="text-white font-bold text-lg leading-tight mb-1">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <span className="text-yellow-400 font-bold text-sm">
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </span>
          <span className="text-gray-300 text-xs border border-gray-500 px-1 rounded">
            {movie.release_date ? movie.release_date.split("-")[0] : "-"}
          </span>
        </div>

        <p className="text-gray-400 text-xs mt-2 line-clamp-3">
          {movie.overview || "Tidak ada deskripsi."}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
