import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import { HiAdjustmentsHorizontal, HiStar, HiXMark } from "react-icons/hi2";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Anime" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: currentYear - 1989 },
  (_, i) => currentYear - i,
);

const Discover = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tangkap parameter dari URL
  const query = searchParams.get("q");
  const actorId = searchParams.get("actorId");
  const actorName = searchParams.get("actorName");
  const navGenreId = searchParams.get("genreId");

  // TANGKAPAN BARU: Kategori Spesial dari Home
  const category = searchParams.get("category");
  const customTitle = searchParams.get("title");

  // Nilai awal filter
  const initialSort = searchParams.get("sortBy") || "popularity.desc";
  const initialYear = searchParams.get("year") || "";
  const initialRating = Number(searchParams.get("rating")) || 0;
  const initialLang = searchParams.get("lang") || "";

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [year, setYear] = useState(initialYear);
  const [rating, setRating] = useState(initialRating);
  const [sortBy, setSortBy] = useState(initialSort);
  const [language, setLanguage] = useState(initialLang);

  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pageTitle, setPageTitle] = useState("Eksplorasi Film");

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // LOGIKA BARU: Jika ada kategori, search, atau aktor, matikan panel filter!
  const isSearchMode = Boolean(query || actorId || category);

  useEffect(() => {
    if (navGenreId) setSelectedGenres([parseInt(navGenreId)]);
  }, [navGenreId]);

  // Reset page kalau parameter URL berubah
  useEffect(() => {
    setPage(1);
    setMovies([]);
  }, [
    query,
    actorId,
    category,
    selectedGenres,
    year,
    rating,
    sortBy,
    language,
  ]);

  // === LOGIKA FETCHING API (HYBRID) ===
  useEffect(() => {
    const fetchMovies = async () => {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      try {
        let url = "";

        if (query) {
          setPageTitle(`Hasil Pencarian: "${query}"`);
          url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${query}&page=${page}`;
        } else if (actorId) {
          setPageTitle(`Film oleh: ${actorName}`);
          url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_cast=${actorId}&sort_by=popularity.desc&page=${page}`;
        } else if (category) {
          // JALUR SPESIAL: Menggunakan endpoint asli dari TMDB persis seperti di Home
          setPageTitle(customTitle || "Daftar Film");
          if (category === "trending")
            url = `${baseUrl}/trending/movie/week?api_key=${apiKey}&page=${page}`;
          else if (category === "now_playing")
            url = `${baseUrl}/movie/now_playing?api_key=${apiKey}&page=${page}`;
          else if (category === "upcoming")
            url = `${baseUrl}/movie/upcoming?api_key=${apiKey}&page=${page}`;
          else if (category === "top_rated")
            url = `${baseUrl}/movie/top_rated?api_key=${apiKey}&page=${page}`;
        } else {
          // JALUR DISCOVER: Filter Normal
          setPageTitle("Eksplorasi Film");
          const genreString = selectedGenres.join(",");
          url = `${baseUrl}/discover/movie?api_key=${apiKey}&page=${page}&sort_by=${sortBy}`;
          if (genreString) url += `&with_genres=${genreString}`;
          if (year) url += `&primary_release_year=${year}`;
          if (rating > 0) url += `&vote_average.gte=${rating}`;
          if (language) url += `&with_original_language=${language}`;
        }

        const response = await axios.get(url);

        if (page === 1) setMovies(response.data.results);
        else setMovies((prev) => [...prev, ...response.data.results]);

        setTotalPages(response.data.total_pages);
      } catch (error) {
        console.error("Error fetching discover:", error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };

    fetchMovies();
  }, [
    page,
    query,
    actorId,
    category,
    selectedGenres,
    year,
    rating,
    sortBy,
    language,
    apiKey,
    baseUrl,
    actorName,
    customTitle,
  ]);

  // SENSOR INFINITE SCROLL
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

  const handleGenreToggle = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId],
    );
  };

  const handleClearSearch = () => {
    // Hapus parameter pencarian dari URL untuk kembali ke mode Filter
    navigate("/discover");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-24 px-4 pb-10 animate-fade-in">
      <div className="container mx-auto flex flex-col md:flex-row gap-8">
        {/* === SIDEBAR FILTER (KIRI) === */}
        <div className="w-full md:w-1/4 lg:w-1/5 shrink-0 relative">
          {/* OVERLAY JIKA MODE SEARCH AKTIF */}
          {isSearchMode && (
            <div className="absolute inset-0 z-20 bg-gray-900/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 border border-gray-700 text-center">
              <p className="text-gray-300 font-semibold mb-4 text-sm">
                Mode Pencarian Aktif.
                <br />
                Filter dinonaktifkan.
              </p>
              <button
                onClick={handleClearSearch}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors shadow-lg"
              >
                <HiXMark className="w-5 h-5" /> Hapus Pencarian
              </button>
            </div>
          )}

          <div
            className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 sticky top-24 ${isSearchMode ? "opacity-30 pointer-events-none" : ""}`}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-500 border-b border-gray-700 pb-3">
              <HiAdjustmentsHorizontal className="w-6 h-6" /> Filter Film
            </h2>

            {/* Urutkan */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm font-bold mb-2">
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="popularity.desc">Paling Populer</option>
                <option value="vote_average.desc">Rating Tertinggi</option>
                <option value="primary_release_date.desc">Terbaru</option>
                <option value="revenue.desc">Pendapatan Tertinggi</option>
              </select>
            </div>

            {/* Tahun Rilis */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm font-bold mb-2">
                Tahun Rilis
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              >
                <option value="">Semua Tahun</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div className="mb-6">
              <label className="flex justify-between text-gray-400 text-sm font-bold mb-2">
                <span>Min Rating</span>
                <span className="flex items-center text-yellow-400">
                  <HiStar className="mr-1" /> {rating}+
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-3">
                Genre
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreToggle(genre.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 border ${selectedGenres.includes(genre.id) ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/40" : "bg-gray-900 border-gray-600 text-gray-400 hover:border-red-500 hover:text-white"}`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === HASIL PENCARIAN GRID (KANAN) === */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">
            {pageTitle}
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : movies.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
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
                  <p>Sudah mencapai ujung pencarian! 🎬</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center mt-20 text-gray-500 bg-gray-800/30 py-20 rounded-xl border border-dashed border-gray-700">
              <p className="text-2xl mb-2">🕵️‍♂️</p>
              <p className="text-xl font-bold text-gray-400">
                Tidak ada film yang cocok.
              </p>
              <p className="text-sm mt-2">Coba kata kunci atau filter lain.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
