import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow"; // Kita reuse komponen ini buat rekomendasi

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cast, setCast] = useState([]);

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // URL buat Rekomendasi (Mirip dengan film ini)
  const recommendationUrl = `${baseUrl}/movie/${id}/recommendations?api_key=${apiKey}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/movie/${id}?api_key=${apiKey}&append_to_response=videos,credits`,
        );

        setMovie(response.data);
        setCast(response.data.credits.cast.slice(0, 10));

        const trailer = response.data.videos.results.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube",
        );
        setTrailerKey(trailer ? trailer.key : null);
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

  // Fungsi navigasi buat "Lihat Semua" di bagian rekomendasi
  const handleViewAll = (title, fetchUrl) => {
    navigate("/browse", { state: { title, fetchUrl } });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen pb-10">
      <Navbar />

      {/* === HEADER SECTION (Backdrop) === */}
      <div
        className="relative w-full h-[70vh] md:h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>

        {/* Konten Header */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 flex flex-col md:flex-row gap-6 md:gap-8 items-end z-10">
          {/* Poster (Hidden Mobile, Block Desktop) */}
          <img
            src={posterUrl}
            alt={movie.title}
            className="hidden md:block w-48 rounded-lg shadow-2xl border-2 border-white/20 hover:scale-105 transition-transform duration-300"
          />

          <div className="flex-1 w-full">
            {/* REVISI 1: Judul Responsif biar gak nabrak Navbar */}
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-shadow leading-tight max-w-4xl">
              {movie.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-300 mb-4">
              <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-md">
                {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
              </span>
              <span className="flex items-center text-yellow-400 font-semibold">
                ⭐ {movie.vote_average.toFixed(1)}
              </span>
              <span>⏱ {movie.runtime} min</span>

              {/* REVISI 2: Genre Chips (OCD Friendly) */}
              <div className="flex flex-wrap gap-2 ml-2">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className="
                      px-3 py-0.5 
                      border border-gray-400 bg-gray-800/60 backdrop-blur-sm 
                      rounded-full text-xs text-gray-100 font-medium
                      flex items-center justify-center
                      hover:bg-white hover:text-black transition-colors cursor-default
                    "
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-base md:text-lg text-gray-300 italic mb-3 opacity-90">
              "{movie.tagline}"
            </p>

            <p className="text-sm md:text-base text-gray-200 max-w-3xl line-clamp-4 md:line-clamp-none leading-relaxed">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>

      {/* === CONTENT SECTION === */}
      {/* REVISI 3: items-start biar Info Card lurus sama Trailer */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Kiri: Trailer & Cast */}
        <div className="lg:col-span-2 space-y-10">
          {/* TRAILER */}
          {trailerKey ? (
            <div>
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-4">
                Official Trailer
              </h2>
              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-gray-800">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailerKey}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-800 rounded-lg text-center text-gray-400">
              Trailer belum tersedia untuk saat ini.
            </div>
          )}

          {/* CAST */}
          <div>
            <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-4">
              Top Cast
            </h2>
            {/* Scrollbar hide tapi bisa discroll */}
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
                  <p className="text-xs font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">
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

        {/* Kanan: Info Tambahan */}
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
              <span className="text-gray-400">Bahasa Asli</span>
              <span className="uppercase font-semibold">
                {movie.original_language}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Budget</span>
              <span className="font-semibold">
                {movie.budget > 0 ? `$${movie.budget.toLocaleString()}` : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Revenue</span>
              <span className="font-semibold">
                {movie.revenue > 0 ? `$${movie.revenue.toLocaleString()}` : "-"}
              </span>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Produksi</p>
              <p className="font-semibold text-right leading-relaxed text-gray-200">
                {movie.production_companies.map((c) => c.name).join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* === REVISI 4: REKOMENDASI (Carousel) === */}
      <div className="container mx-auto px-4 mt-8 border-t border-gray-800 pt-8">
        <MovieRow
          title="Mungkin Kamu Suka"
          fetchUrl={recommendationUrl}
          onSelectGenre={(movies) =>
            handleViewAll("Rekomendasi Film", recommendationUrl)
          }
        />
      </div>
    </div>
  );
};

export default MovieDetail;
