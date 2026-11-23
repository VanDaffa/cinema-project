import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const DetailNotFound = () => (
  <div className="bg-[#0f172a] min-h-screen text-white flex flex-col">
    <Navbar />
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold mb-2">Tayangan tidak ditemukan</h1>
      <p className="text-slate-400 text-sm mb-6">
        Data film atau serial yang kamu cari tidak tersedia.
      </p>
      <Link
        to="/"
        className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
    <Footer />
  </div>
);

export default DetailNotFound;
