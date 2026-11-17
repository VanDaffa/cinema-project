import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const [show, handleShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const transitionNavBar = () => {
    if (window.scrollY > 100) {
      handleShow(true);
    } else {
      handleShow(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', transitionNavBar);
    return () => window.removeEventListener('scroll', transitionNavBar);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  return (
    <div
      className={`fixed top-0 w-full p-5 px-8 flex items-center justify-between z-50 transition-all duration-500 ease-in ${
        show ? 'bg-[#0f172a] shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center gap-8">
        <Link to="/">
          <h1 className="text-red-500 font-extrabold text-2xl tracking-wider cursor-pointer">
            CINEMAXII
          </h1>
        </Link>
        <div className="hidden md:flex gap-4 text-sm font-semibold text-gray-300">
          <Link to="/" className="hover:text-white transition-colors">Discover</Link>
          {user && (
            <Link to="/watchlist" className="hover:text-white transition-colors">Watchlist</Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari film..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#1e293b] text-white text-sm rounded-full pl-10 pr-4 py-2 border border-gray-600 focus:outline-none focus:border-red-500 w-64 transition-all"
          />
        </form>

        {!user ? (
          <button 
            onClick={handleLogin}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-6 rounded-full transition-colors text-sm"
          >
            Login
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <img
              onClick={handleLogout}
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-red-500 transition-all"
              src={user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"}
              alt="User Avatar"
              title="Logout"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
