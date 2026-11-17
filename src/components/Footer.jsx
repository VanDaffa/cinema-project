import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950/90 border-t border-slate-800/80 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Deskripsi Singkat */}
          <div className="text-center md:text-left">
            <Link to="/" className="text-red-500 font-extrabold text-xl tracking-wider">
              CINEMAXII
            </Link>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
              Platform eksplorasi katalog film, trailer resmi, profil pemeran, dan pengelolaan daftar tontonan personal.
            </p>
          </div>

          {/* Navigasi Cepat */}
          <div className="flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/search" className="hover:text-white transition-colors">
              Explore
            </Link>
            {user && (
              <Link to="/watchlist" className="hover:text-white transition-colors">
                Watchlist
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800/70 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {currentYear} CINEMAXII. All rights reserved.</p>
          <p>Data film dan gambar disediakan oleh TMDB API.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;