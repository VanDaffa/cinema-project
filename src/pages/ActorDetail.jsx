import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../services/tmdb';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovieCard from '../components/MovieCard';
import { HiChevronLeft, HiChevronRight, HiUser } from 'react-icons/hi2';

const ActorDetail = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [movies, setMovies] = useState([]);
  const [showFullBio, setShowFullBio] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isLeftEnd, setIsLeftEnd] = useState(true);
  const [isRightEnd, setIsRightEnd] = useState(false);
  const sliderRef = useRef(null);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowFullBio(false);
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const [personReq, moviesReq] = await Promise.all([
          axios.get(`/person/${id}?api_key=${API_KEY}&language=en-US`),
          axios.get(`/person/${id}/movie_credits?api_key=${API_KEY}&language=en-US`),
        ]);

        if (!isMounted) return;

        setPerson(personReq.data);

        // Hapus duplikat film jika aktor memiliki peran ganda dan urutkan berdasarkan popularitas
        const uniqueMap = new Map();
        (moviesReq.data.cast || []).forEach((m) => {
          if (m.poster_path && !uniqueMap.has(m.id)) {
            uniqueMap.set(m.id, m);
          }
        });

        const sortedMovies = Array.from(uniqueMap.values())
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 15);

        setMovies(sortedMovies);
      } catch (error) {
        console.error('Gagal memuat profil pemeran:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, API_KEY]);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setIsLeftEnd(scrollLeft <= 2);
    setIsRightEnd(Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 2);
  };

  useEffect(() => {
    handleScroll();
  }, [movies, loading]);

  const slideLeft = () => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const slideRight = () => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: 400, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16 animate-pulse">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-full md:w-72 lg:w-80 aspect-[2/3] bg-slate-800 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-5">
              <div className="h-10 bg-slate-800 rounded-xl w-1/2" />
              <div className="h-40 bg-slate-800 rounded-xl w-full" />
              <div className="h-56 bg-slate-800 rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Profil tidak ditemukan</h1>
          <p className="text-slate-400 text-sm mb-6">
            Data pemeran yang kamu cari tidak tersedia.
          </p>
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const bioText = person.biography || 'Belum ada informasi biografi untuk pemeran ini.';
  const isLongBio = bioText.length > 480;
  const displayedBio = showFullBio || !isLongBio ? bioText : `${bioText.slice(0, 480)}...`;

  return (
    <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Kolom Kiri: Foto & Info Personal */}
          <aside className="w-full md:w-72 lg:w-80 shrink-0">
            <div className="w-56 sm:w-64 md:w-full mx-auto aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 mb-6 flex items-center justify-center">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HiUser className="w-20 h-20 text-slate-600" />
              )}
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-5 pb-3 border-b border-slate-800 flex items-center gap-2.5">
                <span className="w-1 h-5 bg-red-600 rounded-full" />
                <span>Informasi Personal</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Dikenal Sebagai</p>
                  <p className="font-semibold text-slate-100">
                    {person.known_for_department || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Jenis Kelamin</p>
                  <p className="font-semibold text-slate-100">
                    {person.gender === 1
                      ? 'Perempuan'
                      : person.gender === 2
                      ? 'Laki-laki'
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Tanggal Lahir</p>
                  <p className="font-semibold text-slate-100">{person.birthday || '-'}</p>
                </div>
                {person.deathday && (
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Tanggal Wafat</p>
                    <p className="font-semibold text-slate-100">{person.deathday}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Tempat Lahir</p>
                  <p className="font-semibold text-slate-100">
                    {person.place_of_birth || '-'}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Kolom Kanan: Biografi & Filmografi Simetris */}
          <div className="flex-1 min-w-0 w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-snug pb-2 mb-6 tracking-tight">
              {person.name}
            </h1>

            {/* Section Biografi */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1 h-6 bg-red-600 rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold">Biografi</h2>
              </div>

              <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {displayedBio}
              </div>

              {isLongBio && (
                <button
                  type="button"
                  onClick={() => setShowFullBio((prev) => !prev)}
                  className="mt-3 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors"
                >
                  {showFullBio ? 'Sembunyikan' : 'Baca Selengkapnya'}
                </button>
              )}
            </section>

            {/* Section Dikenal Atas (Sejajar Kiri & Kanan dengan Biografi) */}
            {movies.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-1 h-6 bg-red-600 rounded-full" />
                  <h2 className="text-xl sm:text-2xl font-bold">Dikenal Atas</h2>
                </div>

                <div className="relative flex items-center">
                  {!isLeftEnd && (
                    <button
                      type="button"
                      onClick={slideLeft}
                      aria-label="Geser filmografi ke kiri"
                      className="absolute -left-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md backdrop-blur-sm transition-colors"
                    >
                      <HiChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  <div
                    ref={sliderRef}
                    onScroll={handleScroll}
                    className="flex items-stretch gap-4 overflow-x-auto scrollbar-hide py-2 w-full"
                  >
                    {movies.map((movie) => (
                      <div key={movie.id} className="w-36 sm:w-40 md:w-44 shrink-0">
                        <MovieCard movie={movie} />
                      </div>
                    ))}
                  </div>

                  {!isRightEnd && (
                    <button
                      type="button"
                      onClick={slideRight}
                      aria-label="Geser filmografi ke kanan"
                      className="absolute -right-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md backdrop-blur-sm transition-colors"
                    >
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ActorDetail;