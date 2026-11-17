import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tmdbService } from '../services/tmdb';
import {
  getSearchHistory,
  addSearchHistory,
  removeSearchHistoryItem,
  clearSearchHistory,
} from '../utils/history';
import { useAuth } from '../context/AuthContext';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import {
  HiMagnifyingGlass,
  HiXMark,
  HiStar,
  HiBookmark,
  HiArrowRightOnRectangle,
  HiChevronDown,
  HiUser,
  HiClock,
  HiFire,
} from 'react-icons/hi2';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaResults, setMediaResults] = useState([]);
  const [personResults, setPersonResults] = useState([]);
  const [trendingQuick, setTrendingQuick] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchRef = useRef(null);
  const desktopInputRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Muat riwayat pencarian saat komponen dipasang
  useEffect(() => {
    setSearchHistory(getSearchHistory());
  }, []);

  // Tutup seluruh dropdown saat berpindah halaman
  useEffect(() => {
    setShowDropdown(false);
    setShowUserMenu(false);
    setShowMobileSearch(false);
  }, [location.pathname, location.search]);

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pintasan Keyboard Global ('/' atau 'Ctrl+K' untuk fokus pencarian, 'Escape' untuk tutup)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
        setShowMobileSearch(false);
        setShowUserMenu(false);
        desktopInputRef.current?.blur();
        return;
      }

      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTypingElsewhere =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        document.activeElement?.isContentEditable;

      if (isCtrlK || (e.key === '/' && !isTypingElsewhere)) {
        e.preventDefault();
        if (window.innerWidth >= 768) {
          desktopInputRef.current?.focus();
          handleOpenSearchPanel();
        } else {
          setShowMobileSearch(true);
          handleOpenSearchPanel();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trendingQuick.length]);

  // Muat daftar trending singkat secara lazy saat panel pencarian pertama kali dibuka
  const handleOpenSearchPanel = async () => {
    setShowDropdown(true);
    setSearchHistory(getSearchHistory());

    if (trendingQuick.length === 0) {
      try {
        const list = await tmdbService.getTrendingQuick();
        setTrendingQuick(list);
      } catch (err) {
        console.error('Gagal memuat trending cepat:', err);
      }
    }
  };

  // Live Search Multi-Kategori (Film, Serial TV, dan Pemeran)
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setMediaResults([]);
      setPersonResults([]);
      setSearchError('');
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      setShowDropdown(true);

      try {
        const data = await tmdbService.searchMulti({ query: trimmed, page: 1 });
        setMediaResults((data.mediaResults || []).slice(0, 4));
        setPersonResults((data.personResults || []).slice(0, 3));
      } catch (error) {
        console.error('Live search error:', error);
        setSearchError('Gagal memuat hasil pencarian dari TMDB.');
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const recordSearchTerm = (term) => {
    const updated = addSearchHistory(term);
    setSearchHistory(updated);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success('Login berhasil! Selamat datang kembali.');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(`Login gagal: ${error.code || error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
      toast.success('Logout berhasil! Sampai jumpa lagi.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal melakukan logout.');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    recordSearchTerm(trimmed);
    setShowDropdown(false);
    setShowMobileSearch(false);

    // Jika hasil hanya ditemukan pada kategori pemeran, langsung arahkan ke tab Pemeran
    const targetType =
      mediaResults.length === 0 && personResults.length > 0 ? 'person' : 'movie';
    navigate(`/search?type=${targetType}&q=${encodeURIComponent(trimmed)}`);
  };

  const isActive = (path) => location.pathname === path;

  // Render Dropdown (Zero-Query State & Grouped Results)
  const renderSearchDropdown = (isMobile = false) => {
    if (!showDropdown && !isMobile) return null;

    const trimmed = searchTerm.trim();
    const hasAnyResult = mediaResults.length > 0 || personResults.length > 0;

    return (
      <div
        className={`${
          isMobile
            ? 'mt-2.5 w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden'
            : 'absolute right-0 mt-2 w-[26rem] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50'
        }`}
      >
        {!trimmed ? (
          /* ZERO-QUERY STATE: Riwayat Pencarian + Trending Hari Ini */
          <div className="max-h-[26rem] overflow-y-auto divide-y divide-slate-800/80">
            {searchHistory.length > 0 && (
              <div className="p-3.5">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <HiClock className="w-3.5 h-3.5" />
                    <span>Pencarian Terakhir</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearSearchHistory();
                      setSearchHistory([]);
                    }}
                    className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Hapus Semua
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {searchHistory.map((term) => (
                    <div
                      key={term}
                      className="inline-flex items-center bg-slate-800 hover:bg-slate-700/90 border border-slate-700 rounded-full text-xs text-slate-200 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setSearchTerm(term)}
                        className="pl-3 pr-1.5 py-1.5 text-left"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchHistory(removeSearchHistoryItem(term))}
                        aria-label={`Hapus ${term}`}
                        className="pr-2.5 pl-1 py-1.5 text-slate-400 hover:text-red-400"
                      >
                        <HiXMark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {trendingQuick.length > 0 && (
              <div className="p-3.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 px-1">
                  <HiFire className="w-3.5 h-3.5" />
                  <span>Trending Hari Ini</span>
                </span>
                <div className="space-y-1">
                  {trendingQuick.map((item) => {
                    const isTv = item.media_type === 'tv';
                    const displayTitle = item.title || item.name;
                    return (
                      <button
                        key={`${item.media_type}_${item.id}`}
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          setShowMobileSearch(false);
                          navigate(isTv ? `/tv/${item.id}` : `/movie/${item.id}`);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-800/80 transition-colors text-left"
                      >
                        <span className="text-xs sm:text-sm font-medium text-slate-200 truncate">
                          {displayTitle}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            isTv
                              ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isTv ? 'TV' : 'Film'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {searchHistory.length === 0 && trendingQuick.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                Ketik judul film, serial TV, atau nama aktor & aktris...
              </div>
            )}
          </div>
        ) : isSearching ? (
          <div className="p-5 text-center text-xs text-slate-400">
            Mencari tayangan & pemeran...
          </div>
        ) : searchError ? (
          <div className="p-4 text-center text-xs text-red-400">{searchError}</div>
        ) : hasAnyResult ? (
          <>
            <div className="max-h-[26rem] overflow-y-auto divide-y divide-slate-800/80">
              {/* KELOMPOK 1: FILM & SERIAL TV */}
              {mediaResults.length > 0 && (
                <div>
                  <div className="px-3.5 py-2 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Film & Serial TV
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {mediaResults.map((item) => {
                      const isTv = item.media_type === 'tv';
                      const displayTitle = item.title || item.name;
                      const rawDate = item.release_date || item.first_air_date;
                      const year = rawDate ? rawDate.split('-')[0] : 'TBA';

                      return (
                        <button
                          key={`${item.media_type}_${item.id}`}
                          type="button"
                          onClick={() => {
                            recordSearchTerm(trimmed);
                            setShowDropdown(false);
                            setShowMobileSearch(false);
                            navigate(isTv ? `/tv/${item.id}` : `/movie/${item.id}`);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/80 transition-colors text-left"
                        >
                          <img
                            src={
                              item.poster_path
                                ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                : 'https://via.placeholder.com/92x138/1e293b/94a3b8?text=No+Poster'
                            }
                            alt={displayTitle}
                            className="w-10 h-14 object-cover rounded-lg bg-slate-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">
                              {displayTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  isTv
                                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {isTv ? 'Serial TV' : 'Film'}
                              </span>
                              <span>{year}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-400 font-medium">
                                <HiStar className="w-3.5 h-3.5" />
                                {item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* KELOMPOK 2: AKTOR & AKTRIS */}
              {personResults.length > 0 && (
                <div>
                  <div className="px-3.5 py-2 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Aktor & Aktris
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {personResults.map((person) => {
                      const knownForTitles = (person.known_for || [])
                        .map((k) => k.title || k.name)
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(', ');

                      return (
                        <button
                          key={`person_${person.id}`}
                          type="button"
                          onClick={() => {
                            recordSearchTerm(trimmed);
                            setShowDropdown(false);
                            setShowMobileSearch(false);
                            navigate(`/actor/${person.id}`);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-800/80 transition-colors text-left"
                        >
                          <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                            {person.profile_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                alt={person.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HiUser className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white truncate">
                                {person.name}
                              </p>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                                {person.known_for_department || 'Pemeran'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              {knownForTitles
                                ? `Dikenal lewat: ${knownForTitles}`
                                : 'Lihat profil & filmografi'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSearchSubmit}
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-red-600 text-xs font-semibold text-slate-200 hover:text-white transition-colors text-center"
            >
              Lihat semua hasil untuk "{searchTerm}"
            </button>
          </>
        ) : (
          <div className="p-5 text-center text-xs text-slate-400">
            Tidak ditemukan tayangan maupun pemeran untuk "{searchTerm}"
          </div>
        )}
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled || showMobileSearch
          ? 'bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg'
          : 'bg-gradient-to-b from-[#0f172a]/90 via-[#0f172a]/50 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-1.5 shrink-0">
            <span className="text-red-500 font-extrabold text-2xl tracking-wider">
              CINEMAXII
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/') ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`transition-colors ${
                isActive('/search') ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Explore
            </Link>
            {user && (
              <Link
                to="/watchlist"
                className={`transition-colors ${
                  isActive('/watchlist')
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Jurnal & Watchlist
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar Desktop dengan Indikator Shortcut */}
          <div ref={searchRef} className="relative hidden md:block w-80 lg:w-96">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                ref={desktopInputRef}
                type="text"
                placeholder="Cari film, serial TV, atau aktor..."
                value={searchTerm}
                onFocus={handleOpenSearchPanel}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-sm rounded-full pl-10 pr-14 py-2 border border-slate-700 focus:outline-none focus:border-red-500 transition-colors"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setMediaResults([]);
                    setPersonResults([]);
                    desktopInputRef.current?.focus();
                  }}
                  className="absolute right-3 text-slate-400 hover:text-white"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-900/90 border border-slate-700 rounded-md pointer-events-none">
                  Ctrl K
                </kbd>
              )}
            </form>
            {renderSearchDropdown(false)}
          </div>

          {/* Tombol Toggle Search Mobile */}
          <button
            type="button"
            onClick={() => {
              const nextState = !showMobileSearch;
              setShowMobileSearch(nextState);
              if (nextState) handleOpenSearchPanel();
            }}
            className="md:hidden p-2 rounded-full bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700"
            aria-label="Cari tayangan atau pemeran"
          >
            {showMobileSearch ? (
              <HiXMark className="w-5 h-5" />
            ) : (
              <HiMagnifyingGlass className="w-5 h-5" />
            )}
          </button>

          {!user ? (
            <button
              type="button"
              onClick={handleLogin}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-full transition-colors text-sm shrink-0"
            >
              Login
            </button>
          ) : (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={
                    user.photoURL ||
                    'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png'
                  }
                  alt={user.displayName || 'User Avatar'}
                />
                <HiChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.displayName || 'Pengguna CINEMAXII'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/watchlist"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <HiBookmark className="w-4 h-4 text-red-500" />
                    <span>Jurnal & Watchlist</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors text-left"
                  >
                    <HiArrowRightOnRectangle className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Panel Pencarian Mobile */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-4 pt-1 border-t border-slate-800/80 bg-[#0f172a]">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              placeholder="Cari film, serial TV, atau aktor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-full pl-10 pr-9 py-2 border border-slate-700 focus:outline-none focus:border-red-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setMediaResults([]);
                  setPersonResults([]);
                }}
                className="absolute right-3 text-slate-400 hover:text-white"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            )}
          </form>

          {renderSearchDropdown(true)}

          <div className="flex items-center gap-4 text-xs font-medium text-slate-300 px-1 mt-3">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <Link to="/search" className="hover:text-white">
              Explore
            </Link>
            {user && (
              <Link to="/watchlist" className="hover:text-white">
                Jurnal & Watchlist
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;