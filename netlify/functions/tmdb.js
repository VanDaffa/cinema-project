const TMDB_BASE = 'https://api.themoviedb.org/3';

// Hanya endpoint yang dipakai aplikasimu yang boleh diteruskan ke TMDB
const ALLOWED_PREFIXES = [
  '/trending', '/discover', '/search', '/genre',
  '/movie', '/tv', '/person', '/collection',
];

const json = (statusCode, data) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'TMDB_API_KEY belum diatur di server' });
  }

  // Ambil path TMDB, baik lewat /api/tmdb/... maupun /.netlify/functions/tmdb/...
  const tmdbPath = event.path.replace(/^\/(?:api\/tmdb|\.netlify\/functions\/tmdb)/, '');

  const isAllowed =
    !tmdbPath.includes('..') &&
    ALLOWED_PREFIXES.some((p) => tmdbPath === p || tmdbPath.startsWith(`${p}/`));
  if (!isAllowed) {
    return json(403, { error: 'Endpoint tidak diizinkan' });
  }

  const params = new URLSearchParams(event.rawQuery || '');
  params.delete('api_key'); // abaikan key apa pun kiriman klien
  params.set('api_key', apiKey);

  try {
    const res = await fetch(`${TMDB_BASE}${tmdbPath}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    const body = await res.text();

    return {
      statusCode: res.status,
      headers: {
        'Content-Type': 'application/json',
        // Cache 5 menit di CDN Netlify, hanya untuk respons sukses.
        // Mengurangi jumlah pemanggilan function dan beban ke TMDB.
        ...(res.ok && {
          'Cache-Control': 'public, max-age=300',
          'Netlify-CDN-Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        }),
      },
      body,
    };
  } catch (err) {
    console.error('Proxy TMDB gagal:', err);
    return json(502, { error: 'Gagal menghubungi TMDB' });
  }
};