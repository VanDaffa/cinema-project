import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  HiMagnifyingGlass,
  HiXMark,
  HiBars3,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";

// === IMPORT FIREBASE ===
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

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

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // === STATE UNTUK USER LOGIN ===
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // === MEMANTAU STATUS LOGIN ===
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // === FUNGSI LOGIN & LOGOUT ===
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Gagal Login:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error("Gagal Logout:", error);
    }
  };

  // Efek Scroll & Klik di Luar Element
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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Logika Pencarian (Tetap Sama)
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
    setMobileSearchOpen(false);
    if (item.type === "genre") {
      navigate(
        `/browse?type=genre&genreId=${item.id}&title=${encodeURIComponent(item.name)}`,
      );
    } else if (item.media_type === "movie") {
      navigate(`/movie/${item.id}`);
    } else if (item.media_type === "person") {
      navigate(`/person/${item.id}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      navigate(
        `/browse?type=search&q=${encodeURIComponent(searchTerm)}&title=${encodeURIComponent("Hasil Pencarian: " + searchTerm)}`,
      );
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
        {/* === GRUP KIRI: LOGO & MENU TEKS === */}
        {!mobileSearchOpen && (
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-red-600 text-2xl md:text-3xl font-bold hover:scale-105 transition-transform tracking-wider z-50"
            >
              CINEMAXII
            </Link>

            <div className="hidden md:flex items-center gap-6 font-semibold text-sm lg:text-base">
              <Link
                to="/discover"
                className="text-gray-300 hover:text-white hover:underline decoration-red-600 decoration-2 underline-offset-4 transition-all"
              >
                Discover
              </Link>
              <Link
                to="/watchlist"
                className="text-gray-300 hover:text-white hover:underline decoration-red-600 decoration-2 underline-offset-4 transition-all"
              >
                Watchlist
              </Link>
            </div>
          </div>
        )}

        {/* === GRUP KANAN: SEARCH, LOGIN, & TOMBOL MOBILE === */}
        <div
          className={`flex items-center gap-4 ${mobileSearchOpen ? "w-full" : ""}`}
        >
          {/* Search Bar (Tetap Sama) */}
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
                autoFocus={mobileSearchOpen}
                className={`bg-gray-800/90 text-white border border-gray-600 rounded-full py-2 pl-10 focus:outline-none focus:border-red-600 transition-all placeholder-gray-400 backdrop-blur-sm 
                  ${mobileSearchOpen ? "w-full px-4" : "w-48 lg:w-64 focus:w-80 px-4"} 
                `}
              />
              <button type="submit" className="absolute left-3 text-gray-400">
                <HiMagnifyingGlass className="w-5 h-5" />
              </button>
              {(searchTerm || mobileSearchOpen) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    if (mobileSearchOpen) setMobileSearchOpen(false);
                  }}
                  className="absolute right-3 text-gray-400 hover:text-red-500"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              )}
            </form>

            {/* Dropdown Suggestions (Tetap Sama) */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0 transition-colors"
                  >
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
                        <img
                          src={
                            item.poster_path || item.profile_path
                              ? `https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`
                              : "https://via.placeholder.com/92x138?text=?"
                          }
                          alt={item.title || item.name}
                          className="w-10 h-14 object-cover rounded-md mr-3 shadow-md"
                        />
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
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* === BAGIAN AUTENTIKASI (LOGIN / PROFIL) === */}
          {!mobileSearchOpen && (
            <div className="hidden md:block relative" ref={userMenuRef}>
              {user ? (
                // Jika sudah login: Tampilkan Foto Profil
                <div>
                  <img
                    // Kita kasih fallback kalau photoURL kosong/gagal
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${user.displayName}&background=random`
                    }
                    alt="Profile"
                    referrerPolicy="no-referrer" // MANTRA SAKTI ANTI BLOKIR GOOGLE
                    className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:border-red-600 transition-all object-cover"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    // Jika URL foto ada tapi linknya rusak (error), ganti ke inisial
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=B91C1C&color=fff`;
                    }}
                  />
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-2 z-50 animate-fade-in-down origin-top-right">
                      <div className="px-4 py-2 border-b border-gray-700 mb-2">
                        <p className="text-sm text-white font-bold truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-800 hover:text-red-400 font-semibold flex items-center gap-2 transition-colors"
                      >
                        <HiArrowRightOnRectangle className="w-5 h-5" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Jika belum login: Tampilkan Tombol Login
                <button
                  onClick={handleLogin}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors shadow-lg"
                >
                  Login
                </button>
              )}
            </div>
          )}

          {/* Tombol Pemicu Search (Mobile Only) */}
          {!mobileSearchOpen && (
            <button
              onClick={() => {
                setMobileSearchOpen(true);
                setMobileMenuOpen(false);
              }}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <HiMagnifyingGlass className="w-7 h-7" />
            </button>
          )}

          {/* Tombol Hamburger Menu (Mobile Only) */}
          {!mobileSearchOpen && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white ml-2"
            >
              {mobileMenuOpen ? (
                <HiXMark className="w-8 h-8" />
              ) : (
                <HiBars3 className="w-8 h-8" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* === MOBILE MENU DROPDOWN === */}
      {mobileMenuOpen && !mobileSearchOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 mt-4 -mx-4 px-6 py-6 flex flex-col gap-6 shadow-xl animate-fade-in-down">
          {/* Info User di Mobile */}
          {user ? (
            <div className="flex items-center gap-4 border-b border-gray-700 pb-4">
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${user.displayName}&background=random`
                }
                alt="Profile"
                referrerPolicy="no-referrer" // MANTRA SAKTI DI MOBILE JUGA
                className="w-12 h-12 rounded-full border border-gray-600 object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=B91C1C&color=fff`;
                }}
              />
              <div>
                <p className="text-white font-bold text-lg">
                  {user.displayName}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-red-500 text-sm font-semibold mt-1"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-red-600 text-white font-bold py-3 rounded-lg text-center shadow-lg w-full"
            >
              Login with Google
            </button>
          )}

          <Link
            to="/discover"
            className="text-white font-semibold text-lg hover:text-red-500 transition-colors"
          >
            Discover Movies
          </Link>
          <Link
            to="/watchlist"
            className="text-white font-semibold text-lg hover:text-red-500 transition-colors"
          >
            My Watchlist
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
