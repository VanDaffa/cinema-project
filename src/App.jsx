import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import HomeScreen from './pages/HomeScreen';
import MovieDetail from './pages/MovieDetail';
import SearchScreen from './pages/SearchScreen';
import ActorDetail from './pages/ActorDetail';
import WatchlistScreen from './pages/WatchlistScreen';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <div className="app bg-[#0f172a] text-white min-h-screen font-['Poppins'] antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
        <Router>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/tv/:id" element={<MovieDetail />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/actor/:id" element={<ActorDetail />} />
            <Route path="/watchlist" element={<WatchlistScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;