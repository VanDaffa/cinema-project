import React from "react";
import { useNavigate } from "react-router-dom"; // Import ini buat pindah halaman
import { HiPlay, HiInformationCircle } from "react-icons/hi2"; // Import Ikon kece

const Hero = ({ movie }) => {
  const navigate = useNavigate();

  // Kalau data belum loading, jangan tampilkan apa-apa
  if (!movie) return null;

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

  // Fungsi buat pindah ke halaman detail
  const handleNavigate = () => {
    navigate(`/movie/${movie.id}`);
  };

  return (
    // Height kita set 70% - 80% dari layar biar immersive
    <div
      className="relative w-full h-[70vh] md:h-[80vh] bg-cover bg-center mb-8"
      style={{ backgroundImage: `url(${backdropUrl})` }}
    >
      {/* Overlay Gelap (Gradient dari bawah & samping kiri) */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

      {/* Konten Teks */}
      <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3 lg:w-1/2 flex flex-col justify-end h-full">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
          {movie.title}
        </h1>

        {/* Metadata kecil */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-300 font-medium">
          <span className="text-green-400 font-bold">New Release</span>
          <span className="border border-gray-500 px-1 rounded text-xs">
            HD
          </span>
          <span className="text-yellow-400">
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
          </span>
          <span>{movie.release_date?.split("-")[0]}</span>
        </div>

        <p className="text-gray-200 text-lg line-clamp-3 mb-8 drop-shadow-md max-w-xl">
          {movie.overview}
        </p>

        {/* === TOMBOL PLAY & MORE INFO === */}
        <div className="flex space-x-4">
          {/* Tombol Play Now (Warna Putih/Merah Menonjol) */}
          <button
            onClick={handleNavigate}
            className="bg-white hover:bg-white/90 text-black font-bold py-3 px-8 rounded flex items-center transition duration-300 gap-2 shadow-lg group"
          >
            <HiPlay className="w-7 h-7 group-hover:scale-110 transition-transform" />
            Play Now
          </button>

          {/* Tombol More Info (Transparan/Blur Effect) */}
          <button
            onClick={handleNavigate}
            className="bg-gray-500/40 hover:bg-gray-500/60 text-white font-bold py-3 px-8 rounded flex items-center transition duration-300 gap-2 backdrop-blur-sm border border-white/20"
          >
            <HiInformationCircle className="w-7 h-7" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
