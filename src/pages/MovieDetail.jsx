import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow";
import { useWatchlist } from "../context/WatchlistContext";
import { HiPlus, HiCheck, HiPlay } from "react-icons/hi2";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);

  // State khusus buat Rekomendasi Pintar
  const [relatedMovies, setRelatedMovies] = useState([]);

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const isSaved = movie ? isInWatchlist(movie.id) : false;

  const handleToggleWatchlist = () => {
    isSaved ? removeFromWatchlist(movie.id) : addToWatchlist(movie);
  };

  const scrollToTrailer = () => {
    document
      .getElementById("trailer-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Detail Utama
        const response = await axios.get(
          `${baseUrl}/movie/${id}?api_key=${apiKey}&append_to_response=videos,credits`,
        );
        setMovie(response.data);
        setCast(response.data.credits.cast.slice(0, 10));

        const trailer = response.data.videos.results.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube",
        );
        setTrailerKey(trailer ? trailer.key : null);

        // 2. LOGIKA REKOMENDASI PINTAR (Smart Fallback)
        // Coba ambil Rekomendasi resmi dulu
        let recRes = await axios.get(
          `${baseUrl}/movie/${id}/recommendations?api_key=${apiKey}`,
        );
        let recMovies = recRes.data.results;

        // Kalau kosong, coba ambil Similar Movies (Film yang mirip genrenya)
        if (recMovies.length === 0) {
          console.log("Rekomendasi kosong, mengambil Similar Movies...");
          recRes = await axios.get(
            `${baseUrl}/movie/${id}/similar?api_key=${apiKey}`,
          );
          recMovies = recRes.data.results;
        }

        // Kalau MASIH kosong, ambil film dari Genre yang sama (Fallback terakhir)
        if (recMovies.length === 0 && response.data.genres.length > 0) {
          console.log("Similar kosong, mengambil berdasarkan Genre...");
          const firstGenreId = response.data.genres[0].id;
          recRes = await axios.get(
            `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${firstGenreId}`,
          );
          recMovies = recRes.data.results;
        }

        setRelatedMovies(recMovies);
      } catch (error) {
        console.error("Error fetching detail:", error);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id, apiKey, baseUrl]);

  if (!movie)
    return <div className="text-white text-center mt-20">Loading...</div>;

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  const handleViewAll = () => {
    // Kita kirim data yang sudah kita filter tadi ke halaman Browse
    navigate("/browse", {
      state: { title: "Rekomendasi Film", fetchUrl: null },
    });
    // Catatan: Idealnya kirim URL, tapi karena kita pakai data manual,
    // fitur View All di sini mungkin perlu penyesuaian.
    // Untuk sekarang kita biarkan MovieRow menghandle navigasi sederhana.
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen pb-10 animate-fade-in">
      <Navbar />

      {/* === HERO SECTION (Sudah Bebas Sinopsis) === */}
      <div
        className="relative w-full h-[70vh] md:h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row gap-6 md:gap-8 items-end z-10">
          <img
            src={posterUrl}
            alt={movie.title}
            className="hidden md:block w-48 rounded-lg shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300"
          />

          <div className="flex-1 w-full">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 text-shadow leading-tight max-w-4xl">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300 mb-4">
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 px-2 py-0.5 rounded text-white font-medium">
                {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
              </span>
              <span className="flex items-center text-yellow-400 font-bold">
                ⭐ {movie.vote_average.toFixed(1)}
              </span>
              <span>•</span>
              <span>{movie.runtime} min</span>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className="text-gray-300 text-sm hover:text-red-500 cursor-default transition-colors"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-base md:text-lg text-gray-400 italic mb-6">
              {movie.tagline && `"${movie.tagline}"`}
            </p>

            {/* BUTTONS (Tetap Ada) */}
            <div className="flex flex-wrap gap-4 mb-2">
              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-lg group ${
                  isSaved
                    ? "bg-gradient-to-r from-green-600 to-green-500 text-white"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {isSaved ? (
                  <HiCheck className="w-6 h-6" />
                ) : (
                  <HiPlus className="w-6 h-6" />
                )}
                {isSaved ? "Tersimpan" : "Watchlist"}
              </button>

              {trailerKey && (
                <button
                  onClick={scrollToTrailer}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-gray-600/40 hover:bg-red-600 border border-white/30 backdrop-blur-md text-white transition-all duration-300 group"
                >
                  <HiPlay className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Trailer
                </button>
              )}
            </div>

            {/* SINOPSIS DI SINI SUDAH DIHAPUS SECARA PERMANEN 🧹 */}
          </div>
        </div>
      </div>

      {/* === CONTENT SECTION === */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
          {/* BAGIAN STORYLINE: Sekarang tampil 100% penuh kalau ada sinopsisnya */}
          {movie.overview && (
            <div>
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-4">
                Storyline
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg text-justify">
                {movie.overview}
              </p>
            </div>
          )}

          {/* TRAILER SECTION */}
          {trailerKey ? (
            <div id="trailer-section">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-4">
                Official Trailer
              </h2>
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-gray-800">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="Trailer"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : null}

          {/* CAST SECTION */}
          <div>
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-4">
              Top Cast
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {cast.map((actor) => (
                <div
                  key={actor.id}
                  className="min-w-[100px] text-center group cursor-pointer"
                >
                  <div className="w-24 h-24 mx-auto mb-2 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-red-600 transition-colors">
                    <img
                      src={
                        actor.profile_path
                          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                          : "https://via.placeholder.com/200x300?text=No+Image"
                      }
                      alt={actor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-bold text-white group-hover:text-red-500 line-clamp-1">
                    {actor.name}
                  </p>
                  <p className="text-[10px] text-gray-400 line-clamp-1">
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INFO KANAN */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700 h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-6 text-red-500 border-b border-gray-700 pb-2">
            Info Film
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="font-semibold">{movie.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bahasa</span>
              <span className="uppercase font-semibold">
                {movie.original_language}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Budget</span>
              <span>
                {movie.budget > 0 ? `$${movie.budget.toLocaleString()}` : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Revenue</span>
              <span>
                {movie.revenue > 0 ? `$${movie.revenue.toLocaleString()}` : "-"}
              </span>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Produksi</p>
              <p className="font-semibold text-right text-gray-200">
                {movie.production_companies.map((c) => c.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === REKOMENDASI PINTAR === */}
      <div className="container mx-auto px-4 mt-8 border-t border-gray-800 pt-8">
        <MovieRow title="Mungkin Kamu Suka" moviesData={relatedMovies} />
      </div>
    </div>
  );
};

export default MovieDetail;
