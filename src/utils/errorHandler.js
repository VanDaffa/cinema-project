export const getFriendlyAuthError = (error) => {
  const code = error?.code || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      // Pengguna menutup jendela login sendiri; tidak perlu menampilkan notifikasi error
      return null;
    case 'auth/popup-blocked':
      return 'Jendela login diblokir oleh browser. Izinkan pop-up untuk situs ini lalu coba lagi.';
    case 'auth/network-request-failed':
      return 'Koneksi internet terputus. Periksa jaringanmu lalu coba login kembali.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan login. Tunggu beberapa saat sebelum mencoba lagi.';
    case 'auth/user-disabled':
      return 'Akun ini sedang dinonaktifkan. Hubungi administrator untuk bantuan.';
    case 'auth/unauthorized-domain':
    case 'auth/operation-not-allowed':
      return 'Layanan login sedang mengalami kendala sementara. Silakan coba beberapa saat lagi.';
    default:
      return 'Gagal masuk ke akun. Silakan coba beberapa saat lagi.';
  }
};

export const getFriendlyActionError = (
  error,
  fallbackMessage = 'Terjadi kendala saat memproses permintaan. Silakan coba lagi.'
) => {
  const code = error?.code || '';

  if (code === 'permission-denied') {
    return 'Sesi akses tidak valid. Silakan login ulang lalu coba kembali.';
  }
  if (code === 'unavailable' || error?.message === 'Network Error') {
    return 'Koneksi ke server terganggu. Periksa jaringan internetmu lalu coba lagi.';
  }

  return fallbackMessage;
};