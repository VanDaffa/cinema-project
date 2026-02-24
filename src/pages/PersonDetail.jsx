import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow";
import { useParams, useNavigate } from "react-router-dom";

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFullBio, setShowFullBio] = useState(false);

  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchPersonData = async () => {
      setLoading(true);
      try {
        // 1. Ambil Profil Aktor
        const personRes = await axios.get(
          `${baseUrl}/person/${id}?api_key=${apiKey}`,
        );
        setPerson(personRes.data);

        // 2. Ambil Daftar Film yang Dibintangi (Credits)
        const creditsRes = await axios.get(
          `${baseUrl}/person/${id}/movie_credits?api_key=${apiKey}`,
        );

        // Filter film yang ada posternya dan urutkan dari yang paling populer
        const sortedCredits = creditsRes.data.cast
          .filter((movie) => movie.poster_path)
          .sort((a, b) => b.popularity - a.popularity);

        setCredits(sortedCredits);
      } catch (error) {
        console.error("Error fetching person details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
    window.scrollTo(0, 0);
  }, [id, apiKey, baseUrl]);

  if (loading || !person) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/h632${person.profile_path}`
    : "https://via.placeholder.com/600x900?text=No+Image";

  return (
    <div className="bg-gray-900 text-white min-h-screen pb-10 animate-fade-in">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 md:pt-32">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* KOLOM KIRI: FOTO PROFIL & INFO PRIBADI */}
          <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6">
            <img
              src={profileUrl}
              alt={person.name}
              className="w-full rounded-xl shadow-2xl border border-gray-700 object-cover"
            />

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-red-500">
                Personal Info
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-400 font-semibold">Dikenal Sebagai</p>
                  <p>{person.known_for_department}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold">Jenis Kelamin</p>
                  <p>
                    {person.gender === 1
                      ? "Perempuan"
                      : person.gender === 2
                        ? "Laki-laki"
                        : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold">Tanggal Lahir</p>
                  <p>{person.birthday || "-"}</p>
                </div>
                {person.deathday && (
                  <div>
                    <p className="text-gray-400 font-semibold">Meninggal</p>
                    <p>{person.deathday}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 font-semibold">Tempat Lahir</p>
                  <p>{person.place_of_birth || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: NAMA, BIOGRAFI, & FILMOGRAFI */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {person.name}
            </h1>

            {/* Biografi */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4 border-l-4 border-red-600 pl-4">
                Biografi
              </h2>
              {person.biography ? (
                <>
                  <p
                    className={`text-gray-300 leading-relaxed text-justify ${showFullBio ? "" : "line-clamp-6"}`}
                  >
                    {person.biography}
                  </p>
                  {person.biography.length > 300 && (
                    <button
                      onClick={() => setShowFullBio(!showFullBio)}
                      className="text-red-500 hover:text-red-400 font-semibold mt-2 transition-colors flex items-center gap-1"
                    >
                      {showFullBio ? "Baca Lebih Sedikit" : "Baca Selengkapnya"}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">
                  Belum ada biografi untuk tokoh ini.
                </p>
              )}
            </div>

            {/* Deretan Film (Memanfaatkan komponen MovieRow yang sudah ada!) */}
            {credits.length > 0 && (
              <div className="-ml-4 md:-ml-6">
                <MovieRow
                  title="Dikenal Atas"
                  moviesData={credits}
                  // TAMBAHAN BARU: Arahkan ke Browse
                  onSelectGenre={() =>
                    navigate(
                      `/browse?type=person&personId=${person.id}&title=${encodeURIComponent("Filmografi: " + person.name)}`,
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
