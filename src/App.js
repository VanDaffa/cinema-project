// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import MovieList from "./components/MovieList";
import Footer from "./components/Footer";
import "./App.css";

const apiKey = "d28eb2bee327de92a4a2982b3253e03d";

function App() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(
          "https://api.themoviedb.org/3/discover/movie?api_key=" + apiKey
        );
        console.log(response.data);
        setMovies(response.data.results);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, [apiKey]);

  const handleSearch = async (term) => {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${term}`
      );
      setMovies(response.data.results);
    } catch (error) {
      console.error("Error searching movies:", error);
    }
  };

  return (
    <div className="App">
      <Navbar onSearch={handleSearch} />
      <main>
        <MovieList movies={movies} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
