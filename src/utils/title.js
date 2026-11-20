// Aturan judul tampilan (agar mudah dikenali dan dicari orang dari berbagai bahasa):
// - Film/serial BERBAHASA INDONESIA  -> judul asli (bahasa Indonesia) sebagai judul utama.
// - Film/serial bahasa lain          -> judul internasional (Inggris) sebagai judul utama,
//                                       bukan terjemahan harfiah atau aksara asli.
// Judul pendamping (getSecondaryTitle) menampilkan "sisi" yang satunya di halaman detail.

const KEEP_ORIGINAL_TITLE_LANGUAGES = ['id'];

const getInternationalTitle = (item) => item?.title || item?.name || '';
const getOriginalTitle = (item) => item?.original_title || item?.original_name || '';

export const getDisplayTitle = (item, fallback = 'Untitled') => {
  if (!item) return fallback;

  const original = getOriginalTitle(item);
  if (KEEP_ORIGINAL_TITLE_LANGUAGES.includes(item.original_language) && original) {
    return original;
  }

  return getInternationalTitle(item) || original || fallback;
};

export const getSecondaryTitle = (item) => {
  const primary = getDisplayTitle(item, '');
  return (
    [getInternationalTitle(item), getOriginalTitle(item)].find((t) => t && t !== primary) || ''
  );
};
