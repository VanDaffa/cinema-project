import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WatchlistProvider } from "./context/WatchlistContext"; // Import Provider
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Browse from "./pages/Browse";
import WatchlistPage from "./pages/WatchlistPage";
import Discover from "./pages/Discover";
import PersonDetail from "./pages/PersonDetail";

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
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/person/:id" element={<PersonDetail />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </WatchlistProvider>
  );
}

export default App;
