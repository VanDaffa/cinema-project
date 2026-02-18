import React from "react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Brand & Slogan */}
        <h2 className="text-2xl font-bold text-red-600 mb-2">CINEMAXII</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Platform pencarian film anime dan movie favoritmu. <br />
          Dibuat dengan cinta dan kopi oleh Daffa Nurin.
        </p>

        {/* Social Icons */}
        <div className="flex space-x-6 mb-6">
          <a
            href="https://github.com/VanDaffa"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            <FaGithub />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-pink-500 transition-colors text-2xl"
          >
            <FaInstagram />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-blue-500 transition-colors text-2xl"
          >
            <FaLinkedin />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} CinemaXII Project. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
