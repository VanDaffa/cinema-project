import React from "react";
import { useWatchlist } from "../context/WatchlistContext";
import MovieList from "../components/MovieList";
import { HiBookmarkSlash } from "react-icons/hi2";

const WatchlistPage = () => {
  const { watchlist } = useWatchlist();

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-24 px-4 pb-10">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 border-l-4 border-red-600 pl-4">
          My Watchlist{" "}
          <span className="text-gray-500 text-lg ml-2">
            ({watchlist.length})
          </span>
        </h2>

        {watchlist.length > 0 ? (
          <MovieList movies={watchlist} />
        ) : (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
            <HiBookmarkSlash className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-xl font-semibold">
              Belum ada film yang disimpan.
            </p>
            <p className="text-sm">
              Yuk, cari film favoritmu dan simpan di sini!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;
