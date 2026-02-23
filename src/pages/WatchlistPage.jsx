import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import { HiOutlineFilm } from "react-icons/hi2";

// === IMPORT FIREBASE ===
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const WatchlistPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // 1. Pantau Status Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setMovies([]); // Kosongkan daftar kalau belum login
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Tarik Data dari Cloud Firestore
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (user) {
        setLoading(true);
        try {
          // Akses brankas user ini, lalu ambil semua dokumen di dalam koleksi "watchlist"
          // Urutkan berdasarkan waktu simpan (paling baru di atas)
          const q = query(
            collection(db, "users", user.uid, "watchlist"),
            orderBy("savedAt", "desc"),
          );

          const querySnapshot = await getDocs(q);
          const watchlistData = querySnapshot.docs.map((doc) => doc.data());

          setMovies(watchlistData);
        } catch (error) {
          console.error("Error fetching watchlist from cloud:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWatchlist();
    window.scrollTo(0, 0);
  }, [user]);

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-24 px-4 md:px-8 pb-10 animate-fade-in">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold border-l-4 border-red-600 pl-4 mb-8 flex items-center gap-3">
          <HiOutlineFilm className="text-red-600" />
          My Watchlist
        </h2>

        {!user ? (
          // JIKA BELUM LOGIN
          <div className="text-center mt-32 text-gray-500 animate-slide-up">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Oops! Kamu Belum Login 🕵️‍♂️
            </h3>
            <p className="mb-6">
              Silakan login menggunakan akun Google di pojok kanan atas untuk
              mengakses Watchlist cloud kamu.
            </p>
          </div>
        ) : loading ? (
          // JIKA SEDANG LOADING
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : movies.length > 0 ? (
          // JIKA DATA ADA
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          // JIKA DATA KOSONG
          <div className="text-center mt-32 text-gray-500 animate-slide-up">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Watchlist Kosong 📭
            </h3>
            <p>
              Sepertinya kamu belum menambahkan anime atau film ke daftar
              tontonan awanmu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
