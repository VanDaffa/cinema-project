import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import axios, { requests, tmdbService } from '../services/tmdb';import { getDisplayTitle } from '../utils/title';

import { HiPlay, HiInformationCircle, HiStar } from 'react-icons/hi2';

import 'swiper/css';
import 'swiper/css/effect-fade';

const Banner = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const request = await axios.get(requests.fetchTrending);
        const filtered = (request.data.results || [])
          .filter((item) => item.backdrop_path && item.media_type !== 'person')
          .slice(0, 5);
        // Judul tetap internasional; sinopsis memakai bahasa Indonesia bila tersedia
        const withOverview = await tmdbService.withLocalizedOverview(filtered);
        if (isMounted) {
          setMovies(withOverview);
        }
      } catch (error) {
        console.error('Gagal memuat banner trending:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const truncate = (str, n) => {
    if (!str) return '';
    return str.length > n ? `${str.slice(0, n - 1)}...` : str;
  };

  if (loading) {
    return (
      <div className="relative w-full h-[70vh] lg:h-[82vh] bg-slate-900 animate-pulse flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl space-y-4">
            <div className="h-12 bg-slate-800 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-800 rounded w-1/3" />
            <div className="h-20 bg-slate-800 rounded-xl w-full" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-36 bg-slate-800 rounded-full" />
              <div className="h-11 w-36 bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="relative w-full h-[72vh] lg:h-[84vh]">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        loop={movies.length > 1}
        className="w-full h-full"
      >
        {movies.map((movie) => {
          const isTv =
            movie.media_type === 'tv' || Boolean(movie.first_air_date && !movie.release_date);
          const detailPath = isTv ? `/tv/${movie.id}` : `/movie/${movie.id}`;
          const title = getDisplayTitle(movie);
          const releaseYear =
            movie?.release_date?.slice(0, 4) || movie?.first_air_date?.slice(0, 4) || 'TBA';

          return (
            <SwiperSlide key={`${movie.media_type || 'item'}_${movie.id}`}>
              <div
                className="w-full h-full bg-cover bg-center relative flex items-center"
                style={{
                  backgroundImage: `url("https://image.tmdb.org/t/p/original${movie.backdrop_path}")`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent z-10" />
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-transparent z-10" />

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12">
                  <div className="max-w-2xl">
                    <h1
                      className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-snug pb-2 text-white drop-shadow-lg line-clamp-2"
                      title={title}
                    >
                      {title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium mt-2 mb-4">
                      <span className="text-emerald-400 font-semibold">Trending</span>
                      <span className="border border-slate-500 px-1.5 py-0.5 rounded text-[11px] uppercase tracking-wider">
                        {isTv ? 'Serial TV' : 'Film'}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <HiStar className="w-4 h-4" />
                        {movie?.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                      </span>
                      <span>•</span>
                      <span>{releaseYear}</span>
                    </div>

                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-7 max-w-xl line-clamp-3">
                      {truncate(movie?.overview, 210)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5">
                      <Link
                        to={`${detailPath}?play=true`}
                        className="inline-flex items-center gap-2 bg-white hover:bg-red-600 text-slate-950 hover:text-white font-semibold rounded-full px-7 py-3 text-sm shadow-lg transition-all duration-300"
                      >
                        <HiPlay className="w-5 h-5" />
                        <span>Play Trailer</span>
                      </Link>
                      <Link
                        to={detailPath}
                        className="inline-flex items-center gap-2 bg-slate-800/85 hover:bg-slate-700 text-white font-semibold rounded-full px-7 py-3 text-sm border border-slate-600 backdrop-blur-sm transition-all duration-300"
                      >
                        <HiInformationCircle className="w-5 h-5" />
                        <span>Detail {isTv ? 'Serial' : 'Film'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default Banner;