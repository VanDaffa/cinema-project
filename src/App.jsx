import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './HomeScreen';
import MovieDetail from './MovieDetail';
import SearchScreen from './SearchScreen';
import ActorDetail from './ActorDetail';
import WatchlistScreen from './WatchlistScreen';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <div className="app bg-[#0f172a] min-h-screen font-['Poppins']">
        <Router>
          <Routes>
            <Route exact path="/" element={<HomeScreen />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/actor/:id" element={<ActorDetail />} />
            <Route path="/watchlist" element={<WatchlistScreen />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
