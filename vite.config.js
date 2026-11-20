import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // '' = muat semua variabel .env, termasuk yang tanpa awalan VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    build: {
      rolldownOptions: {
        output: {
          // Pisahkan library yang jarang berubah dari kode aplikasi, supaya browser bisa
          // menyimpannya di cache walau kode aplikasi di-deploy ulang.
          // Firestore sengaja TIDAK dimasukkan ke grup mana pun: ia dimuat lazy lewat import().
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\\/]/,
                priority: 20,
              },
              {
                name: 'firebase-core',
                test: /node_modules[\\/](@firebase[\\/](app|auth|component|logger|util)|firebase[\\/](app|auth)|idb|tslib)[\\/]/,
                priority: 10,
              },
            ],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api/tmdb': {
          target: 'https://api.themoviedb.org',
          changeOrigin: true,
          rewrite: (path) => {
            const url = new URL(path.replace(/^\/api\/tmdb/, '/3'), 'http://localhost');
            url.searchParams.set('api_key', env.TMDB_API_KEY);
            return url.pathname + url.search;
          },
        },
      },
    },
  };
});