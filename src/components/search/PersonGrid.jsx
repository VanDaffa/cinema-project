import React from 'react';
import { Link } from 'react-router-dom';
import { HiUser } from 'react-icons/hi2';
import { getDisplayTitle } from '../../utils/title';

// Grid kartu aktor & aktris
const PersonGrid = ({ people }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
    {people.map((person) => {
      const knownForText = (person.known_for || [])
        .map((k) => getDisplayTitle(k, ''))
        .filter(Boolean)
        .slice(0, 2)
        .join(', ');

      return (
        <Link
          key={person.id}
          to={`/actor/${person.id}`}
          className="group relative block rounded-xl overflow-hidden bg-slate-800/80 border border-slate-800 hover:border-slate-600 shadow-md transition-all duration-300 hover:-translate-y-1"
        >
          <div className="aspect-[2/3] w-full overflow-hidden bg-slate-900 relative flex items-center justify-center">
            {person.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                alt={person.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <HiUser className="w-16 h-16 text-slate-600" />
            )}

            <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-sm border border-slate-700/70 px-2 py-0.5 rounded-md text-[11px] font-semibold text-sky-300">
              {person.known_for_department || 'Acting'}
            </span>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <h3 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
                {person.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {knownForText || 'Lihat profil & karya'}
              </p>
            </div>
          </div>
        </Link>
      );
    })}
  </div>
);

export default PersonGrid;
