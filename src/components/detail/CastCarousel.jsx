import React from 'react';
import { Link } from 'react-router-dom';
import { HiChevronLeft, HiChevronRight, HiUser } from 'react-icons/hi2';
import useCarouselScroll from '../../hooks/useCarouselScroll';
import SectionHeading from './SectionHeading';

const CastCarousel = ({ cast }) => {
  const { ref, isLeftEnd, isRightEnd, update, scrollBy } = useCarouselScroll(cast.length);

  return (
    <section className="mb-10">
      <SectionHeading className="mb-5">Top Cast</SectionHeading>

      <div className="relative flex items-center">
        {!isLeftEnd && (
          <button
            type="button"
            onClick={() => scrollBy(-360)}
            aria-label="Geser pemeran ke kiri"
            className="absolute -left-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md backdrop-blur-sm transition-colors"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          ref={ref}
          onScroll={update}
          className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide w-full"
        >
          {cast.map((actor) => (
            <Link
              to={`/actor/${actor.id}`}
              key={actor.id}
              className="w-28 shrink-0 text-center group cursor-pointer"
            >
              <div className="w-24 h-24 mx-auto mb-2.5 rounded-full overflow-hidden border-2 border-slate-700 group-hover:border-red-500 transition-colors bg-slate-800 flex items-center justify-center shadow-md">
                {actor.profile_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                    alt={actor.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiUser className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <p className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                {actor.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{actor.character}</p>
            </Link>
          ))}
        </div>

        {!isRightEnd && (
          <button
            type="button"
            onClick={() => scrollBy(360)}
            aria-label="Geser pemeran ke kanan"
            className="absolute -right-3 z-20 bg-slate-900/90 hover:bg-red-600 text-white p-1.5 rounded-full border border-slate-700 shadow-md backdrop-blur-sm transition-colors"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </section>
  );
};

export default CastCarousel;
