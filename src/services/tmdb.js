import axios from "axios";

const BASE_URL = "/api/tmdb";

const instance = axios.create({
  baseURL: BASE_URL,
});

const requests = {
  fetchTrending: `/trending/all/week?language=en-US`,
  fetchNetflixOriginals: `/discover/tv?with_networks=213`,
  fetchTopRated: `/movie/top_rated?language=en-US`,
  fetchActionMovies: `/discover/movie?with_genres=28`,
  fetchComedyMovies: `/discover/movie?with_genres=35`,
  fetchHorrorMovies: `/discover/movie?with_genres=27`,
  fetchRomanceMovies: `/discover/movie?with_genres=10749`,
  fetchDocumentaries: `/discover/movie?with_genres=99`,
  searchMovies: (query) => `/search/movie?query=${encodeURIComponent(query)}`,
};

const tmdbService = {
  getGenres: async (mediaType = "movie") => {
    if (mediaType === "person") return [];
    const endpoint =
      mediaType === "tv" ? "/genre/tv/list" : "/genre/movie/list";
    const res = await instance.get(endpoint, {
      params: { language: "en-US" },
    });
    return res.data.genres || [];
  },

  // Trending harian singkat untuk Zero-Query Dropdown di Navbar
  getTrendingQuick: async () => {
    const res = await instance.get("/trending/all/day", {
      params: { language: "en-US" },
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
        language: "en-US",
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
      language: "en-US",
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
          language: "en-US",
        },
      });
      return res.data;
    }

    const endpoint = mediaType === "tv" ? "/discover/tv" : "/discover/movie";
    const params = {
      page,
      sort_by: sortBy,
      include_adult: false,
      language: "en-US",
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
    return { ...candidates[randomIndex], media_type: mediaType };
  },

  getMediaDetail: async (mediaType = "movie", id) => {
    const prefix = mediaType === "tv" ? `/tv/${id}` : `/movie/${id}`;
    const [detailRes, creditsRes, videosRes, recRes, providersRes] =
      await Promise.all([
        instance.get(prefix, { params: { language: "en-US" } }),
        instance.get(`${prefix}/credits`, { params: { language: "en-US" } }),
        instance.get(`${prefix}/videos`, { params: { language: "en-US" } }),
        instance.get(`${prefix}/recommendations`, {
          params: { language: "en-US" },
        }),
        instance.get(`${prefix}/watch/providers`),
      ]);

    const idProviders = providersRes.data?.results?.ID || null;

    return {
      detail: detailRes.data,
      cast: creditsRes.data?.cast || [],
      videos: videosRes.data?.results || [],
      recommendations: recRes.data?.results || [],
      watchProviders: idProviders,
    };
  },

  getCollection: async (collectionId) => {
    const res = await instance.get(`/collection/${collectionId}`, {
      params: { language: "en-US" },
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
