import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";

// Daftar Genre Statis (TMDb Standard)
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // ... (Logika Scroll & Click Outside SAMA SEPERTI SEBELUMNYA) ...
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LOGIKA PENCARIAN BARU (API + GENRE)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 1) {
        // 2 huruf sudah mulai cari
        try {
          // 1. Cari Genre Lokal dulu
          const matchedGenres = GENRES.filter((g) =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ).slice(0, 3); // Ambil maks 3 genre

          // 2. Cari Film/Orang via API
          const response = await axios.get(
            `${baseUrl}/search/multi?api_key=${apiKey}&query=${searchTerm}`,
          );
          const apiResults = response.data.results
            .filter(
              (item) =>
                item.media_type === "movie" || item.media_type === "person",
            )
            .slice(0, 5);

          // 3. Gabungkan: Genre dulu, baru API
          // Kita kasih properti 'type' biar gampang dibedakan
          const combined = [
            ...matchedGenres.map((g) => ({ ...g, type: "genre" })),
            ...apiResults.map((i) => ({ ...i, type: "api" })),
          ];

          setSuggestions(combined);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Search error:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Percepat debounce jadi 300ms biar responsif

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, apiKey, baseUrl]);

  // Handle Klik Suggestion
  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setSearchTerm("");

    if (item.type === "genre") {
      // Navigasi ke Browse berdasarkan Genre
      navigate(
        `/browse?genreId=${item.id}&genreName=${encodeURIComponent(item.name)}`,
      );
    } else if (item.media_type === "movie") {
      navigate(`/movie/${item.id}`);
    } else if (item.media_type === "person") {
      navigate(
        `/browse?actorId=${item.id}&actorName=${encodeURIComponent(item.name)}`,
      );
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      navigate(`/browse?q=${searchTerm}`);
    }
  };

  const isTransparentPage =
    location.pathname === "/" || location.pathname.startsWith("/movie/");
  const navbarClass = isTransparentPage
    ? isScrolled
      ? "bg-black shadow-xl"
      : "bg-gradient-to-b from-black/90 to-transparent"
    : "bg-black shadow-xl";

  return (
    <nav
      className={`fixed top-0 w-full z-[100] transition-all duration-300 p-4 ${navbarClass}`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="text-red-600 text-3xl font-bold hover:scale-105 transition-transform tracking-wider"
        >
          CINEMAXII
        </Link>

        <div className="relative hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Cari film, aktor, genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
              className="bg-gray-800/80 text-white border border-gray-600 rounded-full px-4 py-2 pl-10 focus:outline-none focus:border-red-600 w-64 transition-all focus:w-96 placeholder-gray-400 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="absolute left-3 top-2.5 text-gray-400"
            >
              <HiMagnifyingGlass className="w-5 h-5" />
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            )}
          </form>

          {/* DROPDOWN HASIL */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSuggestionClick(item)}
                  className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0"
                >
                  {/* Tampilan Berbeda untuk Genre vs Movie */}
                  {item.type === "genre" ? (
                    <div className="flex items-center w-full">
                      <span className="w-10 h-10 flex items-center justify-center bg-red-600/20 text-red-500 rounded-full mr-3 text-lg">
                        #
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-400">Genre</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={
                          item.poster_path || item.profile_path
                            ? `https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`
                            : "https://via.placeholder.com/92x138?text=?"
                        }
                        alt={item.title || item.name}
                        className="w-10 h-14 object-cover rounded-md mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {item.title || item.name}
                        </h4>
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          {item.media_type === "person"
                            ? "Actor"
                            : item.release_date?.split("-")[0] || "Movie"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
