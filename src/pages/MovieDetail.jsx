import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow";
// HAPUS: import { useWatchlist } from "../context/WatchlistContext"; (Sudah tidak dipakai)
import {
  HiPlus,
  HiCheck,
  HiPlay,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi2";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [loading, setLoading] = useState(true); // TAMBAHAN: State loading

  // === REFERENSI UNTUK SLIDER CAST ===
  const castSliderRef = useRef(null);
  const [isLeftEnd, setIsLeftEnd] = useState(true); // Default true karena mulai dari paling kiri
  const [isRightEnd, setIsRightEnd] = useState(false);

  const handleCastScroll = () => {
    if (castSliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = castSliderRef.current;
      // Mentok kiri kalau scrollLeft = 0
      setIsLeftEnd(scrollLeft === 0);
      // Mentok kanan kalau scrollLeft + clientWidth sama dengan scrollWidth (kasih toleransi 1px)
      setIsRightEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 1);
    }
  };

  // Cek posisi saat pertama kali render atau data cast berubah
  useEffect(() => {
    handleCastScroll();
  }, [cast]);

  const slideLeft = () => {
    let slider = castSliderRef.current;
    slider.scrollLeft = slider.scrollLeft - 400; // Geser 400px ke kiri
  };

  const slideRight = () => {
    let slider = castSliderRef.current;
    slider.scrollLeft = slider.scrollLeft + 400; // Geser 400px ke kanan
  };

  // State Firebase
  const [user, setUser] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // 1. Pantau siapa yang sedang login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch data film & Rekomendasi (Digabung jadi satu biar cepat)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Detail Utama
        const response = await axios.get(
          `${baseUrl}/movie/${id}?api_key=${apiKey}&append_to_response=videos,credits`,
        );
        setMovie(response.data);
        setCast(response.data.credits?.cast?.slice(0, 10) || []);

        const trailer = response.data.videos?.results?.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube",
        );
        setTrailerKey(trailer ? trailer.key : null);

        // Fetch Rekomendasi Pintar (Smart Fallback)
        let recRes = await axios.get(
          `${baseUrl}/movie/${id}/recommendations?api_key=${apiKey}`,
        );
        let recMovies = recRes.data.results;

        if (recMovies.length === 0) {
          recRes = await axios.get(
            `${baseUrl}/movie/${id}/similar?api_key=${apiKey}`,
          );
          recMovies = recRes.data.results;
        }

        if (recMovies.length === 0 && response.data.genres?.length > 0) {
          const firstGenreId = response.data.genres[0].id;
          recRes = await axios.get(
            `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${firstGenreId}`,
          );
          recMovies = recRes.data.results;
        }

        setRelatedMovies(recMovies);
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id, apiKey, baseUrl]);

  // 3. Cek apakah film ini sudah ada di Watchlist Firestore User
  useEffect(() => {
    const checkWatchlist = async () => {
      if (user && movie) {
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
        setIsSaved(false); // Reset jika tidak ada user
      }
    };
    checkWatchlist();
  }, [user, movie]);

  // 4. FUNGSI SAKTI: Simpan / Hapus dari Cloud
  const toggleWatchlist = async () => {
    if (!user) {
      alert("Nani?! Kamu harus login dulu untuk menyimpan film! 😠");
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
      } catch (error) {
        console.error("Gagal menghapus:", error);
      }
    } else {
      try {
        await setDoc(movieRef, {
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          savedAt: new Date().toISOString(),
        });
        setIsSaved(true);
      } catch (error) {
        console.error("Gagal menyimpan:", error);
      }
    }
  };

  const scrollToTrailer = () => {
    document
      .getElementById("trailer-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading || !movie)
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );

  const backdropUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
  const posterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

  return (
    <div className="bg-gray-900 text-white min-h-screen pb-10 animate-fade-in">
      <Navbar />

      {/* === HERO SECTION === */}
      <div
        className="relative w-full h-[70vh] md:h-[80vh] bg-cover bg-top" // Ubah bg-center jadi bg-top biar estetik anime
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
            <h1 className="text-3xl md:text-5xl font-bold mb-3 text-shadow leading-snug pb-2 max-w-4xl line-clamp-3">
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

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mb-2">
              {/* Tombol Watchlist */}
              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold border backdrop-blur-md transition-all duration-300 shadow-lg ${
                  isSaved
                    ? "bg-gray-800/80 border-gray-500 text-white hover:bg-gray-700"
                    : "bg-gray-600/40 border-white/30 text-white hover:bg-white hover:text-black"
                }`}
              >
                {isSaved ? (
                  <>
                    <HiCheck className="w-6 h-6 text-green-400" />
                    <span>Tersimpan</span>
                  </>
                ) : (
                  <>
                    <HiPlus className="w-6 h-6" />
                    <span>Watchlist</span>
                  </>
                )}
              </button>

              {/* Tombol Trailer */}
              {trailerKey && (
                <button
                  onClick={scrollToTrailer}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold bg-red-600/80 hover:bg-red-500 border border-red-500 backdrop-blur-md text-white transition-all duration-300 shadow-lg group"
                >
                  <HiPlay className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === CONTENT SECTION === */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-10">
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

          {trailerKey && (
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
          )}

          {/* CAST SECTION */}
          <div>
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-4">
              Top Cast
            </h2>

            {/* Wrapper Slider (Hapus 'group' karena tombol sekarang permanen) */}
            <div className="relative flex items-center">
              {/* Tombol Kiri (Tampil HANYA jika TIDAK mentok kiri) */}
              {!isLeftEnd && (
                <button
                  onClick={slideLeft}
                  // Hapus 'hidden md:block', 'opacity-0', dkk.
                  className="absolute left-0 z-10 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md -ml-4"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Area Daftar Cast */}
              <div
                ref={castSliderRef}
                onScroll={handleCastScroll} // <--- TAMBAHKAN PENDETEKSI SCROLL DI SINI
                className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth w-full"
              >
                {cast.map((actor) => (
                  <div
                    key={actor.id}
                    onClick={() => navigate(`/person/${actor.id}`)}
                    className="min-w-[100px] text-center group/actor cursor-pointer"
                  >
                    <div className="w-24 h-24 mx-auto mb-2 rounded-full overflow-hidden border-2 border-gray-700 group-hover/actor:border-red-600 transition-colors">
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
                    <p className="text-xs font-bold text-white group-hover/actor:text-red-500 line-clamp-1">
                      {actor.name}
                    </p>
                    <p className="text-[10px] text-gray-400 line-clamp-1">
                      {actor.character}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tombol Kanan (Tampil HANYA jika TIDAK mentok kanan) */}
              {!isRightEnd && cast.length > 0 && (
                <button
                  onClick={slideRight}
                  // Hapus 'hidden md:block', 'opacity-0', dkk.
                  className="absolute right-0 z-10 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full transition-all duration-300 backdrop-blur-sm shadow-md -mr-4"
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
              )}
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
      {relatedMovies.length > 0 && (
        <div className="container mx-auto px-4 mt-8 border-t border-gray-800 pt-8">
          <MovieRow
            title="Mungkin Kamu Suka"
            moviesData={relatedMovies}
            // TAMBAHAN BARU: Arahkan ke Browse
            onSelectGenre={() =>
              navigate(
                `/browse?type=recommendations&movieId=${movie.id}&title=${encodeURIComponent("Rekomendasi: " + movie.title)}`,
              )
            }
          />
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
