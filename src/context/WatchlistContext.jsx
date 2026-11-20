import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const WatchlistContext = createContext(null);

const makeKey = (mediaType, id) => `${mediaType}_${id}`;

// ID dokumen format baru: "movie_123" / "tv_456".
// ID dokumen format lama: "123" (khusus film).
const TYPED_ID = /^(movie|tv)_\d+$/;

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid;

  const [entries, setEntries] = useState(() => new Map());
  const [loading, setLoading] = useState(true);

  // Satu listener untuk seluruh watchlist milik pengguna.
  // Menggantikan getDoc per kartu yang sebelumnya dipanggil berulang-ulang.
  useEffect(() => {
    if (!uid) {
      setEntries(new Map());
      setLoading(false);
      return undefined;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      collection(db, 'users', uid, 'watchlist'),
      (snapshot) => {
        const next = new Map();

        snapshot.docs.forEach((docItem) => {
          const data = docItem.data();
          const isTyped = TYPED_ID.test(docItem.id);
          const mediaType = data.media_type || (isTyped ? docItem.id.split('_')[0] : 'movie');
          const key = isTyped ? docItem.id : makeKey('movie', docItem.id);

          // Dokumen format baru selalu menang atas dokumen format lama
          if (!isTyped && next.has(key)) return;

          next.set(key, {
            ...data,
            id: data.id ?? Number(docItem.id.split('_').pop()),
            media_type: mediaType,
            status: data.status || 'watchlist',
            userRating: Number(data.userRating || 0),
            review: data.review || '',
          });
        });

        setEntries(next);
        setLoading(false);
      },
      (error) => {
        console.error('Gagal memuat watchlist:', error);
        setEntries(new Map());
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  // Daftar terurut dari yang terbaru ditambahkan (dipakai WatchlistScreen)
  const items = useMemo(
    () =>
      Array.from(entries.values()).sort((a, b) => {
        const timeA = new Date(a.addedAt || a.savedAt || 0).getTime();
        const timeB = new Date(b.addedAt || b.savedAt || 0).getTime();
        return timeB - timeA;
      }),
    [entries]
  );

  const getEntry = useCallback(
    (mediaType, id) => entries.get(makeKey(mediaType, id)) || null,
    [entries]
  );

  const getStatus = useCallback(
    (mediaType, id) => entries.get(makeKey(mediaType, id))?.status ?? null,
    [entries]
  );

  // Simpan atau perbarui satu entri. Field yang tidak diisi memakai nilai tersimpan.
  const saveEntry = useCallback(
    async (item, { status, userRating, review } = {}) => {
      if (!uid) throw new Error('Belum login');

      const key = makeKey(item.media_type, item.id);
      const existing = entries.get(key);

      await setDoc(doc(db, 'users', uid, 'watchlist', key), {
        id: item.id,
        media_type: item.media_type,
        title: item.title,
        poster_path: item.poster_path || null,
        release_date: item.release_date || '',
        vote_average: item.vote_average || 0,
        status: status ?? existing?.status ?? 'watchlist',
        userRating: userRating ?? existing?.userRating ?? 0,
        review: (review ?? existing?.review ?? '').trim(),
        // Pertahankan tanggal awal ditambahkan agar urutan tidak berubah saat rating diedit
        addedAt: existing?.addedAt || new Date().toISOString(),
      });
    },
    [uid, entries]
  );

  const removeEntry = useCallback(
    async (mediaType, id) => {
      if (!uid) throw new Error('Belum login');

      const jobs = [deleteDoc(doc(db, 'users', uid, 'watchlist', makeKey(mediaType, id)))];
      // Hapus juga dokumen format lama (ID numerik) khusus film
      if (mediaType === 'movie') {
        jobs.push(deleteDoc(doc(db, 'users', uid, 'watchlist', String(id))));
      }
      await Promise.all(jobs);
    },
    [uid]
  );

  const value = useMemo(
    () => ({ items, loading, getEntry, getStatus, saveEntry, removeEntry }),
    [items, loading, getEntry, getStatus, saveEntry, removeEntry]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error('useWatchlist harus dipakai di dalam <WatchlistProvider>');
  }
  return ctx;
};
