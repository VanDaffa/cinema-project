import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { addSearchHistory } from '../utils/history';

// Seluruh state halaman pencarian & eksplorasi: kata kunci, filter, paginasi, sinkronisasi URL,
// dan pengambilan daftar film / serial TV / aktor dari TMDB.
export default function useSearchCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get('q') || '';
  const rawType = searchParams.get('type');
  const initialType = rawType === 'tv' || rawType === 'person' ? rawType : 'movie';
  const initialGenre = searchParams.get('genre') || '';
  const initialTitle = searchParams.get('title') || '';

  const [mediaType, setMediaType] = useState(initialType);
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedYear, setSelectedYear] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);

  const [genres, setGenres] = useState([]);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sinkronkan state dengan parameter URL (mis. saat pencarian dilakukan dari Navbar)
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    const tParam = searchParams.get('type');
    const resolvedType = tParam === 'tv' || tParam === 'person' ? tParam : 'movie';
    const genreParam = searchParams.get('genre') || '';

    setMediaType(resolvedType);
    setQueryInput(qParam);
    setActiveQuery(qParam);
    setSelectedGenre(genreParam);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    tmdbService
      .getGenres(mediaType)
      .then((list) => {
        if (isMounted) setGenres(list);
      })
      .catch((err) => console.error('Gagal memuat genre:', err));

    return () => {
      isMounted = false;
    };
  }, [mediaType]);

  useEffect(() => {
    let isMounted = true;

    async function fetchCatalog() {
      setLoading(true);
      try {
        let data;
        if (activeQuery.trim()) {
          data = await tmdbService.searchMedia({
            mediaType,
            query: activeQuery.trim(),
            page,
            year: selectedYear,
          });
        } else {
          data = await tmdbService.discoverMedia({
            mediaType,
            page,
            sortBy,
            genreId: selectedGenre,
            year: selectedYear,
            minRating,
          });
        }

        if (isMounted) {
          let results = data.results || [];

          if (mediaType !== 'person') {
            results = results.filter((m) => m.poster_path);
            if (activeQuery.trim()) {
              if (selectedGenre) {
                results = results.filter((m) => m.genre_ids?.includes(Number(selectedGenre)));
              }
              if (minRating > 0) {
                results = results.filter((m) => (m.vote_average || 0) >= Number(minRating));
              }
            }
          }

          setItems(results);
          setTotalPages(Math.min(data.total_pages || 1, 500));
          setTotalResults(data.total_results || 0);
        }
      } catch (error) {
        console.error('Gagal mengambil katalog:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [mediaType, activeQuery, selectedGenre, selectedYear, minRating, sortBy, page]);

  const switchMediaType = (nextType) => {
    if (nextType === mediaType) return;
    setMediaType(nextType);
    setSelectedGenre('');
    setPage(1);

    const nextParams = new URLSearchParams();
    nextParams.set('type', nextType);
    if (activeQuery.trim()) nextParams.set('q', activeQuery.trim());
    setSearchParams(nextParams);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const trimmed = queryInput.trim();
    if (trimmed) addSearchHistory(trimmed);

    setActiveQuery(trimmed);
    setPage(1);

    const nextParams = new URLSearchParams();
    nextParams.set('type', mediaType);
    if (trimmed) nextParams.set('q', trimmed);
    if (!trimmed && selectedGenre && mediaType !== 'person') {
      nextParams.set('genre', selectedGenre);
    }
    setSearchParams(nextParams);
  };

  // Tombol silang di kolom pencarian
  const clearQuery = () => {
    setQueryInput('');
    setActiveQuery('');
    const nextParams = new URLSearchParams();
    nextParams.set('type', mediaType);
    if (selectedGenre && mediaType !== 'person') {
      nextParams.set('genre', selectedGenre);
    }
    setSearchParams(nextParams);
  };

  const changeGenre = (val) => {
    setSelectedGenre(val);
    setPage(1);
    if (!activeQuery) {
      const nextParams = new URLSearchParams();
      nextParams.set('type', mediaType);
      if (val) nextParams.set('genre', val);
      setSearchParams(nextParams);
    }
  };

  const changeYear = (val) => {
    setSelectedYear(val);
    setPage(1);
  };

  const changeMinRating = (val) => {
    setMinRating(val);
    setPage(1);
  };

  const changeSortBy = (val) => {
    setSortBy(val);
    setPage(1);
  };

  const resetFilters = () => {
    setQueryInput('');
    setActiveQuery('');
    setSelectedGenre('');
    setSelectedYear('');
    setMinRating(0);
    setSortBy('popularity.desc');
    setPage(1);
    setSearchParams({ type: mediaType });
  };

  const goToPreviousPage = () => setPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  const selectedGenreName = genres.find((g) => String(g.id) === String(selectedGenre))?.name;
  const typeLabel = mediaType === 'person' ? 'Pemeran' : mediaType === 'tv' ? 'Serial TV' : 'Film';

  const pageHeading = activeQuery
    ? `Pencarian ${typeLabel}: "${activeQuery}"`
    : selectedGenreName
      ? `${typeLabel} • ${selectedGenreName}`
      : initialTitle ||
        (mediaType === 'person' ? 'Aktor & Aktris Populer' : `Eksplorasi ${typeLabel}`);

  return {
    mediaType,
    queryInput,
    setQueryInput,
    activeQuery,
    selectedGenre,
    selectedYear,
    minRating,
    sortBy,
    page,
    genres,
    items,
    totalPages,
    totalResults,
    loading,
    typeLabel,
    pageHeading,
    switchMediaType,
    submitSearch,
    clearQuery,
    changeGenre,
    changeYear,
    changeMinRating,
    changeSortBy,
    resetFilters,
    goToPreviousPage,
    goToNextPage,
  };
}
