import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import {
  HiBookmark,
  HiCheckCircle,
  HiStar,
  HiChatBubbleBottomCenterText,
} from 'react-icons/hi2';

const WatchlistScreen = () => {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist' | 'watched' | 'all'
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    let isMounted = true;

    async function fetchJournal() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'watchlist'));
        const items = snapshot.docs.map((docItem) => {
          const data = docItem.data();
          return {
            ...data,
            media_type: data.media_type || 'movie',
            status: data.status || 'watchlist',
            userRating: Number(data.userRating || 0),
            review: data.review || '',
          };
        });

        items.sort((a, b) => {
          const timeA = new Date(a.addedAt || a.savedAt || 0).getTime();
          const timeB = new Date(b.addedAt || b.savedAt || 0).getTime();
          return timeB - timeA;
        });

        if (isMounted) {
          setEntries(items);
        }
      } catch (error) {
        console.error('Gagal memuat jurnal tontonan:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchJournal();
    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const handleWatchlistChange = (itemId, itemMediaType, nextStatus) => {
    if (!nextStatus) {
      setEntries((prev) =>
        prev.filter(
          (item) =>
            !(
              String(item.id) === String(itemId) &&
              (item.media_type || 'movie') === itemMediaType
            )
        )
      );
    }
  };

  const watchlistItems = entries.filter((item) => item.status === 'watchlist');
  const watchedItems = entries.filter((item) => item.status === 'watched');

  const ratedEntries = entries.filter((item) => item.userRating > 0);
  const averageUserScore =
    ratedEntries.length > 0
      ? (
          ratedEntries.reduce((sum, item) => sum + item.userRating, 0) / ratedEntries.length
        ).toFixed(1)
      : '-';

  const displayedItems =
    activeTab === 'watchlist'
      ? watchlistItems
      : activeTab === 'watched'
      ? watchedItems
      : entries;

  return (
    <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header Halaman */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1 h-7 bg-red-600 rounded-full" />
          <h1 className="text-2xl sm:text-3xl font-bold">Jurnal & Watchlist Saya</h1>
        </div>

        {/* Kartu Statistik Ringkas */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <HiBookmark className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Ingin Ditonton</p>
                <p className="text-xl font-bold text-white">{watchlistItems.length} Judul</p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <HiCheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Sudah Ditonton</p>
                <p className="text-xl font-bold text-white">{watchedItems.length} Judul</p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                <HiStar className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Rata-rata Skormu</p>
                <p className="text-xl font-bold text-white">
                  {averageUserScore === '-' ? 'Belum ada skor' : `${averageUserScore} / 10`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigasi Kategori */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('watchlist')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'watchlist'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Ingin Ditonton ({watchlistItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watched')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'watched'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Sudah Ditonton ({watchedItems.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Semua Koleksi ({entries.length})
          </button>
        </div>

        {/* Daftar Grid Koleksi */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-[2/3] rounded-xl bg-slate-800/80 animate-pulse"
              />
            ))}
          </div>
        ) : displayedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 items-stretch">
            {displayedItems.map((item) => (
              <div
                key={`${item.media_type}_${item.id}`}
                className="flex flex-col h-full bg-slate-900/50 rounded-xl"
              >
                <MovieCard
                  movie={item}
                  mediaTypeOverride={item.media_type}
                  onWatchlistChange={handleWatchlistChange}
                />

                {item.review && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2 flex-1">
                    <HiChatBubbleBottomCenterText className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 italic leading-relaxed">"{item.review}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="my-10 bg-slate-900/70 border border-slate-800 rounded-2xl p-10 max-w-md mx-auto text-center flex flex-col items-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <HiBookmark className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {activeTab === 'watched'
                ? 'Belum Ada Riwayat Tontonan Selesai'
                : 'Daftar Masih Kosong'}
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              {activeTab === 'watched'
                ? 'Buka halaman detail film atau serial TV lalu tekan tombol "Tandai Selesai" untuk mencatat ulasan dan skormu.'
                : 'Belum ada tayangan di kategori ini. Jelajahi katalog untuk mulai menyusun daftar tontonanmu.'}
            </p>
            <Link
              to="/search"
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5 px-7 rounded-full transition-colors"
            >
              Eksplorasi Katalog
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WatchlistScreen;