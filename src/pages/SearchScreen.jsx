import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tmdbService } from '../services/tmdb';
import { addSearchHistory } from '../utils/history';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import {
  HiMagnifyingGlass,
  HiFunnel,
  HiArrowPath,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
  HiSparkles,
  HiFilm,
  HiTv,
  HiUsers,
  HiUser,
  HiStar,
  HiInformationCircle,
} from 'react-icons/hi2';

const SearchScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q') || '';
  const rawType = searchParams.get('type');
  const initialType = rawType === 'tv' || rawType === 'person' ? rawType : 'movie';
  const initialGenre = searchParams.get('genre') || '';
  const initialTitle = searchParams.get('title') || '';

  const [mediaType, setMediaType] = useState(initialType);
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedYear, setSelectedYear] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);

  const [genres, setGenres] = useState([]);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);

  const [randomPick, setRandomPick] = useState(null);
  const [isPickingRandom, setIsPickingRandom] = useState(false);

  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const tParam = searchParams.get('type');
    const resolvedType = tParam === 'tv' || tParam === 'person' ? tParam : 'movie';
    const genreParam = searchParams.get('genre') || '';

    setMediaType(resolvedType);
    setQueryInput(qParam);
    setActiveQuery(qParam);
    setSelectedGenre(genreParam);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    tmdbService
      .getGenres(mediaType)
      .then((list) => {
        if (isMounted) setGenres(list);
      })
      .catch((err) => console.error('Gagal memuat genre:', err));

    return () => {
      isMounted = false;
    };
  }, [mediaType]);

  useEffect(() => {
    let isMounted = true;

    async function fetchCatalog() {
      setLoading(true);
      try {
        let data;
        if (activeQuery.trim()) {
          data = await tmdbService.searchMedia({
            mediaType,
            query: activeQuery.trim(),
            page,
            year: selectedYear,
          });
        } else {
          data = await tmdbService.discoverMedia({
            mediaType,
            page,
            sortBy,
            genreId: selectedGenre,
            year: selectedYear,
            minRating,
          });
        }

        if (isMounted) {
          let results = data.results || [];

          if (mediaType !== 'person') {
            results = results.filter((m) => m.poster_path);
            if (activeQuery.trim()) {
              if (selectedGenre) {
                results = results.filter((m) => m.genre_ids?.includes(Number(selectedGenre)));
              }
              if (minRating > 0) {
                results = results.filter((m) => (m.vote_average || 0) >= Number(minRating));
              }
            }
          }

          setItems(results);
          setTotalPages(Math.min(data.total_pages || 1, 500));
          setTotalResults(data.total_results || 0);
        }
      } catch (error) {
        console.error('Gagal mengambil katalog:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [mediaType, activeQuery, selectedGenre, selectedYear, minRating, sortBy, page]);

  const handleSwitchMediaType = (nextType) => {
    if (nextType === mediaType) return;
    setMediaType(nextType);
    setSelectedGenre('');
    setPage(1);

    const nextParams = new URLSearchParams();
    nextParams.set('type', nextType);
    if (activeQuery.trim()) nextParams.set('q', activeQuery.trim());
    setSearchParams(nextParams);
  };

  const handleSearchForm = (e) => {
    e.preventDefault();
    const trimmed = queryInput.trim();
    if (trimmed) addSearchHistory(trimmed);

    setActiveQuery(trimmed);
    setPage(1);

    const nextParams = new URLSearchParams();
    nextParams.set('type', mediaType);
    if (trimmed) nextParams.set('q', trimmed);
    if (!trimmed && selectedGenre && mediaType !== 'person') {
      nextParams.set('genre', selectedGenre);
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setQueryInput('');
    setActiveQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setMinRating(0);
    setSortBy('popularity.desc');
    setPage(1);
    setSearchParams({ type: mediaType });
  };

  const handleRandomize = async () => {
    if (isPickingRandom || mediaType === 'person') return;
    setIsPickingRandom(true);
    try {
      const pick = await tmdbService.getRandomPick({
        mediaType,
        genreId: selectedGenre,
        minRating: minRating > 0 ? minRating : 6.5,
      });
      if (!pick) {
        toast.error('Tidak ada judul acak yang cocok dengan filter saat ini.');
      } else {
        setRandomPick(pick);
      }
    } catch (error) {
      console.error('Gagal memilih tayangan acak:', error);
      toast.error('Gagal mengambil rekomendasi acak.');
    } finally {
      setIsPickingRandom(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

  const selectedGenreName = genres.find((g) => String(g.id) === String(selectedGenre))?.name;
  const typeLabel =
    mediaType === 'person' ? 'Pemeran' : mediaType === 'tv' ? 'Serial TV' : 'Film';

  const pageHeading = activeQuery
    ? `Pencarian ${typeLabel}: "${activeQuery}"`
    : selectedGenreName
    ? `${typeLabel} • ${selectedGenreName}`
    : initialTitle || (mediaType === 'person' ? 'Aktor & Aktris Populer' : `Eksplorasi ${typeLabel}`);

  return (
    <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-14">
        {/* Header & Tombol Randomizer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-1 h-7 bg-red-600 rounded-full" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{pageHeading}</h1>
            </div>
            <p className="text-sm text-slate-400 mt-1.5 pl-4">
              {loading
                ? `Memuat daftar ${typeLabel.toLowerCase()}...`
                : `Menampilkan ${items.length} dari ${totalResults.toLocaleString('id-ID')} hasil ditemukan`}
            </p>
          </div>

          {mediaType !== 'person' && (
            <button
              type="button"
              onClick={handleRandomize}
              disabled={isPickingRandom}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-red-600/20 transition-all self-start md:self-auto shrink-0"
            >
              <HiSparkles className={`w-4 h-4 ${isPickingRandom ? 'animate-spin' : ''}`} />
              <span>{isPickingRandom ? 'Mengacak...' : `Pilihkan ${typeLabel} Acak`}</span>
            </button>
          )}
        </div>

        {/* Panel Pencarian, Sakelar 3 Kategori & Filter */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Segmented Control: Film | Serial TV | Pemeran */}
            <div className="inline-flex p-1 rounded-xl bg-slate-800 border border-slate-700 shrink-0 self-start">
              <button
                type="button"
                onClick={() => handleSwitchMediaType('movie')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  mediaType === 'movie'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HiFilm className="w-4 h-4" />
                <span>Film</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMediaType('tv')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  mediaType === 'tv'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HiTv className="w-4 h-4" />
                <span>Serial TV</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMediaType('person')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                  mediaType === 'person'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HiUsers className="w-4 h-4" />
                <span>Pemeran</span>
              </button>
            </div>

            <form onSubmit={handleSearchForm} className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <HiMagnifyingGlass className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    mediaType === 'person'
                      ? 'Ketik nama aktor atau aktris yang dicari...'
                      : `Ketik judul ${typeLabel.toLowerCase()} yang dicari...`
                  }
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="w-full bg-slate-800 text-white placeholder-slate-400 text-sm rounded-xl pl-10 pr-9 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500 transition-colors"
                />
                {queryInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setQueryInput('');
                      setActiveQuery('');
                      const nextParams = new URLSearchParams();
                      nextParams.set('type', mediaType);
                      if (selectedGenre && mediaType !== 'person') {
                        nextParams.set('genre', selectedGenre);
                      }
                      setSearchParams(nextParams);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <HiXMark className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shrink-0"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Filter Dropdown (Khusus Film & Serial TV) */}
          {mediaType !== 'person' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center mt-4 pt-4 border-t border-slate-800/80">
              <select
                value={selectedGenre}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedGenre(val);
                  setPage(1);
                  if (!activeQuery) {
                    const nextParams = new URLSearchParams();
                    nextParams.set('type', mediaType);
                    if (val) nextParams.set('genre', val);
                    setSearchParams(nextParams);
                  }
                }}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500"
              >
                <option value="">Semua Genre</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500"
              >
                <option value="">Semua Tahun</option>
                {years.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>

              <select
                value={minRating}
                onChange={(e) => {
                  setMinRating(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500"
              >
                <option value={0}>Semua Rating</option>
                <option value={6}>Rating ≥ 6.0</option>
                <option value={7}>Rating ≥ 7.0</option>
                <option value={8}>Rating ≥ 8.0</option>
              </select>

              <select
                value={sortBy}
                disabled={Boolean(activeQuery.trim())}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:border-red-500 disabled:opacity-50"
              >
                <option value="popularity.desc">Paling Populer</option>
                <option value="vote_average.desc">Rating Tertinggi</option>
                <option value="primary_release_date.desc">Rilis Terbaru</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium py-2.5 px-4 rounded-xl border border-slate-700 transition-colors"
              >
                <HiArrowPath className="w-4 h-4" />
                <span>Reset Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Grid Hasil Katalog */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-xl bg-slate-800/80 animate-pulse"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            {mediaType === 'person' ? (
              /* GRID KARTU AKTOR & AKTRIS */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {items.map((person) => {
                  const knownForText = (person.known_for || [])
                    .map((k) => k.title || k.name)
                    .filter(Boolean)
                    .slice(0, 2)
                    .join(', ');

                  return (
                    <Link
                      key={person.id}
                      to={`/actor/${person.id}`}
                      className="group relative block rounded-xl overflow-hidden bg-slate-800/80 border border-slate-800 hover:border-slate-600 shadow-md transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden bg-slate-900 relative flex items-center justify-center">
                        {person.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                            alt={person.name}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <HiUser className="w-16 h-16 text-slate-600" />
                        )}

                        <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-sm border border-slate-700/70 px-2 py-0.5 rounded-md text-[11px] font-semibold text-sky-300">
                          {person.known_for_department || 'Acting'}
                        </span>

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                        <div className="absolute inset-x-0 bottom-0 p-3.5">
                          <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                            {person.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {knownForText || 'Lihat profil & karya'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* GRID KARTU FILM & SERIAL TV */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {items.map((item) => (
                  <MovieCard key={item.id} movie={item} mediaTypeOverride={mediaType} />
                ))}
              </div>
            )}

            {/* Kontrol Paginasi */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-sm font-medium border border-slate-700 transition-colors"
                >
                  <HiChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>

                <span className="text-sm text-slate-300 font-medium px-2">
                  Halaman <span className="text-white font-bold">{page}</span> dari{' '}
                  <span className="text-white font-bold">{totalPages}</span>
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-sm font-medium border border-slate-700 transition-colors"
                >
                  <span>Berikutnya</span>
                  <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl py-16 px-6 text-center flex flex-col items-center">
            <HiFunnel className="w-10 h-10 text-slate-500 mb-3" />
            <h2 className="text-xl font-bold text-white mb-1.5">
              {typeLabel} tidak ditemukan
            </h2>
            <p className="text-sm text-slate-400 max-w-md mb-5">
              Tidak ada hasil yang cocok dengan kata kunci atau filter yang dipilih.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              Tampilkan Daftar Populer
            </button>
          </div>
        )}
      </main>

      {/* Modal Spotlight Hasil Randomizer */}
      {randomPick && (
        <div
          onClick={() => setRandomPick(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400">
                <HiSparkles className="w-4 h-4" />
                <span>Rekomendasi Acak Untukmu</span>
              </span>
              <button
                type="button"
                onClick={() => setRandomPick(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <img
                src={`https://image.tmdb.org/t/p/w500${randomPick.poster_path}`}
                alt={randomPick.title || randomPick.name}
                className="w-36 aspect-[2/3] object-cover rounded-xl shadow-lg border border-slate-700 shrink-0"
              />
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h3 className="text-xl font-bold text-white leading-snug">
                  {randomPick.title || randomPick.name}
                </h3>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-300 mt-1.5 mb-3">
                  <span>
                    {(randomPick.release_date || randomPick.first_air_date || 'TBA').slice(0, 4)}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <HiStar className="w-3.5 h-3.5" />
                    {randomPick.vote_average ? randomPick.vote_average.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-4 leading-relaxed">
                  {randomPick.overview || 'Sinopsis belum tersedia.'}
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleRandomize}
                disabled={isPickingRandom}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <HiArrowPath className={`w-4 h-4 ${isPickingRandom ? 'animate-spin' : ''}`} />
                <span>Acak Lagi</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetPath =
                    randomPick.media_type === 'tv'
                      ? `/tv/${randomPick.id}`
                      : `/movie/${randomPick.id}`;
                  setRandomPick(null);
                  navigate(targetPath);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                <HiInformationCircle className="w-4 h-4" />
                <span>Lihat Detail</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SearchScreen;