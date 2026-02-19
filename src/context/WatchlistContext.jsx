import React, { createContext, useContext, useEffect, useState } from "react";

const WatchlistContext = createContext();

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([]);

  // 1. Load data dari LocalStorage saat aplikasi pertama dibuka
  useEffect(() => {
    const storedWatchlist = localStorage.getItem("myWatchlist");
    if (storedWatchlist) {
      setWatchlist(JSON.parse(storedWatchlist));
    }
  }, []);

  // 2. Setiap kali watchlist berubah, simpan ulang ke LocalStorage
  useEffect(() => {
    localStorage.setItem("myWatchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Fungsi: Tambah ke Watchlist
  const addToWatchlist = (movie) => {
    // Cek dulu biar gak ada duplikat
    const isExist = watchlist.find((item) => item.id === movie.id);
    if (!isExist) {
      setWatchlist((prev) => [...prev, movie]);
    }
  };

  // Fungsi: Hapus dari Watchlist
  const removeFromWatchlist = (id) => {
    setWatchlist((prev) => prev.filter((movie) => movie.id !== id));
  };

  // Fungsi: Cek apakah film sudah ada di Watchlist (return true/false)
  const isInWatchlist = (id) => {
    return watchlist.some((movie) => movie.id === id);
  };

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};
