import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WatchlistProvider } from "./context/WatchlistContext"; // Import Provider
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import MovieDetail from "./pages/MovieDetail";
// Import halaman baru nanti
import WatchlistPage from "./pages/WatchlistPage";

function App() {
  return (
    <WatchlistProvider>
      {" "}
      {/* Bungkus Router dengan Provider */}
      <Router>
        <div className="App bg-gray-900 min-h-screen flex flex-col">
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Detail />} />
            <Route path="/movie/:id" element={<MovieDetail />} />

            {/* Rute Baru buat Halaman Watchlist */}
            <Route path="/watchlist" element={<WatchlistPage />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </WatchlistProvider>
  );
}

export default App;
