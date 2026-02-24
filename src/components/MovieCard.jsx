import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import toast from "react-hot-toast";

// === IMPORT FIREBASE ===
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  // State Firebase
  const [user, setUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // 1. Pantau User Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Cek apakah film ini ada di Watchlist Firebase
  useEffect(() => {
    const checkWatchlist = async () => {
      if (user && movie?.id) {
        const movieRef = doc(
          db,
          "users",
          user.uid,
          "watchlist",
          movie.id.toString(),
        );
        const docSnap = await getDoc(movieRef);
        if (docSnap.exists()) {
          setIsSaved(true);
        } else {
          setIsSaved(false);
        }
      } else {
        setIsSaved(false);
      }
    };
    checkWatchlist();
  }, [user, movie]);

  // 3. Fungsi Tambah/Hapus via Ikon Hati
  const handleToggleWatchlist = async (e) => {
    e.stopPropagation();

    if (!user) {
      // UBAH: Alert kaku menjadi toast
      toast.error(
        "Kamu harus login dulu untuk menggunakan fitur Watchlist! 🔒",
      );
      return;
    }

    const movieRef = doc(
      db,
      "users",
      user.uid,
      "watchlist",
      movie.id.toString(),
    );

    if (isSaved) {
      try {
        await deleteDoc(movieRef);
        setIsSaved(false);
        toast.success("Dihapus dari Watchlist! 🗑️"); // Feedback visual
      } catch (error) {
        console.error("Gagal menghapus dari watchlist:", error);
        toast.error("Terjadi kesalahan.");
      }
    } else {
      try {
        await setDoc(movieRef, {
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          release_date: movie.release_date || movie.first_air_date,
          vote_average: movie.vote_average,
          savedAt: new Date().toISOString(),
        });
        setIsSaved(true);
        toast.success("Tersimpan di Watchlist! ❤️"); // Feedback visual
      } catch (error) {
        console.error("Gagal menyimpan ke watchlist:", error);
        toast.error("Terjadi kesalahan.");
      }
    }
  };

  if (!movie.poster_path) return null;

  const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <div
      onClick={() => navigate(`/movie/${movie.id}`)}
      className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out hover:z-10 animate-slide-up"
    >
      <img
        src={imageUrl}
        alt={movie.title || movie.name}
        className="w-full h-auto object-cover"
        loading="lazy"
      />

      {/* LAPISAN OVERLAY HITAM SAAT DI-HOVER */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 md:p-4">
        {/* IKON HATI (WATCHLIST) DI POJOK KANAN ATAS */}
        <button
          onClick={handleToggleWatchlist}
          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors z-20"
        >
          {isSaved ? (
            <HiHeart className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          ) : (
            <HiOutlineHeart className="w-5 h-5 md:w-6 md:h-6 text-white hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* INFO FILM */}
        <h3 className="text-white text-xs md:text-sm font-bold truncate">
          {movie.title || movie.name}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-300 text-[10px] md:text-xs">
            {movie.release_date ? movie.release_date.split("-")[0] : ""}
          </p>
          <div className="flex items-center gap-1 bg-gray-900/80 px-1.5 py-0.5 rounded text-[10px] md:text-xs">
            <span className="text-yellow-400">⭐</span>
            <span className="text-white font-bold">
              {movie.vote_average?.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
