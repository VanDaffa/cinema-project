// Kode bahasa ISO (mis. "en") menjadi nama bahasa Indonesia (mis. "Inggris")
export const getLanguageName = (code) => {
  if (!code) return '-';
  try {
    return new Intl.DisplayNames(['id'], { type: 'language' }).of(code) || code;
  } catch {
    return code;
  }
};
