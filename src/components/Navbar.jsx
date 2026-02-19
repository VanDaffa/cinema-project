import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { HiMagnifyingGlass, HiXMark, HiBookmark } from "react-icons/hi2";

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

  // State baru buat Mobile Search
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 1) {
        try {
          const matchedGenres = GENRES.filter((g) =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase()),
          ).slice(0, 3);

          const response = await axios.get(
            `${baseUrl}/search/multi?api_key=${apiKey}&query=${searchTerm}`,
          );
          const apiResults = response.data.results
            .filter(
              (item) =>
                item.media_type === "movie" || item.media_type === "person",
            )
            .slice(0, 5);

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
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, apiKey, baseUrl]);

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setSearchTerm("");
    setMobileSearchOpen(false); // Tutup mobile search kalau klik
    if (item.type === "genre") {
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
      setMobileSearchOpen(false);
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
        {/* LOGIKA TAMPILAN MOBILE: Kalau Search Aktif, Logo Hilang sementara */}
        {!mobileSearchOpen && (
          <Link
            to="/"
            className="text-red-600 text-2xl md:text-3xl font-bold hover:scale-105 transition-transform tracking-wider z-50"
          >
            CINEMAXII
          </Link>
        )}

        {/* CONTAINER KANAN */}
        <div
          className={`flex items-center gap-4 ${mobileSearchOpen ? "w-full" : ""}`}
        >
          {/* === SEARCH BAR (Desktop & Mobile Mode) === */}
          {/* Di Desktop selalu muncul. Di Mobile cuma muncul kalau mobileSearchOpen = true */}
          <div
            className={`relative transition-all duration-300 ${mobileSearchOpen ? "block w-full" : "hidden md:block"}`}
            ref={searchRef}
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center"
            >
              <input
                type="text"
                placeholder="Cari film..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() =>
                  searchTerm.length > 1 && setShowSuggestions(true)
                }
                // Auto Focus saat mode mobile aktif
                autoFocus={mobileSearchOpen}
                className={`bg-gray-800/90 text-white border border-gray-600 rounded-full py-2 pl-10 focus:outline-none focus:border-red-600 transition-all placeholder-gray-400 backdrop-blur-sm 
                  ${mobileSearchOpen ? "w-full px-4" : "w-48 lg:w-64 focus:w-80 px-4"} 
                `}
              />

              {/* Ikon Kaca Pembesar (Submit) */}
              <button type="submit" className="absolute left-3 text-gray-400">
                <HiMagnifyingGlass className="w-5 h-5" />
              </button>

              {/* Tombol Close (X) */}
              {(searchTerm || mobileSearchOpen) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    if (mobileSearchOpen) setMobileSearchOpen(false); // Tutup mode mobile
                  }}
                  className="absolute right-3 text-gray-400 hover:text-red-500"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              )}
            </form>

            {/* === DROPDOWN SUGGESTIONS (Sudah Bebas Bug!) === */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                  >
                    {/* Tampilan Berbeda untuk Genre vs Movie/Actor */}
                    {item.type === "genre" ? (
                      <div className="flex items-center w-full">
                        <span className="w-10 h-10 flex items-center justify-center bg-red-600/20 text-red-500 rounded-full mr-3 text-lg font-bold">
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
                        {/* GAMBAR POSTER / PROFIL */}
                        <img
                          src={
                            item.poster_path || item.profile_path
                              ? `https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`
                              : "https://via.placeholder.com/92x138?text=?"
                          }
                          alt={item.title || item.name}
                          className="w-10 h-14 object-cover rounded-md mr-3 shadow-md"
                        />

                        {/* TEKS INFO */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">
                            {item.title || item.name}
                          </h4>
                          <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                            {item.media_type === "person" ? (
                              <span className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">
                                Actor
                              </span>
                            ) : (
                              <span className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
                                Movie
                              </span>
                            )}
                            {item.release_date && (
                              <span>• {item.release_date.split("-")[0]}</span>
                            )}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === TOMBOL PEMICU MOBILE (Kaca Pembesar) === */}
          {/* Muncul cuma di HP kalau search lagi tertutup */}
          {!mobileSearchOpen && (
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <HiMagnifyingGlass className="w-7 h-7" />
            </button>
          )}

          {/* === TOMBOL WATCHLIST === */}
          {/* Sembunyikan Bookmark kalau lagi mode cari di HP biar gak sempit */}
          {!mobileSearchOpen && (
            <Link
              to="/watchlist"
              className="relative group text-gray-300 hover:text-red-500 transition-colors"
              title="My Watchlist"
            >
              <HiBookmark className="w-7 h-7" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
