import { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import { addRecentlyViewed } from '../utils/history';

// Mengambil seluruh data halaman detail (film atau serial) dari TMDB.
export default function useMediaDetail(mediaType, id) {
  const [detail, setDetail] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [mainTrailerKey, setMainTrailerKey] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [collectionData, setCollectionData] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      setCollectionData(null);

      try {
        const data = await tmdbService.getMediaDetail(mediaType, id);
        if (!isMounted) return;

        setDetail(data.detail);
        setCast((data.cast || []).slice(0, 16));
        setRecommendations(
          (data.recommendations || []).filter((item) => item.poster_path).slice(0, 12),
        );
        setWatchProviders(data.watchProviders);

        // Simpan ke riwayat "Terakhir Dilihat" di localStorage
        addRecentlyViewed({ ...data.detail, media_type: mediaType });

        // Filter video YouTube & tentukan video utama
        const ytVideos = (data.videos || []).filter((v) => v.site === 'YouTube');
        setVideos(ytVideos);

        const mainTrailer =
          ytVideos.find((v) => v.type === 'Trailer' && v.official) ||
          ytVideos.find((v) => v.type === 'Trailer') ||
          ytVideos[0] ||
          null;
        setMainTrailerKey(mainTrailer ? mainTrailer.key : null);

        // Ambil daftar sekuel/waralaba jika film tergabung dalam collection
        if (mediaType === 'movie' && data.detail?.belongs_to_collection?.id) {
          try {
            const col = await tmdbService.getCollection(data.detail.belongs_to_collection.id);
            if (isMounted && col?.parts?.length > 1) {
              setCollectionData(col);
            }
          } catch (colErr) {
            console.error('Gagal memuat koleksi waralaba:', colErr);
          }
        }
      } catch (error) {
        console.error('Gagal memuat halaman detail:', error);
        if (isMounted) setDetail(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [id, mediaType]);

  return {
    loading,
    detail,
    cast,
    videos,
    mainTrailerKey,
    recommendations,
    collectionData,
    watchProviders,
  };
}
