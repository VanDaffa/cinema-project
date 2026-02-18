import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Detail from "./pages/Detail";
import MovieDetail from "./pages/MovieDetail";

function App() {
  return (
    <Router>
      <div className="App bg-gray-900 min-h-screen flex flex-col">
        <Navbar />

        <Routes>
          {/* Halaman Utama */}
          <Route path="/" element={<Home />} />

          {/* Halaman Grid (Search & Lihat Semua) */}
          {/* Kita pakai path "/browse" biar rapi */}
          <Route path="/browse" element={<Detail />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
