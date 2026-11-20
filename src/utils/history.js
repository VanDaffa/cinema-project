import { getDisplayTitle } from './title';

const VIEWED_STORAGE_KEY = 'cinemaxii_recently_viewed';
const SEARCH_STORAGE_KEY = 'cinemaxii_search_history';
const MAX_VIEWED_ITEMS = 10;
const MAX_SEARCH_ITEMS = 5;

// --- Riwayat Tayangan Terakhir Dilihat ---
export const getRecentlyViewed = () => {
  try {
    const raw = localStorage.getItem(VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gagal membaca riwayat tontonan lokal:', error);
    return [];
  }
};

export const addRecentlyViewed = (item) => {
  if (!item || !item.id) return;

  try {
    const current = getRecentlyViewed();
    const mediaType =
      item.media_type || (item.first_air_date && !item.release_date ? 'tv' : 'movie');

    const normalizedItem = {
      id: item.id,
      media_type: mediaType,
      title: getDisplayTitle(item),
      poster_path: item.poster_path || null,
      release_date: item.release_date || item.first_air_date || '',
      vote_average: item.vote_average || 0,
      viewedAt: Date.now(),
    };

    const filtered = current.filter(
      (existing) =>
        !(String(existing.id) === String(normalizedItem.id) && existing.media_type === mediaType)
    );

    const updated = [normalizedItem, ...filtered].slice(0, MAX_VIEWED_ITEMS);
    localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Gagal menyimpan riwayat tontonan lokal:', error);
  }
};

export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(VIEWED_STORAGE_KEY);
  } catch (error) {
    console.error('Gagal menghapus riwayat lokal:', error);
  }
};

// --- Riwayat Kata Kunci Pencarian ---
export const getSearchHistory = () => {
  try {
    const raw = localStorage.getItem(SEARCH_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gagal membaca riwayat pencarian:', error);
    return [];
  }
};

export const addSearchHistory = (term) => {
  const cleaned = term?.trim();
  if (!cleaned) return getSearchHistory();

  try {
    const current = getSearchHistory();
    const filtered = current.filter(
      (existing) => existing.toLowerCase() !== cleaned.toLowerCase()
    );
    const updated = [cleaned, ...filtered].slice(0, MAX_SEARCH_ITEMS);
    localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Gagal menyimpan riwayat pencarian:', error);
    return [];
  }
};

export const removeSearchHistoryItem = (term) => {
  try {
    const current = getSearchHistory();
    const updated = current.filter(
      (existing) => existing.toLowerCase() !== term.toLowerCase()
    );
    localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Gagal menghapus item riwayat pencarian:', error);
    return [];
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(SEARCH_STORAGE_KEY);
  } catch (error) {
    console.error('Gagal membersihkan riwayat pencarian:', error);
  }
};