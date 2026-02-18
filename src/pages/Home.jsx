import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";

const Home = () => {
  const [heroMovie, setHeroMovie] = useState(null);
  const navigate = useNavigate(); // Hook buat pindah halaman manual

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Endpoint API
  const requests = {
    popular: `${baseUrl}/movie/popular?api_key=${apiKey}`,
    trending: `${baseUrl}/trending/movie/week?api_key=${apiKey}`,
    topRated: `${baseUrl}/movie/top_rated?api_key=${apiKey}`,
    anime: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=16`,
    action: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=28`,
    horror: `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=27`,
  };

  useEffect(() => {
    const fetchHero = async () => {
      const res = await axios.get(requests.popular);
      const randomMovie =
        res.data.results[Math.floor(Math.random() * res.data.results.length)];
      setHeroMovie(randomMovie);
    };
    fetchHero();
  }, []);

  // Fungsi saat tombol "Lihat Semua" diklik
  // Kita kirim Data Judul & URL Endpoint ke halaman sebelah via State
  const handleViewAll = (title, fetchUrl) => {
    navigate("/browse", { state: { title, fetchUrl } });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen pb-10">
      {heroMovie && <Hero movie={heroMovie} />}

      {/* Container Carousel */}
      <div className="flex flex-col space-y-2 -mt-10 relative z-20">
        <MovieRow
          title="🔥 Sedang Trending"
          fetchUrl={requests.trending}
          onSelectGenre={() =>
            handleViewAll("🔥 Sedang Trending", requests.trending)
          }
        />
        <MovieRow
          title="⭐ Rating Tertinggi"
          fetchUrl={requests.topRated}
          onSelectGenre={() =>
            handleViewAll("⭐ Rating Tertinggi", requests.topRated)
          }
        />
        <MovieRow
          title="🎌 Anime Pilihan"
          fetchUrl={requests.anime}
          onSelectGenre={() =>
            handleViewAll("🎌 Anime Pilihan", requests.anime)
          }
        />
        <MovieRow
          title="👻 Horror Mencekam"
          fetchUrl={requests.horror}
          onSelectGenre={() =>
            handleViewAll("👻 Horror Mencekam", requests.horror)
          }
        />
      </div>
    </div>
  );
};

export default Home;
