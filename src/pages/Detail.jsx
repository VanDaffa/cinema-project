import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import MovieList from "../components/MovieList";
import SkeletonCard from "../components/SkeletonCard"; // Import Skeleton

const Detail = () => {
  const [movies, setMovies] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // STATE PAGINATION
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Ambil semua parameter kemungkinan
  const query = searchParams.get("q");
  const actorId = searchParams.get("actorId");
  const actorName = searchParams.get("actorName");
  const genreId = searchParams.get("genreId"); // Parameter Baru
  const genreName = searchParams.get("genreName"); // Parameter Baru

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Reset page ke 1 kalau parameter pencarian berubah (misal ganti kata kunci)
  useEffect(() => {
    setPage(1);
    setMovies([]); // Kosongkan dulu biar skeleton muncul
  }, [query, actorId, genreId, location.state]);

  // Fetch Data Utama (Termasuk Pagination)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = "";

        // Tentukan URL berdasarkan Jenis Pencarian
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
          // Tambahkan &page= di ujung URL yang dikirim dari Home
          url = `${location.state.fetchUrl}&page=${page}`;
        }

        if (url) {
          const res = await axios.get(url);
          setMovies(res.data.results);
          setTotalPages(res.data.total_pages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        // Scroll ke atas setiap ganti halaman, smooth
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    fetchData();
  }, [page, query, actorId, genreId, location.state, apiKey, baseUrl]);

  // Fungsi Ganti Halaman
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen pt-24 px-4 pb-10">
      <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">
        {title}
      </h2>

      {/* KONDISI LOADING: Tampilkan Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Buat Array kosong isi 10 buat looping skeleton */}
          {[...Array(10)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <MovieList movies={movies} />

          {/* TOMBOL PAGINATION */}
          <div className="flex justify-center items-center mt-10 gap-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <span className="text-gray-400">
              Page <span className="text-white font-bold">{page}</span> of{" "}
              {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-800 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
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
