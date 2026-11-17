import React, { useState, useEffect } from 'react';
import axios from '../services/tmdb';
import { requests } from '../services/tmdb';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';

import 'swiper/css';
import 'swiper/css/effect-fade';

const Banner = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const request = await axios.get(requests.fetchTrending);
      // Ambil 5 film trending teratas untuk carousel
      setMovies(request.data.results.slice(0, 5));
      return request;
    }
    fetchData();
  }, []);

  function truncate(str, n) {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  }

  return (
    <div className="relative w-full h-[70vh] lg:h-[85vh]">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <div
              className="w-full h-full bg-cover bg-center relative flex items-center"
              style={{
                backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/70 to-transparent z-10" />
              <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0f172a] to-transparent z-10" />
              
              <div className="relative z-20 pl-8 md:pl-16 lg:pl-24 max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold pb-2 text-white drop-shadow-xl tracking-wide">
                  {movie?.title || movie?.name || movie?.original_name}
                </h1>
                
                <div className="flex gap-3 text-sm text-gray-300 font-semibold mb-4 mt-2 items-center">
                  <span className="text-green-500">New Release</span>
                  <span className="border border-gray-500 px-1 rounded text-xs">HD</span>
                  <span>⭐ {movie?.vote_average?.toFixed(1)}</span>
                  <span>{movie?.release_date?.substring(0,4) || movie?.first_air_date?.substring(0,4)}</span>
                </div>

                <p className="w-full text-gray-200 text-sm md:text-base leading-relaxed drop-shadow-md mb-6 max-w-xl">
                  {truncate(movie?.overview, 200)}
                </p>
                
                <div className="flex gap-4">
                  <Link 
                    to={`/movie/${movie.id}?play=true`}
                    className="flex items-center gap-2 cursor-pointer text-black font-bold rounded shadow-lg px-8 py-3 bg-white hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    <FaPlay /> Play Now
                  </Link>
                  <Link 
                    to={`/movie/${movie.id}`}
                    className="flex items-center gap-2 cursor-pointer text-white font-bold rounded shadow-lg px-8 py-3 bg-gray-800/80 border border-gray-600 hover:bg-gray-700 transition-all duration-300"
                  >
                    <FaInfoCircle /> More Info
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Banner;
