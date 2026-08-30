// src/components/Layout/Header.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, ShoppingCart, Heart, RefreshCw, User, LogIn, UserPlus, ChevronDown, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  cartCount?: number;
}

const Header: React.FC<HeaderProps> = ({ cartCount = 0 }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-amber-50 via-white to-amber-50 py-4 hidden lg:block border-b border-amber-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <Crown className="text-amber-600 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:text-amber-700" size={32} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">
                OMA flowers
              </h1>
              <span className="text-[10px] text-amber-400 font-medium tracking-widest uppercase block -mt-1">
                Premium Quality
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="flex rounded-full border-2 border-amber-200/60 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 bg-white">
              <input
                type="text"
                placeholder="Search Looking For?"
                className="flex-1 px-4 py-3 outline-none text-gray-700 bg-transparent placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select className="px-4 py-3 border-l border-amber-200/60 outline-none bg-amber-50/50 text-gray-600 hover:bg-amber-100/50 cursor-pointer transition-colors duration-200">
                <option>All Category</option>
                <option>Flowers</option>
                <option>Bouquets</option>
                <option>Plants</option>
                <option>Gifts</option>
              </select>
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:shadow-lg"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            <button
              className="p-2.5 border-2 border-amber-200/60 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 transform group"
              aria-label="Compare"
            >
              <RefreshCw size={20} className="text-amber-600 group-hover:text-amber-700 transition-colors" />
            </button>

            <Link
              to="/wishlist"
              className="p-2.5 border-2 border-amber-200/60 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 transform relative group"
            >
              <Heart size={20} className="text-amber-600 group-hover:text-amber-700 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md">
                3
              </span>
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-2 p-2.5 border-2 border-amber-200/60 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 transform group"
            >
              <div className="relative">
                <ShoppingCart size={20} className="text-amber-600 group-hover:text-amber-700 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-amber-800 font-semibold">0.00TZS/=</span>
            </Link>

            {/* Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center gap-1 p-2.5 border-2 border-amber-200/60 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 transform group"
              >
                <User size={20} className="text-amber-600 group-hover:text-amber-700 transition-colors" />
                <ChevronDown
                  size={16}
                  className={`text-amber-400 transition-all duration-300 ${isAccountOpen ? 'rotate-180 text-amber-600' : ''}`}
                />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-amber-200/50 py-2 z-50 animate-fadeIn">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-amber-100/80 bg-gradient-to-r from-amber-50/50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                            <p className="text-sm text-amber-600">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <User size={18} className="text-amber-500 group-hover:text-amber-600" />
                        <span className="group-hover:text-amber-700">My Account</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <ShoppingBag size={18} className="text-amber-500 group-hover:text-amber-600" />
                        <span className="group-hover:text-amber-700">My Orders</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <Heart size={18} className="text-amber-500 group-hover:text-amber-600" />
                        <span className="group-hover:text-amber-700">Wishlist</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 transition-colors duration-200 border-t border-amber-100/80 mt-1 group"
                      >
                        <LogIn size={18} className="group-hover:text-rose-700" />
                        <span className="group-hover:text-rose-700">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-amber-100/80">
                        <p className="font-semibold text-gray-800">Welcome!</p>
                        <p className="text-sm text-amber-500">Sign in to your account</p>
                      </div>
                      <Link
                        to="/login"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <LogIn size={18} className="text-amber-500 group-hover:text-amber-600" />
                        <span className="group-hover:text-amber-700">Sign In</span>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <UserPlus size={18} className="text-amber-500 group-hover:text-amber-600" />
                        <span className="group-hover:text-amber-700">Create Account</span>
                      </Link>
                      <div className="border-t border-amber-100/80 mt-1 pt-1">
                        <Link
                          to="/reset-password"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 text-sm text-amber-500 group"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <span className="group-hover:text-amber-700">Forgot Password?</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;