import React from 'react';
import Banner from './components/Banner';
import Row from './components/Row';
import { requests } from './services/tmdb';
import Navbar from './components/Navbar';

const HomeScreen = () => {
  return (
    <div className="bg-[#0f172a] min-h-screen">
      <Navbar />
      <Banner />
      <div className="pb-10 -mt-16 relative z-20">
        <Row title="Sedang Tayang di Bioskop" fetchUrl={requests.fetchTrending} isLargeRow icon="🔥" />
        <Row title="Segera Tayang (Upcoming)" fetchUrl={requests.fetchNetflixOriginals} isLargeRow icon="🚀" />
        <Row title="Trending Minggu Ini" fetchUrl={requests.fetchTopRated} icon="📈" />
        <Row title="Film Aksi Terbaik" fetchUrl={requests.fetchActionMovies} icon="⚔️" />
        <Row title="Keluarga & Komedi" fetchUrl={requests.fetchComedyMovies} icon="😂" />
        <Row title="Horror & Thriller" fetchUrl={requests.fetchHorrorMovies} icon="👻" />
        <Row title="Romansa Picisan" fetchUrl={requests.fetchRomanceMovies} icon="❤️" />
      </div>
    </div>
  );
};

export default HomeScreen;
