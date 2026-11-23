import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { getFriendlyActionError } from '../utils/errorHandler';

// Jurnal tontonan pribadi untuk satu tayangan: status (watchlist / watched), skor, dan catatan.
// Data tersimpan dibaca dari WatchlistContext; skor & catatan yang sedang diedit disimpan sebagai draf lokal.
export default function useJournal({ detail, mediaType, title, releaseDate }) {
  const { user } = useAuth();
  const { getEntry, saveEntry, removeEntry } = useWatchlist();

  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const journalEntry = detail?.id ? getEntry(mediaType, detail.id) : null;
  const journalStatus = journalEntry?.status ?? null; // null | 'watchlist' | 'watched'
  const savedRating = journalEntry?.userRating ?? 0;
  const savedReview = journalEntry?.review ?? '';

  // Sinkronkan draf rating & review dengan data tersimpan.
  // Dependency berupa nilai primitif agar draf yang sedang diketik tidak
  // tertimpa oleh perubahan lain pada watchlist.
  useEffect(() => {
    setUserRating(savedRating);
    setReviewText(savedReview);
  }, [detail?.id, mediaType, savedRating, savedReview]);

  // Simpan atau perbarui status Watchlist / Watched di Firestore
  const saveJournalEntry = async ({
    nextStatus,
    nextRating = userRating,
    nextReview = reviewText,
    successMessage,
  }) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu untuk mencatat ke Jurnal & Watchlist.');
      return false;
    }
    if (isSaving || !detail?.id) return false;

    setIsSaving(true);

    try {
      await saveEntry(
        {
          id: detail.id,
          media_type: mediaType,
          title,
          poster_path: detail.poster_path,
          release_date: releaseDate,
          vote_average: detail.vote_average,
        },
        { status: nextStatus, userRating: nextRating, review: nextReview },
      );

      setUserRating(nextRating);
      if (successMessage) toast.success(successMessage);
      return true;
    } catch (error) {
      console.error('Gagal menyimpan jurnal:', error);
      toast.error(
        getFriendlyActionError(error, 'Gagal menyimpan perubahan ke jurnal. Silakan coba lagi.'),
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Kosongkan skor & catatan; status (watchlist / watched) tetap dipertahankan
  const clearNotes = async () => {
    const saved = await saveJournalEntry({
      nextStatus: journalStatus,
      nextRating: 0,
      nextReview: '',
      successMessage: 'Skor dan catatan dikosongkan.',
    });
    if (saved) setReviewText('');
  };

  const removeFromCollection = async () => {
    if (!user || !detail?.id || isSaving) return;
    setIsSaving(true);

    try {
      await removeEntry(mediaType, detail.id);
      setUserRating(0);
      setReviewText('');
      toast.success(`"${title}" dihapus dari koleksi.`);
    } catch (error) {
      console.error('Gagal menghapus dari koleksi:', error);
      toast.error(getFriendlyActionError(error, 'Gagal menghapus tayangan dari koleksi.'));
    } finally {
      setIsSaving(false);
    }
  };

  const toggleWatchlist = () => {
    if (journalStatus === 'watchlist') {
      removeFromCollection();
    } else {
      saveJournalEntry({
        nextStatus: 'watchlist',
        successMessage: `"${title}" disimpan ke Watchlist.`,
      });
    }
  };

  const markAsWatched = () => {
    saveJournalEntry({
      nextStatus: 'watched',
      successMessage: `"${title}" ditandai Sudah Ditonton.`,
    });
  };

  // Simpan skor & catatan dari panel jurnal
  const saveNotes = () => {
    saveJournalEntry({
      nextStatus: journalStatus,
      nextRating: userRating,
      nextReview: reviewText,
      successMessage: 'Jurnal pribadi berhasil diperbarui.',
    });
  };

  return {
    journalStatus,
    userRating,
    setUserRating,
    reviewText,
    setReviewText,
    isSaving,
    toggleWatchlist,
    markAsWatched,
    saveNotes,
    clearNotes,
    removeFromCollection,
  };
}
