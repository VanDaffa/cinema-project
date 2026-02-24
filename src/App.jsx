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
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <WatchlistProvider>
      {" "}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#1F2937", // Warna bg-gray-800
            color: "#fff", // Teks putih
            border: "1px solid #374151", // Border abu-abu gelap
            borderRadius: "10px",
            fontWeight: "bold",
          },
          success: {
            iconTheme: {
              primary: "#10B981", // Hijau success
              secondary: "#fff",
            },
          },
        }}
      />
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
