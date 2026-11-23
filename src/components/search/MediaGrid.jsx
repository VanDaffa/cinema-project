import React from 'react';
import MovieCard from '../MovieCard';

// Grid kartu film & serial TV
const MediaGrid = ({ items, mediaType }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
    {items.map((item) => (
      <MovieCard key={item.id} movie={item} mediaTypeOverride={mediaType} />
    ))}
  </div>
);

export default MediaGrid;
