import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import Banner from '../components/Banner';
import Row from '../components/Row';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import RevealSection from '../components/RevealSection';
import { requests } from '../services/tmdb';
import Navbar from '../components/Navbar';
import { getRecentlyViewed, clearRecentlyViewed } from '../utils/history';
import { HiChevronLeft, HiChevronRight, HiClock, HiTrash } from 'react-icons/hi2';

const HomeScreen = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [isRecentLeftEnd, setIsRecentLeftEnd] = useState(true);
  const [isRecentRightEnd, setIsRecentRightEnd] = useState(false);
  const recentSliderRef = useRef(null);

  useEffect(() => {
    const syncHistory = () => {
      setRecentItems(getRecentlyViewed());
    };

    syncHistory();
    window.addEventListener('focus', syncHistory);
    return () => window.removeEventListener('focus', syncHistory);
  }, []);

  const handleRecentScroll = () => {
    if (!recentSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = recentSliderRef.current;
    setIsRecentLeftEnd(scrollLeft <= 2);
    setIsRecentRightEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2);
  };

  useEffect(() => {
    handleRecentScroll();
  }, [recentItems]);

  const handleClearHistory = () => {
    clearRecentlyViewed();
    setRecentItems([]);
    toast.success('Riwayat terakhir dilihat berhasil dibersihkan.');
  };

  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col">
      <Navbar />
      <Banner />

      <main className="flex-1 pb-16 -mt-10 relative z-20">
        {recentItems.length > 0 && (
          <RevealSection>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 relative z-20">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-1 h-6 bg-emerald-500 rounded-full shrink-0" />
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <HiClock className="w-5 h-5 text-emerald-400" />
                    <span>Terakhir Dilihat</span>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-400 transition-colors shrink-0"
                >
                  <HiTrash className="w-3.5 h-3.5" />
                  <span>Hapus Riwayat</span>
                </button>
              </div>

              <div className="relative flex items-center">
                {!isRecentLeftEnd && (
                  <button
                    type="button"
                    onClick={() =>
                      recentSliderRef.current?.scrollBy({
                        left: -(recentSliderRef.current.clientWidth * 0.75),
                        behavior: 'smooth',
                      })
                    }
                    aria-label="Geser riwayat ke kiri"
                    className="absolute -left-3 sm:-left-4 z-30 bg-slate-900/90 hover:bg-red-600 text-white p-2 rounded-full border border-slate-700 shadow-lg backdrop-blur-sm transition-colors"
                  >
                    <HiChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <div
                  ref={recentSliderRef}
                  onScroll={handleRecentScroll}
                  className="flex items-stretch gap-4 overflow-x-auto scrollbar-hide py-2 w-full"
                >
                  {recentItems.map((item) => (
                    <div
                      key={`${item.media_type}_${item.id}`}
                      className="w-36 sm:w-40 md:w-44 shrink-0"
                    >
                      <MovieCard movie={item} mediaTypeOverride={item.media_type} />
                    </div>
                  ))}
                </div>

                {!isRecentRightEnd && (
                  <button
                    type="button"
                    onClick={() =>
                      recentSliderRef.current?.scrollBy({
                        left: recentSliderRef.current.clientWidth * 0.75,
                        behavior: 'smooth',
                      })
                    }
                    aria-label="Geser riwayat ke kanan"
                    className="absolute -right-3 sm:-right-4 z-30 bg-slate-900/90 hover:bg-red-600 text-white p-2 rounded-full border border-slate-700 shadow-lg backdrop-blur-sm transition-colors"
                  >
                    <HiChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </section>
          </RevealSection>
        )}

        <RevealSection delay={50}>
          <Row title="Trending Minggu Ini" fetchUrl={requests.fetchTrending} isLargeRow icon="🔥" />
        </RevealSection>

        <RevealSection delay={80}>
          <Row
            title="Serial TV Populer"
            fetchUrl={requests.fetchNetflixOriginals}
            mediaType="tv"
            isLargeRow
            icon="📺"
          />
        </RevealSection>

        <RevealSection>
          <Row
            title="Film Rating Tertinggi"
            fetchUrl={requests.fetchTopRated}
            mediaType="movie"
            icon="⭐"
          />
        </RevealSection>

        <RevealSection>
          <Row
            title="Film Aksi Terbaik"
            fetchUrl={requests.fetchActionMovies}
            mediaType="movie"
            icon="⚔️"
          />
        </RevealSection>

        <RevealSection>
          <Row
            title="Keluarga & Komedi"
            fetchUrl={requests.fetchComedyMovies}
            mediaType="movie"
            icon="😂"
          />
        </RevealSection>

        <RevealSection>
          <Row
            title="Horror & Thriller"
            fetchUrl={requests.fetchHorrorMovies}
            mediaType="movie"
            icon="👻"
          />
        </RevealSection>

        <RevealSection>
          <Row
            title="Romansa Pilihan"
            fetchUrl={requests.fetchRomanceMovies}
            mediaType="movie"
            icon="❤️"
          />
        </RevealSection>
      </main>

      <Footer />
    </div>
  );
};

export default HomeScreen;