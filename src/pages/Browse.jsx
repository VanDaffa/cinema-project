import React, { useState, useEffect, useRef } from "react"; // Tambah useRef
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import { HiArrowsUpDown, HiChevronDown } from "react-icons/hi2"; // Tambah HiChevronDown

// Daftar opsi sort agar lebih rapi
const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Paling Populer" },
  { value: "vote_average.desc", label: "Rating Tertinggi" },
  { value: "primary_release_date.desc", label: "Terbaru" },
  { value: "revenue.desc", label: "Pendapatan Tertinggi" },
];

const Browse = () => {
  const [searchParams] = useSearchParams();

  const type = searchParams.get("type");
  const genreId = searchParams.get("genreId");
  const title = searchParams.get("title") || "Daftar Film";

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [sortBy, setSortBy] = useState("popularity.desc");

  // STATE BARU: Untuk Custom Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const supportsSorting = type === "genre" || type === "korean";

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setPage(1);
    setMovies([]);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [type, genreId, sortBy]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      try {
        let url = "";

        if (type === "genre") {
          url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=${sortBy}&page=${page}`;
        } else if (type === "korean") {
          url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_original_language=ko&sort_by=${sortBy}&page=${page}`;
        } else if (type === "trending") {
          url = `${baseUrl}/trending/movie/week?api_key=${apiKey}&page=${page}`;
        } else if (type === "now_playing") {
          url = `${baseUrl}/movie/now_playing?api_key=${apiKey}&page=${page}`;
        } else if (type === "upcoming") {
          url = `${baseUrl}/movie/upcoming?api_key=${apiKey}&page=${page}`;
        } else if (type === "top_rated") {
          url = `${baseUrl}/movie/top_rated?api_key=${apiKey}&page=${page}`;
        }

        if (url) {
          const response = await axios.get(url);
          if (page === 1) setMovies(response.data.results);
          else setMovies((prev) => [...prev, ...response.data.results]);
          setTotalPages(response.data.total_pages);
        }
      } catch (error) {
        console.error("Error fetching browse:", error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };

    fetchMovies();
  }, [page, type, genreId, sortBy, apiKey, baseUrl]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        if (!loading && !isFetchingMore && page < totalPages) {
          setPage((prev) => prev + 1);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, isFetchingMore, page, totalPages]);

  // Cari label yang sedang aktif
  const currentSortLabel = SORT_OPTIONS.find(
    (opt) => opt.value === sortBy,
  )?.label;

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-24 px-4 md:px-8 pb-10 animate-fade-in">
      <div className="container mx-auto">
        {/* HEADER: Judul dan Fitur Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 z-50 relative">
          <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-red-600 pl-4">
            {title}
          </h2>

          {supportsSorting && (
            // CUSTOM DROPDOWN CONTAINER
            <div className="relative" ref={dropdownRef}>
              {/* Tombol Pemicu */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center justify-between gap-3 bg-gray-800/90 px-4 py-2.5 rounded-lg border transition-all duration-300 w-full md:w-56 ${isDropdownOpen ? "border-red-600 shadow-lg shadow-red-600/20" : "border-gray-700 hover:border-gray-500"}`}
              >
                <div className="flex items-center gap-2 text-sm">
                  <HiArrowsUpDown className="text-red-500 w-5 h-5" />
                  <span>{currentSortLabel}</span>
                </div>
                <HiChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Daftar Opsi (Muncul saat isDropdownOpen = true) */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-full md:w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-[60] animate-fade-in-down origin-top-right">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsDropdownOpen(false);
                      }}
                      // LOGIKA WARNA HOVER:
                      // - Kalau aktif: Teks Merah, Bg Abu Gelap
                      // - Kalau hover: Teks Putih, Bg Abu Terang
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                        sortBy === option.value
                          ? "bg-gray-800/70 text-red-500 font-semibold"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {option.label}
                      {/* Indikator Centang buat opsi aktif */}
                      {sortBy === option.value && (
                        <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* GRID KONTEN (Tetap Sama) */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {isFetchingMore && (
              <div className="flex justify-center items-center py-8 mt-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
              </div>
            )}

            {!isFetchingMore && page >= totalPages && (
              <div className="text-center py-10 text-gray-500">
                <p>Sudah mencapai akhir daftar! 🎬</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center mt-20 text-gray-500">
            <p className="text-xl font-bold">Tidak ada film ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
