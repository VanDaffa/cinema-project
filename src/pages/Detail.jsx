import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import MovieList from "../components/MovieList";
import SkeletonCard from "../components/SkeletonCard";

const Detail = () => {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");

  // STATE LOADING DIBAGI DUA:
  // 1. loading: Buat loading pertama kali (muncul skeleton banyak)
  // 2. isFetchingMore: Buat loading saat scroll ke bawah (muncul spinner kecil)
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q");
  const actorId = searchParams.get("actorId");
  const actorName = searchParams.get("actorName");
  const genreId = searchParams.get("genreId");
  const genreName = searchParams.get("genreName");

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // 1. RESET LOGIC: Kalau user ganti kata pencarian/kategori, bersihkan semuanya
  useEffect(() => {
    setPage(1);
    setMovies([]);
    setTotalPages(1);
  }, [query, actorId, genreId, location.state]);

  // 2. FETCH LOGIC: Ambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      // Tentukan tipe loading
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      try {
        let url = "";

        if (query) {
          setTitle(`Hasil Pencarian: "${query}"`);
          url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${query}&page=${page}`;
        } else if (actorId) {
          setTitle(`Film oleh: ${actorName}`);
          url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_cast=${actorId}&sort_by=popularity.desc&page=${page}`;
        } else if (genreId) {
          setTitle(`Genre: ${genreName}`);
          url = `${baseUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`;
        } else if (location.state?.fetchUrl) {
          setTitle(location.state.title);
          url = `${location.state.fetchUrl}&page=${page}`;
        }

        if (url) {
          const res = await axios.get(url);

          // JIKA PAGE 1: Timpa data (karena ini pencarian baru)
          // JIKA PAGE > 1: Gabungkan data lama dengan data baru (Append)
          if (page === 1) {
            setMovies(res.data.results);
          } else {
            setMovies((prevMovies) => [...prevMovies, ...res.data.results]);
          }

          setTotalPages(res.data.total_pages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);

        // PENTING: Hanya scroll ke atas kalau ini halaman 1 (pencarian baru)
        if (page === 1) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };

    fetchData();
  }, [page, query, actorId, genreId, location.state, apiKey, baseUrl]);

  // 3. SENSOR SCROLL (INFINITE SCROLL MAGIC) 🪄
  useEffect(() => {
    const handleScroll = () => {
      // Cek jarak layar saat ini dengan batas bawah dokumen
      // Angka 500 = Kita trigger loading saat user berjarak 500px sebelum mentok bawah biar mulus
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        // Kalau sedang tidak loading dan halaman masih ada sisa, gas tambah page!
        if (!loading && !isFetchingMore && page < totalPages) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };

    // Pasang kuping buat dengerin event scroll
    window.addEventListener("scroll", handleScroll);

    // Bersihkan kuping kalau komponen ditutup (Cleanup)
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, isFetchingMore, page, totalPages]); // Dependency array penting biar state-nya update

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-24 px-4 pb-10">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">
        {title}
      </h2>

      {/* LOADING AWAL: Skeleton 10 biji */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <MovieList movies={movies} />

          {/* LOADING SCROLL: Muncul di paling bawah pas lagi ngambil data */}
          {isFetchingMore && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          )}

          {/* INDIKATOR HABIS: Kalau user rajin scroll sampai halaman terakhir */}
          {!isFetchingMore && page >= totalPages && (
            <div className="text-center py-10 text-gray-500">
              <p>Sudah mencapai ujung dunia perfilman! 🎬</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center mt-20 text-gray-500">
          <p className="text-xl">Tidak ada film ditemukan.</p>
        </div>
      )}
    </div>
  );
};

export default Detail;
