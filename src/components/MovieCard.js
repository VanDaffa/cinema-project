import React, { useState } from "react";

const MovieCard = ({ movie }) => {
  const poseterUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  const toggleSynopsis = () => {
    setShowFullSynopsis(!showFullSynopsis);
  };

  const renderSynopsis = () => {
    const maxLength = 150;
    const isSynopsisTruncated = movie.overview.length > maxLength;

    return (
      <div>
        <p>
          {showFullSynopsis
            ? movie.overview
            : `${movie.overview.slice(0, maxLength)}...`}
        </p>
        {isSynopsisTruncated && (
          <span className="read-more" onClick={toggleSynopsis}>
            {showFullSynopsis ? " Read Less" : " Read More"}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="movie-card-small">
      <img src={poseterUrl} alt={movie.title} />
      <h3>{movie.title}</h3>
      <p>{movie.description}</p>
      <p>Rating: {movie.vote_average}</p>
      {renderSynopsis()};
    </div>
  );
};

export default MovieCard;
