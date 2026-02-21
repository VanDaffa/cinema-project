import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";

const Home = () => {
  const [heroMovie, setHeroMovie] = useState(null);
  const navigate = useNavigate();

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const requests = {
    nowPlaying: `${baseUrl}/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`,
    upcoming: `${baseUrl}/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`,
    trending: `${baseUrl}/trending/movie/week?api_key=${apiKey}&language=en-US`,
    topRated: `${baseUrl}/movie/top_rated?api_key=${apiKey}&language=en-US`,
    action: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=28`,
    comedy: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=35`,
    horror: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=27`,
    romance: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=10749`,
    scifi: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=878`,
    anime: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16`,
    mystery: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=9648`,
    korean: `${baseUrl}/discover/movie?api_key=${apiKey}&with_original_language=ko`,
  };

  useEffect(() => {
    const fetchHero = async () => {
      const res = await axios.get(requests.nowPlaying);
      const randomMovie =
        res.data.results[Math.floor(Math.random() * res.data.results.length)];
      setHeroMovie(randomMovie);
    };
    fetchHero();
  }, []);

  // LOGIKA BARU: Kirim kategori spesifik ke Discover
  const handleViewAll = (type, value, customTitle) => {
    if (type === "genre") {
      navigate(
        `/browse?type=genre&genreId=${value}&title=${encodeURIComponent(customTitle)}`,
      );
    } else if (type === "korean") {
      navigate(`/browse?type=korean&title=${encodeURIComponent(customTitle)}`);
    } else {
      // Untuk trending, now_playing, upcoming, top_rated
      navigate(
        `/browse?type=${value}&title=${encodeURIComponent(customTitle)}`,
      );
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen pb-10 animate-fade-in">
      {heroMovie && <Hero movie={heroMovie} />}

      <div className="flex flex-col relative z-20 px-4 md:px-0 container mx-auto">
        {/* === SEGMEN 1: WAJIB NONTON === */}
        <MovieRow
          title="🔥 Sedang Tayang di Bioskop"
          fetchUrl={requests.nowPlaying}
          onSelectGenre={() =>
            handleViewAll("special", "now_playing", "Sedang Tayang di Bioskop")
          }
        />
        <MovieRow
          title="🚀 Segera Tayang (Upcoming)"
          fetchUrl={requests.upcoming}
          onSelectGenre={() =>
            handleViewAll("special", "upcoming", "Segera Tayang (Upcoming)")
          }
        />
        <MovieRow
          title="📈 Trending Minggu Ini"
          fetchUrl={requests.trending}
          onSelectGenre={() =>
            handleViewAll("special", "trending", "Trending Minggu Ini")
          }
        />

        {/* === SEGMEN 2: GENRE FAVORIT === */}
        <MovieRow
          title="🎌 Anime & Animasi"
          fetchUrl={requests.anime}
          onSelectGenre={() => handleViewAll("genre", 16, "Anime & Animasi")}
        />
        <MovieRow
          title="💥 Action & Petualangan"
          fetchUrl={requests.action}
          onSelectGenre={() =>
            handleViewAll("genre", 28, "Action & Petualangan")
          }
        />
        <MovieRow
          title="🤣 Komedi Pengocok Perut"
          fetchUrl={requests.comedy}
          onSelectGenre={() =>
            handleViewAll("genre", 35, "Komedi Pengocok Perut")
          }
        />

        {/* === SEGMEN 3: PILIHAN EDITOR === */}
        <MovieRow
          title="⭐ Kritikus Memuji (Top Rated)"
          fetchUrl={requests.topRated}
          onSelectGenre={() =>
            handleViewAll("special", "top_rated", "Kritikus Memuji (Top Rated)")
          }
        />
        <MovieRow
          title="👻 Horror Mencekam"
          fetchUrl={requests.horror}
          onSelectGenre={() => handleViewAll("genre", 27, "Horror Mencekam")}
        />
        <MovieRow
          title="💖 Romantis Bikin Baper"
          fetchUrl={requests.romance}
          onSelectGenre={() =>
            handleViewAll("genre", 10749, "Romantis Bikin Baper")
          }
        />

        {/* === SEGMEN 4: EKSPLORASI === */}
        <MovieRow
          title="👽 Sci-Fi & Fantasi"
          fetchUrl={requests.scifi}
          onSelectGenre={() => handleViewAll("genre", 878, "Sci-Fi & Fantasi")}
        />
        <MovieRow
          title="🇰🇷 Film Korea Populer"
          fetchUrl={requests.korean}
          onSelectGenre={() =>
            handleViewAll("korean", null, "Film Korea Populer")
          }
        />
        <MovieRow
          title="🕵️ Misteri & Detektif"
          fetchUrl={requests.mystery}
          onSelectGenre={() =>
            handleViewAll("genre", 9648, "Misteri & Detektif")
          }
        />
      </div>
    </div>
  );
};

export default Home;
