import { useState } from 'react';
import toast from 'react-hot-toast';
import { tmdbService } from '../services/tmdb';

// Fitur "Pilihkan Film/Serial Acak" sesuai jenis dan filter yang sedang aktif.
export default function useRandomPick({ mediaType, selectedGenre, minRating }) {
  const [randomPick, setRandomPick] = useState(null);
  const [isPickingRandom, setIsPickingRandom] = useState(false);

  const randomize = async () => {
    if (isPickingRandom || mediaType === 'person') return;
    setIsPickingRandom(true);
    try {
      const pick = await tmdbService.getRandomPick({
        mediaType,
        genreId: selectedGenre,
        minRating: minRating > 0 ? minRating : 6.5,
      });
      if (!pick) {
        toast.error('Tidak ada judul acak yang cocok dengan filter saat ini.');
      } else {
        setRandomPick(pick);
      }
    } catch (error) {
      console.error('Gagal memilih tayangan acak:', error);
      toast.error('Gagal mengambil rekomendasi acak.');
    } finally {
      setIsPickingRandom(false);
    }
  };

  const clearRandomPick = () => setRandomPick(null);

  return { randomPick, isPickingRandom, randomize, clearRandomPick };
}
