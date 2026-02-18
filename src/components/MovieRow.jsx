import React, { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "./MovieCard";
import { FaArrowRight } from "react-icons/fa"; // Pakai ikon panah bawaan dulu

const MovieRow = ({ title, fetchUrl, onSelectGenre }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(fetchUrl);
        setMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching row:", error);
      }
    };
    fetchData();
  }, [fetchUrl]);

  return (
    <div className="mb-8 px-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-white text-xl md:text-2xl font-bold border-l-4 border-red-600 pl-4">
          {title}
        </h2>
        {/* Tombol Lihat Semua (Text Only) di atas */}
        <button
          onClick={() => onSelectGenre(movies)}
          className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer"
        >
          Lihat Semua &gt;
        </button>
      </div>

      {/* HAPUS class 'group' dari div parent ini agar hover tidak massal */}
      <div className="relative">
        <div className="flex overflow-x-scroll scroll-smooth space-x-4 pb-4 scrollbar-hide">
          {/* Render Movie Cards */}
          {movies.map((movie) => (
            <div key={movie.id} className="min-w-[160px] md:min-w-[200px]">
              <MovieCard movie={movie} />
            </div>
          ))}

          {/* KARTU "LIHAT SEMUA" DI UJUNG CAROUSEL */}
          <div className="min-w-[160px] md:min-w-[200px] flex items-center justify-center">
            <button
              onClick={() => onSelectGenre(movies)}
              className="group flex flex-col items-center justify-center w-full h-[300px] bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 hover:border-red-600 hover:bg-gray-800 transition-all cursor-pointer"
            >
              <div className="bg-gray-700 group-hover:bg-red-600 text-white rounded-full p-4 mb-2 transition-colors">
                <FaArrowRight />
              </div>
              <span className="text-gray-400 group-hover:text-white font-semibold">
                Lihat Semua
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieRow;
