import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // '' = muat semua variabel .env, termasuk yang tanpa awalan VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
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