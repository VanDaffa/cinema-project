import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import MovieCard from "./MovieCard";
import { FaArrowRight } from "react-icons/fa";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

const MovieRow = ({ title, fetchUrl, moviesData, onSelectGenre }) => {
  const [movies, setMovies] = useState([]);
  const sliderRef = useRef(null);

  // STATE BARU: Sensor posisi scroll
  const [isScrolledStart, setIsScrolledStart] = useState(true);
  const [isScrolledEnd, setIsScrolledEnd] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (moviesData) {
        setMovies(moviesData);
      } else if (fetchUrl) {
        try {
          const response = await axios.get(fetchUrl);
          setMovies(response.data.results);
        } catch (error) {
          console.error("Error fetching row:", error);
        }
      }
    };
    fetchData();
  }, [fetchUrl, moviesData]);

  // FUNGSI BARU: Mendeteksi pergerakan scroll
  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

      // Jika mentok kiri (0)
      setIsScrolledStart(scrollLeft === 0);

      // Jika mentok kanan (Toleransi 2px untuk pembulatan browser)
      setIsScrolledEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2);
    }
  };

  const slideLeft = () => {
    if (sliderRef.current) sliderRef.current.scrollLeft -= 500;
  };

  const slideRight = () => {
    if (sliderRef.current) sliderRef.current.scrollLeft += 500;
  };

  // Jalankan deteksi saat film pertama kali di-load
  useEffect(() => {
    handleScroll();
  }, [movies]);

  if (movies.length === 0) return null;

  return (
    <div className="mb-6 md:mb-10 px-4 relative">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-white text-lg md:text-2xl font-bold border-l-4 border-red-600 pl-4">
          {title}
        </h2>
        {onSelectGenre && (
          <button
            onClick={() => onSelectGenre(movies)}
            className="text-gray-400 text-xs md:text-sm hover:text-white transition-colors cursor-pointer"
          >
            Lihat Semua &gt;
          </button>
        )}
      </div>

      <div className="relative group/row">
        {/* TOMBOL PANAH KIRI (Sembunyi kalau di paling awal) */}
        {!isScrolledStart && (
          <button
            onClick={slideLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-black/70 hover:bg-red-600 text-white w-10 h-10 hidden md:flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100 rounded-full shadow-lg border border-gray-600 hover:border-red-600"
          >
            <HiChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          ref={sliderRef}
          onScroll={handleScroll} // TAMBAHKAN SENSOR DISINI
          className="flex overflow-x-scroll scroll-smooth space-x-4 pb-4 scrollbar-hide px-2"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="min-w-[140px] md:min-w-[200px]">
              <MovieCard movie={movie} />
            </div>
          ))}

          {onSelectGenre && (
            <div className="min-w-[140px] md:min-w-[200px] flex items-center justify-center">
              <button
                onClick={() => onSelectGenre(movies)}
                className="group flex flex-col items-center justify-center w-full h-[210px] md:h-[300px] bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 hover:border-red-600 hover:bg-gray-800 transition-all cursor-pointer"
              >
                <div className="bg-gray-700 group-hover:bg-red-600 text-white rounded-full p-3 md:p-4 mb-2 transition-colors">
                  <FaArrowRight />
                </div>
                <span className="text-gray-400 group-hover:text-white font-semibold text-xs md:text-base">
                  Lihat Semua
                </span>
              </button>
            </div>
          )}
        </div>

        {/* TOMBOL PANAH KANAN (Sembunyi kalau mentok kanan) */}
        {!isScrolledEnd && (
          <button
            onClick={slideRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-black/70 hover:bg-red-600 text-white w-10 h-10 hidden md:flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100 rounded-full shadow-lg border border-gray-600 hover:border-red-600"
          >
            <HiChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieRow;
