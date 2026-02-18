import React from "react";

const Hero = ({ movie }) => {
  // Kalau data belum loading, jangan tampilkan apa-apa biar nggak error
  if (!movie) return null;

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

  return (
    // Height kita set 70% dari layar (h-[70vh]) biar cinematic
    <div
      className="relative w-full h-[70vh] bg-cover bg-center mb-8"
      style={{ backgroundImage: `url(${backdropUrl})` }}
    >
      {/* Overlay Gelap (Gradient dari bawah ke atas) */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>

      {/* Konten Teks */}
      <div className="absolute bottom-0 left-0 p-8 w-full md:w-2/3 lg:w-1/2">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          {movie.title}
        </h1>

        {/* Metadata kecil */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-300">
          <span className="bg-red-600 text-white px-2 py-1 rounded font-bold">
            TOP 1
          </span>
          <span>📅 {movie.release_date}</span>
          <span className="text-yellow-400">
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </span>
        </div>

        <p className="text-gray-200 text-lg line-clamp-3 mb-6 drop-shadow-md">
          {movie.overview}
        </p>

        <div className="flex space-x-4">
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded flex items-center transition">
            ▶ Play Now
          </button>
          <button className="bg-gray-600/80 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded transition backdrop-blur-sm">
            ℹ More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
