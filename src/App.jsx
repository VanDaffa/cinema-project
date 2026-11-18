import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PageTransition, { PageLoader } from './components/PageTransition';
import HomeScreen from './pages/HomeScreen';

// Code-Splitting: halaman diunduh secara dinamis hanya saat dikunjungi
const SearchScreen = lazy(() => import('./pages/SearchScreen'));
const WatchlistScreen = lazy(() => import('./pages/WatchlistScreen'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const ActorDetail = lazy(() => import('./pages/ActorDetail'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              fontSize: '0.875rem',
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/watchlist" element={<WatchlistScreen />} />
              <Route path="/movie/:id" element={<MovieDetail />} />
              <Route path="/tv/:id" element={<MovieDetail />} />
              <Route path="/actor/:id" element={<ActorDetail />} />
            </Routes>
          </PageTransition>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;