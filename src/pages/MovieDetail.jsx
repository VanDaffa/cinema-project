import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tmdbService } from '../services/tmdb';
import { addRecentlyViewed } from '../utils/history';import { getDisplayTitle, getSecondaryTitle } from '../utils/title';

import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import {
  HiPlay,
  HiPlus,
  HiCheck,
  HiCheckCircle,
  HiStar,
  HiChevronLeft,
  HiChevronRight,
  HiUser,
  HiTrash,
  HiTv,
  HiArrowTopRightOnSquare,
} from 'react-icons/hi2';
import { getFriendlyAuthError } from '../utils/errorHandler';

// Kode bahasa ISO (mis. "en") menjadi nama bahasa Indonesia (mis. "Inggris")
const getLanguageName = (code) => {
  if (!code) return '-';
  try {
    return new Intl.DisplayNames(['id'], { type: 'language' }).of(code) || code;
  } catch {
    return code;
  }
};

const MovieDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const mediaType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';
  const shouldAutoPlay = searchParams.get('play') === 'true';

  const [detail, setDetail] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeVideoKey, setActiveVideoKey] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [collectionData, setCollectionData] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Jurnal Tontonan Personal (Firestore)
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  // State Kontrol Carousel (Cast, Video Gallery, Seasons)
  const [isCastLeftEnd, setIsCastLeftEnd] = useState(true);
  const [isCastRightEnd, setIsCastRightEnd] = useState(false);
  const castSliderRef = useRef(null);

  const [isVideoLeftEnd, setIsVideoLeftEnd] = useState(true);
  const [isVideoRightEnd, setIsVideoRightEnd] = useState(false);
  const videoSliderRef = useRef(null);

  const { user } = useAuth();
  const { getEntry, saveEntry, removeEntry } = useWatchlist();

  // Ambil seluruh data detail dari TMDB
  useEffect(() => {
    window.scrollTo(0, 0);
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setCollectionData(null);

      try {
        const data = await tmdbService.getMediaDetail(mediaType, id);
        if (!isMounted) return;

        setDetail(data.detail);
        setCast((data.cast || []).slice(0, 16));
        setRecommendations(
          (data.recommendations || []).filter((item) => item.poster_path).slice(0, 12)
        );
        setWatchProviders(data.watchProviders);

        // Simpan ke riwayat "Terakhir Dilihat" di localStorage
        addRecentlyViewed({ ...data.detail, media_type: mediaType });

        // Filter video YouTube & tentukan video utama
        const ytVideos = (data.videos || []).filter((v) => v.site === 'YouTube');
        setVideos(ytVideos);

        const mainTrailer =
          ytVideos.find((v) => v.type === 'Trailer' && v.official) ||
          ytVideos.find((v) => v.type === 'Trailer') ||
          ytVideos[0] ||
          null;
        setActiveVideoKey(mainTrailer ? mainTrailer.key : null);

        // Ambil daftar sekuel/waralaba jika film tergabung dalam collection
        if (mediaType === 'movie' && data.detail?.belongs_to_collection?.id) {
          try {
            const col = await tmdbService.getCollection(data.detail.belongs_to_collection.id);
            if (isMounted && col?.parts?.length > 1) {
              setCollectionData(col);
            }
          } catch (colErr) {
            console.error('Gagal memuat koleksi waralaba:', colErr);
          }
        }
      } catch (error) {
        console.error('Gagal memuat halaman detail:', error);
        if (isMounted) setDetail(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, mediaType]);

  // Gulir otomatis ke pemutar video saat dibuka via tombol "Play Trailer"
  useEffect(() => {
    if (!loading && shouldAutoPlay && activeVideoKey) {
      const playerEl = document.getElementById('video-player-section');
      if (playerEl) {
        playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [loading, shouldAutoPlay, activeVideoKey]);

  // Status, rating, dan review tersimpan dibaca dari WatchlistContext
  const journalEntry = detail?.id ? getEntry(mediaType, detail.id) : null;
  const journalStatus = journalEntry?.status ?? null; // null | 'watchlist' | 'watched'
  const savedRating = journalEntry?.userRating ?? 0;
  const savedReview = journalEntry?.review ?? '';

  // Sinkronkan draf rating & review dengan data tersimpan.
  // Dependency berupa nilai primitif agar draf yang sedang diketik tidak
  // tertimpa oleh perubahan lain pada watchlist.
  useEffect(() => {
    setUserRating(savedRating);
    setReviewText(savedReview);
  }, [detail?.id, mediaType, savedRating, savedReview]);

  // Helper deteksi batas scroll carousel
  const updateScrollBounds = (ref, setLeft, setRight) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setLeft(scrollLeft <= 2);
    setRight(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2);
  };

  useEffect(() => {
    updateScrollBounds(castSliderRef, setIsCastLeftEnd, setIsCastRightEnd);
    updateScrollBounds(videoSliderRef, setIsVideoLeftEnd, setIsVideoRightEnd);
  }, [cast, videos, loading]);

  const title = getDisplayTitle(detail);
  const releaseDate = detail?.release_date || detail?.first_air_date || '';
  // Judul pendamping: judul internasional untuk film Indonesia, judul asli untuk film asing
  const secondaryTitle = getSecondaryTitle(detail);
  const localizedTitle = detail?.localizedTitle || '';
  const showLocalizedTitle =
    localizedTitle && localizedTitle !== title && localizedTitle !== secondaryTitle;
  const releaseYear = releaseDate ? releaseDate.slice(0, 4) : 'TBA';

  // Simpan atau perbarui status Watchlist / Watched di Firestore
  const saveJournalEntry = async ({
    nextStatus,
    nextRating = userRating,
    nextReview = reviewText,
    successMessage,
  }) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk mencatat ke Jurnal & Watchlist.');
      return;
    }
    if (isSavingJournal || !detail?.id) return;

    setIsSavingJournal(true);

    try {
      await saveEntry(
        {
          id: detail.id,
          media_type: mediaType,
          title,
          poster_path: detail.poster_path,
          release_date: releaseDate,
          vote_average: detail.vote_average,
        },
        { status: nextStatus, userRating: nextRating, review: nextReview }
      );

      setUserRating(nextRating);
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      console.error('Gagal menyimpan jurnal:', error);
      toast.error(
        getFriendlyActionError(error, 'Gagal menyimpan perubahan ke jurnal. Silakan coba lagi.')
      );
    } finally {
      setIsSavingJournal(false);
    }
  };

  const handleToggleWatchlist = () => {
    if (journalStatus === 'watchlist') {
      handleRemoveFromCollection();
    } else {
      saveJournalEntry({
        nextStatus: 'watchlist',
        successMessage: `"${title}" disimpan ke Watchlist.`,
      });
    }
  };

  const handleMarkAsWatched = () => {
    saveJournalEntry({
      nextStatus: 'watched',
      successMessage: `"${title}" ditandai Sudah Ditonton.`,
    });
  };

  const handleRemoveFromCollection = async () => {
    if (!user || !detail?.id || isSavingJournal) return;
    setIsSavingJournal(true);

    try {
      await removeEntry(mediaType, detail.id);
      setUserRating(0);
      setReviewText('');
      toast.success(`"${title}" dihapus dari koleksi.`);
    } catch (error) {
      console.error('Gagal menghapus dari koleksi:', error);
      toast.error(
        getFriendlyActionError(error, 'Gagal menghapus tayangan dari koleksi.')
      );
    } finally {
      setIsSavingJournal(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-56 md:w-72 aspect-[2/3] bg-slate-800 rounded-2xl mx-auto md:mx-0 shrink-0" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-10 bg-slate-800 rounded-xl w-3/4" />
              <div className="h-5 bg-slate-800 rounded w-1/2" />
              <div className="h-24 bg-slate-800 rounded-xl w-full" />
              <div className="flex gap-3 pt-2">
                <div className="h-11 w-36 bg-slate-800 rounded-full" />
                <div className="h-11 w-36 bg-slate-800 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Tayangan tidak ditemukan</h1>
          <p className="text-slate-400 text-sm mb-6">
            Data film atau serial yang kamu cari tidak tersedia.
          </p>
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Gabungkan platform streaming resmi di Indonesia (prioritas flatrate/langganan)
  const streamingList = (() => {
    if (!watchProviders) return [];
    const map = new Map();
    const groups = [
      ...(watchProviders.flatrate || []).map((p) => ({ ...p, accessType: 'Streaming' })),
      ...(watchProviders.rent || []).map((p) => ({ ...p, accessType: 'Sewa' })),
      ...(watchProviders.buy || []).map((p) => ({ ...p, accessType: 'Beli' })),
    ];
    groups.forEach((item) => {
      if (!map.has(item.provider_id)) {
        map.set(item.provider_id, item);
      }
    });
    return Array.from(map.values()).slice(0, 8);
  })();

  const validSeasons =
    mediaType === 'tv'
      ? (detail.seasons || []).filter((s) => s.episode_count > 0)
      : [];

  return (
    <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
      <Navbar />

      {/* Hero Backdrop */}
      <div className="relative pt-24 pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
        {detail.backdrop_path && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-35 scale-105"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${detail.backdrop_path})`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/90 to-[#0f172a]/70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f172a] to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row gap-8 lg:gap-10 items-center md:items-start">
          <img
            src={
              detail.poster_path
                ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
                : 'https://via.placeholder.com/500x750/1e293b/94a3b8?text=No+Poster'
            }
            alt={title}
            className="w-52 sm:w-60 lg:w-72 aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-slate-700/60 shrink-0"
          />

          <div className="flex-1 text-center md:text-left md:pt-3">
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                  mediaType === 'tv'
                    ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {mediaType === 'tv' ? 'Serial TV' : 'Film Layar Lebar'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-snug pb-2 tracking-tight">
              {title}
            </h1>
            {secondaryTitle && (
              <p className="text-base sm:text-lg text-slate-400 font-medium -mt-1 mb-2">
                {secondaryTitle}
              </p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-1 mb-5 text-xs sm:text-sm text-slate-300 font-medium">
              <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-white font-semibold">
                {releaseYear}
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-base">
                <HiStar className="w-4 h-4" />
                {detail.vote_average ? detail.vote_average.toFixed(1) : 'N/A'}
              </span>

              {mediaType === 'movie' && detail.runtime > 0 && (
                <>
                  <span>•</span>
                  <span>{detail.runtime} menit</span>
                </>
              )}

              {mediaType === 'tv' && detail.number_of_seasons > 0 && (
                <>
                  <span>•</span>
                  <span>
                    {detail.number_of_seasons} Season ({detail.number_of_episodes} Episode)
                  </span>
                </>
              )}

              {detail.genres?.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-slate-300">
                    {detail.genres.map((g) => g.name).join(', ')}
                  </span>
                </>
              )}
            </div>

            {detail.tagline && (
              <p className="italic text-slate-400 text-sm sm:text-base mb-6">
                "{detail.tagline}"
              </p>
            )}

            {/* Tombol Aksi Utama */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              {activeVideoKey && (
                <a
                  href="#video-player-section"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-red-600/25 transition-colors"
                >
                  <HiPlay className="w-5 h-5" />
                  <span>Tonton Trailer</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleToggleWatchlist}
                disabled={isSavingJournal}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-colors ${
                  journalStatus === 'watchlist'
                    ? 'bg-red-600/20 border-red-500/60 text-red-300 hover:bg-red-600/30'
                    : 'bg-slate-800/85 border-slate-600 text-white hover:bg-slate-700'
                }`}
              >
                {journalStatus === 'watchlist' ? (
                  <>
                    <HiCheck className="w-5 h-5 text-red-400" />
                    <span>Di Watchlist</span>
                  </>
                ) : (
                  <>
                    <HiPlus className="w-5 h-5" />
                    <span>Watchlist</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleMarkAsWatched}
                disabled={isSavingJournal}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-colors ${
                  journalStatus === 'watched'
                    ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300 hover:bg-emerald-600/30'
                    : 'bg-slate-800/85 border-slate-600 text-white hover:bg-slate-700'
                }`}
              >
                <HiCheckCircle
                  className={`w-5 h-5 ${
                    journalStatus === 'watched' ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>{journalStatus === 'watched' ? 'Sudah Ditonton' : 'Tandai Selesai'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Konten Utama */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Kolom Kiri */}
          <div className="flex-1 min-w-0">
            {/* Sinopsis */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1 h-6 bg-red-600 rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold">Sinopsis</h2>
              </div>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {detail.overview || 'Sinopsis belum tersedia untuk tayangan ini.'}
              </p>
              {detail.overviewLanguage === 'en' && (
                <p className="text-xs text-slate-500 mt-3">
                  Sinopsis bahasa Indonesia belum tersedia, menampilkan versi bahasa Inggris.
                </p>
              )}
            </section>

            {/* Pemutar Video & Galeri Klip */}
            {activeVideoKey && (
              <section id="video-player-section" className="mb-12 scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1 h-6 bg-red-600 rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-bold">Trailer & Klip Video</h2>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${activeVideoKey}${
                      shouldAutoPlay ? '?autoplay=1&mute=1' : ''
                    }`}
                    title={`${title} Video Player`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Carousel Pilihan Klip Tambahan */}
                {videos.length > 1 && (
                  <div className="relative flex items-center mt-4">
                    {!isVideoLeftEnd && (
                      <button
                        type="button"
                        onClick={() =>
                          videoSliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
                        }
                        aria-label="Geser klip ke kiri"
                        className="absolute -left-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md"
                      >
                        <HiChevronLeft className="w-5 h-5" />
                      </button>
                    )}

                    <div
                      ref={videoSliderRef}
                      onScroll={() =>
                        updateScrollBounds(videoSliderRef, setIsVideoLeftEnd, setIsVideoRightEnd)
                      }
                      className="flex gap-3 overflow-x-auto scrollbar-hide py-1 w-full"
                    >
                      {videos.slice(0, 10).map((vid) => {
                        const isSelected = vid.key === activeVideoKey;
                        return (
                          <button
                            key={vid.id}
                            type="button"
                            onClick={() => setActiveVideoKey(vid.key)}
                            className={`w-44 shrink-0 text-left rounded-xl overflow-hidden border transition-all bg-slate-900 ${
                              isSelected
                                ? 'border-red-500 ring-1 ring-red-500'
                                : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <div className="aspect-video relative bg-slate-800">
                              <img
                                src={`https://img.youtube.com/vi/${vid.key}/mqdefault.jpg`}
                                alt={vid.name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <span className="p-1.5 rounded-full bg-slate-950/80 text-white">
                                  <HiPlay className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                            <div className="p-2.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                                {vid.type}
                              </span>
                              <p className="text-xs font-medium text-slate-200 line-clamp-1 mt-0.5">
                                {vid.name}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {!isVideoRightEnd && (
                      <button
                        type="button"
                        onClick={() =>
                          videoSliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' })
                        }
                        aria-label="Geser klip ke kanan"
                        className="absolute -right-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md"
                      >
                        <HiChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Daftar Season Khusus Serial TV */}
            {mediaType === 'tv' && validSeasons.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-1 h-6 bg-red-600 rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-bold">Daftar Season</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {validSeasons.map((season) => (
                    <div
                      key={season.id}
                      className="flex gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 items-center"
                    >
                      <img
                        src={
                          season.poster_path
                            ? `https://image.tmdb.org/t/p/w300${season.poster_path}`
                            : detail.poster_path
                            ? `https://image.tmdb.org/t/p/w300${detail.poster_path}`
                            : 'https://via.placeholder.com/150x225/1e293b/94a3b8?text=Season'
                        }
                        alt={season.name}
                        className="w-16 h-24 object-cover rounded-xl bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-white truncate">
                          {season.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {season.air_date ? season.air_date.slice(0, 4) : 'TBA'} •{' '}
                          <span className="text-slate-200 font-semibold">
                            {season.episode_count} Episode
                          </span>
                        </p>
                        {season.overview && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {season.overview}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Top Cast */}
            {cast.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-1 h-6 bg-red-600 rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-bold">Top Cast</h2>
                </div>

                <div className="relative flex items-center">
                  {!isCastLeftEnd && (
                    <button
                      type="button"
                      onClick={() =>
                        castSliderRef.current?.scrollBy({ left: -360, behavior: 'smooth' })
                      }
                      aria-label="Geser pemeran ke kiri"
                      className="absolute -left-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md backdrop-blur-sm transition-colors"
                    >
                      <HiChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  <div
                    ref={castSliderRef}
                    onScroll={() =>
                      updateScrollBounds(castSliderRef, setIsCastLeftEnd, setIsCastRightEnd)
                    }
                    className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide w-full"
                  >
                    {cast.map((actor) => (
                      <Link
                        to={`/actor/${actor.id}`}
                        key={actor.id}
                        className="w-28 shrink-0 text-center group cursor-pointer"
                      >
                        <div className="w-24 h-24 mx-auto mb-2.5 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-red-500 transition-colors bg-slate-800 flex items-center justify-center shadow-md">
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                              alt={actor.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <HiUser className="w-10 h-10 text-slate-500" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                          {actor.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {actor.character}
                        </p>
                      </Link>
                    ))}
                  </div>

                  {!isCastRightEnd && (
                    <button
                      type="button"
                      onClick={() =>
                        castSliderRef.current?.scrollBy({ left: 360, behavior: 'smooth' })
                      }
                      aria-label="Geser pemeran ke kanan"
                      className="absolute -right-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md backdrop-blur-sm transition-colors"
                    >
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Kolom Kanan: Jurnal Personal, Platform Streaming & Info Produksi */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Kotak Jurnal Tontonan Pribadi (Muncul saat user sudah login & menyimpan tayangan) */}
            {user && journalStatus && (
              <div className="bg-slate-900/95 rounded-2xl p-6 border border-slate-700/80 shadow-xl">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full" />
                    <span>Jurnal Pribadimu</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleRemoveFromCollection}
                    title="Hapus dari koleksi"
                    className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>

                {/* Skor Pribadi 1 - 10 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">Skor Pribadi</span>
                    <span className="font-bold text-amber-400">
                      {userRating > 0 ? `${userRating} / 10` : 'Belum dinilai'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setUserRating(score)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                          userRating === score
                            ? 'bg-amber-500 border-amber-400 text-slate-950'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Catatan Ulasan Singkat */}
                <div className="mb-4">
                  <label className="block text-xs text-slate-400 mb-1.5">
                    Catatan Singkat
                  </label>
                  <textarea
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    maxLength={2000}
                    placeholder="Tulis kesanmu tentang tayangan ini..."
                    className="w-full bg-slate-800/90 text-white placeholder-slate-500 text-xs rounded-xl p-3 border border-slate-700 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSavingJournal}
                  onClick={() =>
                    saveJournalEntry({
                      nextStatus: journalStatus,
                      nextRating: userRating,
                      nextReview: reviewText,
                      successMessage: 'Jurnal pribadi berhasil diperbarui.',
                    })
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
                >
                  {isSavingJournal ? 'Menyimpan...' : 'Simpan Rating & Catatan'}
                </button>
              </div>
            )}

            {/* Kotak Platform Streaming Resmi Indonesia */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                  <span className="w-1 h-5 bg-red-600 rounded-full" />
                  <span>Tersedia di (ID)</span>
                </h3>
                <HiTv className="w-4 h-4 text-slate-400" />
              </div>

              {streamingList.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    {streamingList.map((provider) => (
                      <div
                        key={provider.provider_id}
                        className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/70 rounded-xl p-2"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                          alt={provider.provider_name}
                          className="w-8 h-8 rounded-lg shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {provider.provider_name}
                          </p>
                          <p className="text-[10px] text-slate-400">{provider.accessType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {watchProviders?.link && (
                    <a
                      href={watchProviders.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <span>Lihat tautan resmi via TMDB</span>
                      <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
                    </a>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  Belum tersedia informasi platform streaming resmi untuk wilayah Indonesia.
                </p>
              )}
            </div>

            {/* Kotak Informasi Produksi */}
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h3 className="text-base font-bold text-white mb-5 pb-3 border-b border-slate-800 flex items-center gap-2.5">
                <span className="w-1 h-5 bg-red-600 rounded-full" />
                <span>Informasi Produksi</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold text-right text-slate-100">
                    {detail.status || '-'}
                  </span>
                </div>
                {showLocalizedTitle && (
                  <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
                    <span className="text-slate-400">Judul Indonesia</span>
                    <span className="font-semibold text-right text-slate-100">
                      {localizedTitle}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
                  <span className="text-slate-400">Bahasa Asli</span>
                  <span className="font-semibold uppercase text-right text-slate-100">
                    {getLanguageName(detail.original_language)}
                  </span>
                </div>

                {mediaType === 'movie' ? (
                  <>
                    <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
                      <span className="text-slate-400">Anggaran</span>
                      <span className="font-semibold text-right text-slate-100">
                        {detail.budget > 0 ? `$${detail.budget.toLocaleString('en-US')}` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
                      <span className="text-slate-400">Pendapatan</span>
                      <span className="font-semibold text-right text-slate-100">
                        {detail.revenue > 0 ? `$${detail.revenue.toLocaleString('en-US')}` : '-'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between gap-4 border-b border-slate-800/80 pb-3">
                    <span className="text-slate-400">Jaringan</span>
                    <span className="font-semibold text-right text-slate-100">
                      {detail.networks?.length > 0
                        ? detail.networks.map((n) => n.name).join(', ')
                        : '-'}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-slate-400">Studio Produksi</span>
                  <span className="font-medium text-slate-200 leading-relaxed">
                    {detail.production_companies?.length > 0
                      ? detail.production_companies.map((c) => c.name).join(', ')
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Semesta & Sekuel (Collection Rabbit Hole) */}
        {collectionData && collectionData.parts?.length > 1 && (
          <section className="mt-12 border-t border-slate-800/80 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-6 bg-red-600 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-bold">
                Bagian dari {collectionData.name}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {collectionData.parts.map((part) => (
                <div key={part.id} className="relative">
                  <MovieCard
                    movie={part}
                    mediaTypeOverride="movie"
                    className={
                      String(part.id) === String(detail.id)
                        ? 'ring-2 ring-red-500 border-red-500'
                        : ''
                    }
                  />
                  {String(part.id) === String(detail.id) && (
                    <span className="absolute bottom-14 left-2.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow pointer-events-none">
                      Sedang Dilihat
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rekomendasi Serupa */}
        {recommendations.length > 0 && (
          <section className="mt-12 border-t border-slate-800/80 pt-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-6 bg-red-600 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-bold">Mungkin Kamu Suka</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {recommendations.map((rec) => (
                <MovieCard key={rec.id} movie={rec} mediaTypeOverride={mediaType} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MovieDetail;