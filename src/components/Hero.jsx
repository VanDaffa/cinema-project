import React from "react";
import { useNavigate } from "react-router-dom";
// 1. KITA KEMBALIKAN IMPORT IKONNYA DI SINI
import { HiPlay, HiOutlineInformationCircle } from "react-icons/hi2";

const Hero = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[70vh] md:h-[85vh] text-white relative">
      <div className="w-full h-full">
        {/* GAMBAR BACKGROUND */}
        <img
          className="w-full h-full object-cover object-top"
          src={`https://image.tmdb.org/t/p/original${movie?.backdrop_path}`}
          alt={movie?.title}
        />

        {/* === LAPISAN GRADIENT (EFEK ESTETIKA) === */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/70 to-transparent"></div>
        <div className="absolute bottom-0 w-full h-[30vh] bg-gradient-to-t from-gray-900 to-transparent z-10"></div>

        {/* === KONTEN HERO === */}
        {/* 👇👇👇 TUAS KENDALI KETINGGIAN ADA DI SINI 👇👇👇 */}
        {/* Coba ubah bottom-[10%] jadi bottom-[5%] atau bottom-4 untuk menurunkannya */}
        <div className="absolute w-full bottom-[5%] md:bottom-[8%] p-4 md:p-8 flex flex-col gap-4 z-20">
          {/* JUDUL FILM */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-snug pb-2 line-clamp-2 md:line-clamp-3 w-full md:max-w-[70%]"
            title={movie?.title}
          >
            {movie?.title}
          </h1>

          {/* METADATA FILM */}
          <div className="flex items-center gap-3 text-xs md:text-sm font-semibold text-gray-300">
            <span className="text-green-400">New Release</span>
            <span className="border border-gray-400 px-1 rounded">HD</span>
            <span className="flex items-center text-yellow-400">
              ⭐ {movie?.vote_average?.toFixed(1)}
            </span>
            <span>{movie?.release_date?.split("-")[0]}</span>
          </div>

          {/* SINOPSIS */}
          <p className="w-full md:max-w-[70%] lg:max-w-[50%] text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-4">
            {movie?.overview}
          </p>

          {/* BUTTONS (Ikon Sudah Bangkit Kembali!) */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => navigate(`/movie/${movie?.id}`)}
              className="bg-white text-black font-bold py-2 px-6 rounded flex items-center gap-2 hover:bg-gray-300 transition-colors cursor-pointer"
            >
              <HiPlay className="w-5 h-5" /> Play Now
            </button>
            <button
              onClick={() => navigate(`/movie/${movie?.id}`)}
              className="border border-white text-white font-bold py-2 px-6 rounded flex items-center gap-2 hover:bg-white/20 transition-colors bg-gray-900/50 backdrop-blur-sm cursor-pointer"
            >
              <HiOutlineInformationCircle className="w-5 h-5" /> More Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
