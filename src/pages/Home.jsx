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

  // DAFTAR API LENGKAP (Koleksi Supermarket Kita)
  const requests = {
    // 1. Kategori Utama (Cinema Vibes)
    nowPlaying: `${baseUrl}/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`,
    upcoming: `${baseUrl}/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`,
    trending: `${baseUrl}/trending/movie/week?api_key=${apiKey}&language=en-US`,
    topRated: `${baseUrl}/movie/top_rated?api_key=${apiKey}&language=en-US`,

    // 2. Genre Populer
    action: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=28`,
    comedy: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=35`,
    horror: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=27`,
    romance: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=10749`,
    scifi: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=878`,

    // 3. Niche & Spesifik
    anime: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16`, // Animasi
    mystery: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=9648`,
    drama: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=18`,
    korean: `${baseUrl}/discover/movie?api_key=${apiKey}&with_original_language=ko`, // Film Korea
  };

  useEffect(() => {
    const fetchHero = async () => {
      // Kita ambil Hero dari "Now Playing" biar terasa Fresh/Bioskop banget
      const res = await axios.get(requests.nowPlaying);
      const randomMovie =
        res.data.results[Math.floor(Math.random() * res.data.results.length)];
      setHeroMovie(randomMovie);
    };
    fetchHero();
  }, []);

  const handleViewAll = (title, fetchUrl) => {
    navigate("/browse", { state: { title, fetchUrl } });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen pb-10">
      {/* Hero Section */}
      {heroMovie && <Hero movie={heroMovie} />}

      {/* Container Carousel - Margin Top negatif biar numpuk dikit ke Hero */}
      <div className="flex flex-col relative z-20 px-4 md:px-0 container mx-auto">
        {/* === SEGMEN 1: WAJIB NONTON (HOT) === */}
        <MovieRow
          title="🔥 Sedang Tayang di Bioskop"
          fetchUrl={requests.nowPlaying}
          onSelectGenre={() =>
            handleViewAll("Sedang Tayang", requests.nowPlaying)
          }
        />
        <MovieRow
          title="🚀 Segera Tayang (Upcoming)"
          fetchUrl={requests.upcoming}
          onSelectGenre={() =>
            handleViewAll("Segera Tayang", requests.upcoming)
          }
        />
        <MovieRow
          title="📈 Trending Minggu Ini"
          fetchUrl={requests.trending}
          onSelectGenre={() =>
            handleViewAll("Trending Minggu Ini", requests.trending)
          }
        />

        {/* === SEGMEN 2: GENRE FAVORIT === */}
        <MovieRow
          title="🎌 Anime & Animasi"
          fetchUrl={requests.anime}
          onSelectGenre={() => handleViewAll("Anime & Animasi", requests.anime)}
        />
        <MovieRow
          title="💥 Action & Petualangan"
          fetchUrl={requests.action}
          onSelectGenre={() => handleViewAll("Action", requests.action)}
        />
        <MovieRow
          title="🤣 Komedi Pengocok Perut"
          fetchUrl={requests.comedy}
          onSelectGenre={() => handleViewAll("Komedi", requests.comedy)}
        />

        {/* === SEGMEN 3: PILIHAN EDITOR === */}
        <MovieRow
          title="⭐ Kritikus Memuji (Top Rated)"
          fetchUrl={requests.topRated}
          onSelectGenre={() => handleViewAll("Top Rated", requests.topRated)}
        />
        <MovieRow
          title="👻 Horror Mencekam"
          fetchUrl={requests.horror}
          onSelectGenre={() => handleViewAll("Horror", requests.horror)}
        />
        <MovieRow
          title="💖 Romantis Bikin Baper"
          fetchUrl={requests.romance}
          onSelectGenre={() => handleViewAll("Romance", requests.romance)}
        />

        {/* === SEGMEN 4: EKSPLORASI === */}
        <MovieRow
          title="👽 Sci-Fi & Fantasi"
          fetchUrl={requests.scifi}
          onSelectGenre={() => handleViewAll("Sci-Fi", requests.scifi)}
        />
        <MovieRow
          title="🇰🇷 Film Korea Populer"
          fetchUrl={requests.korean}
          onSelectGenre={() => handleViewAll("Film Korea", requests.korean)}
        />
        <MovieRow
          title="🕵️ Misteri & Detektif"
          fetchUrl={requests.mystery}
          onSelectGenre={() => handleViewAll("Misteri", requests.mystery)}
        />
      </div>
    </div>
  );
};

export default Home;
