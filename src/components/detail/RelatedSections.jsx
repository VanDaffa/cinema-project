import React from 'react';
import MovieCard from '../MovieCard';
import SectionHeading from './SectionHeading';

// Semesta & sekuel (collection)
export const CollectionSection = ({ collection, currentId }) => (
  <section className="mt-12 border-t border-slate-800/80 pt-10">
    <SectionHeading className="mb-6">Bagian dari {collection.name}</SectionHeading>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
      {collection.parts.map((part) => (
        <div key={part.id} className="relative">
          <MovieCard
            movie={part}
            mediaTypeOverride="movie"
            className={
              String(part.id) === String(currentId) ? 'ring-2 ring-red-500 border-red-500' : ''
            }
          />
          {String(part.id) === String(currentId) && (
            <span className="absolute bottom-14 left-2.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow pointer-events-none">
              Sedang Dilihat
            </span>
          )}
        </div>
      ))}
    </div>
  </section>
);

// Rekomendasi serupa
export const RecommendationSection = ({ items, mediaType }) => (
  <section className="mt-12 border-t border-slate-800/80 pt-10">
    <SectionHeading className="mb-6">Mungkin Kamu Suka</SectionHeading>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
      {items.map((rec) => (
        <MovieCard key={rec.id} movie={rec} mediaTypeOverride={mediaType} />
      ))}
    </div>
  </section>
);
