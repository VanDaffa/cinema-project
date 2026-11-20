import axios from "axios";

const BASE_URL = "/api/tmdb";

// LANGUAGE      : bahasa untuk TEKS DESKRIPTIF (sinopsis, tagline, genre, biografi).
// TITLE_LANGUAGE: bahasa untuk JUDUL dan data daftar. Judul adalah nama, bukan kalimat:
//                 dipakai judul internasional (Inggris) agar mudah dikenali dan dicari,
//                 bukan terjemahan harfiah ("Odisei") atau aksara asli saat terjemahan tidak ada.
//                 Juga dipakai sebagai bahasa cadangan jika terjemahan Indonesia kosong.
export const LANGUAGE = 'id-ID';
export const TITLE_LANGUAGE = 'en-US';

const instance = axios.create({
  baseURL: BASE_URL,
});

const requests = {
  fetchTrending: `/trending/all/week?language=${TITLE_LANGUAGE}`,
  fetchNetflixOriginals: `/discover/tv?with_networks=213`,
  fetchTopRated: `/movie/top_rated?language=${TITLE_LANGUAGE}`,
  fetchActionMovies: `/discover/movie?with_genres=28`,
  fetchComedyMovies: `/discover/movie?with_genres=35`,
  fetchHorrorMovies: `/discover/movie?with_genres=27`,
  fetchRomanceMovies: `/discover/movie?with_genres=10749`,
  fetchDocumentaries: `/discover/movie?with_genres=99`,
  searchMovies: (query) => `/search/movie?query=${encodeURIComponent(query)}`,
};

const tmdbService = {
  // Item daftar datang dengan judul internasional + sinopsis Inggris. Untuk item yang diminta,
  // ambil sinopsis bahasa Indonesia; bila kosong, sinopsis Inggris tetap dipakai.
  withLocalizedOverview: async (items = []) =>
    Promise.all(
      items.map(async (item) => {
        if (!item) return item;
        const type = item.media_type === 'tv' ? 'tv' : 'movie';
        try {
          const res = await instance.get(`/${type}/${item.id}`, {
            params: { language: LANGUAGE },
          });
          return res.data?.overview
            ? { ...item, overview: res.data.overview, overviewLanguage: 'id' }
            : item;
        } catch (error) {
          console.error('Gagal memuat sinopsis Indonesia:', error);
          return item;
        }
      })
    ),

  getGenres: async (mediaType = "movie") => {
    if (mediaType === "person") return [];
    const endpoint =
      mediaType === "tv" ? "/genre/tv/list" : "/genre/movie/list";
    const res = await instance.get(endpoint, {
      params: { language: LANGUAGE },
    });
    return res.data.genres || [];
  },

  // Trending harian singkat untuk Zero-Query Dropdown di Navbar
  getTrendingQuick: async () => {
    const res = await instance.get("/trending/all/day", {
      params: { language: TITLE_LANGUAGE },
    });
    return (res.data.results || [])
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, 4);
  },

  // Pencarian Multi-Kategori (Film, Serial TV, dan Aktor/Aktris)
  searchMulti: async ({ query, page = 1 }) => {
    const res = await instance.get("/search/multi", {
      params: {
        query,
        page,
        include_adult: false,
        language: TITLE_LANGUAGE,
      },
    });

    const rawResults = res.data.results || [];
    const mediaResults = rawResults.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv",
    );
    const personResults = rawResults.filter(
      (item) => item.media_type === "person",
    );

    return {
      ...res.data,
      results: [...mediaResults, ...personResults],
      mediaResults,
      personResults,
    };
  },

  // Pencarian spesifik: 'movie' | 'tv' | 'person'
  searchMedia: async ({ mediaType = "movie", query, page = 1, year = "" }) => {
    const endpoint =
      mediaType === "person"
        ? "/search/person"
        : mediaType === "tv"
          ? "/search/tv"
          : "/search/movie";

    const params = {
      query,
      page,
      include_adult: false,
      language: TITLE_LANGUAGE,
    };

    if (year && mediaType !== "person") {
      if (mediaType === "tv") {
        params.first_air_date_year = year;
      } else {
        params.primary_release_year = year;
      }
    }

    const res = await instance.get(endpoint, { params });
    return res.data;
  },

  // Eksplorasi & Filter: 'movie' | 'tv' | 'person'
  discoverMedia: async ({
    mediaType = "movie",
    page = 1,
    sortBy = "popularity.desc",
    genreId = "",
    year = "",
    minRating = 0,
  }) => {
    if (mediaType === "person") {
      const res = await instance.get("/person/popular", {
        params: {
          page,
          language: TITLE_LANGUAGE,
        },
      });
      return res.data;
    }

    const endpoint = mediaType === "tv" ? "/discover/tv" : "/discover/movie";
    const params = {
      page,
      sort_by: sortBy,
      include_adult: false,
      language: TITLE_LANGUAGE,
      "vote_count.gte": sortBy === "vote_average.desc" ? 200 : 20,
    };

    if (genreId) params.with_genres = genreId;
    if (year) {
      if (mediaType === "tv") {
        params.first_air_date_year = year;
      } else {
        params.primary_release_year = year;
      }
    }
    if (minRating > 0) params["vote_average.gte"] = minRating;

    const res = await instance.get(endpoint, { params });
    return res.data;
  },

  getRandomPick: async ({
    mediaType = "movie",
    genreId = "",
    minRating = 6.5,
  }) => {
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const data = await tmdbService.discoverMedia({
      mediaType,
      page: randomPage,
      sortBy: "popularity.desc",
      genreId,
      minRating,
    });
    const candidates = (data.results || []).filter((item) => item.poster_path);
    if (candidates.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const pick = { ...candidates[randomIndex], media_type: mediaType };
    const [withOverview] = await tmdbService.withLocalizedOverview([pick]);
    return withOverview;
  },

  getMediaDetail: async (mediaType = "movie", id) => {
    const prefix = mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`;
    const [detailIdRes, detailEnRes, creditsRes, videosRes, recRes, providersRes] =
      await Promise.all([
        // Indonesia: sinopsis, tagline, genre, status
        instance.get(prefix, { params: { language: LANGUAGE } }),
        // Internasional: judul + cadangan sinopsis bila terjemahan Indonesia kosong
        instance.get(prefix, { params: { language: TITLE_LANGUAGE } }),
        instance.get(`${prefix}/credits`, { params: { language: TITLE_LANGUAGE } }),
        // Trailer: kebanyakan berbahasa Inggris
        instance.get(`${prefix}/videos`, { params: { language: TITLE_LANGUAGE } }),
        instance.get(`${prefix}/recommendations`, {
          params: { language: TITLE_LANGUAGE },
        }),
        instance.get(`${prefix}/watch/providers`),
      ]);

    const idProviders = providersRes.data?.results?.ID || null;

    const detailId = detailIdRes.data || {};
    const detailEn = detailEnRes.data || {};
    const hasIndonesianOverview = Boolean(detailId.overview);

    const detail = {
      ...detailId,
      // Judul utama: internasional. Judul versi Indonesia disimpan terpisah untuk ditampilkan sebagai info.
      title: detailEn.title ?? detailId.title,
      name: detailEn.name ?? detailId.name,
      localizedTitle: detailId.title || detailId.name || '',
      overview: hasIndonesianOverview ? detailId.overview : detailEn.overview || '',
      tagline: hasIndonesianOverview ? detailId.tagline : detailEn.tagline || '',
      overviewLanguage: hasIndonesianOverview ? 'id' : detailEn.overview ? 'en' : null,
    };

    return {
      detail,
      cast: creditsRes.data?.cast || [],
      videos: videosRes.data?.results || [],
      recommendations: recRes.data?.results || [],
      watchProviders: idProviders,
    };
  },

  getCollection: async (collectionId) => {
    const res = await instance.get(`/collection/${collectionId}`, {
      params: { language: TITLE_LANGUAGE },
    });
    const parts = (res.data?.parts || []).sort((a, b) => {
      const dateA = a.release_date
        ? new Date(a.release_date).getTime()
        : 9999999999999;
      const dateB = b.release_date
        ? new Date(b.release_date).getTime()
        : 9999999999999;
      return dateA - dateB;
    });
    return { ...res.data, parts };
  },
};

export default instance;
export { requests, tmdbService };
