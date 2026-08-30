// src/components/Layout/Navigation.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone, Search, Home, ShoppingBag, Layers, Mail, User, Heart, ShoppingCart, LogIn, UserPlus } from 'lucide-react';
import { categories } from '../data/data';
import { useAuth } from '../../context/AuthContext';

interface NavigationProps {
  toggleSidebar?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPagesOpen, setIsPagesOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobilePagesOpen, setIsMobilePagesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pagesDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
      if (pagesDropdownRef.current && !pagesDropdownRef.current.contains(event.target as Node)) {
        setIsPagesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsPagesOpen(false);
    setIsCategoriesOpen(false);
    setIsMobilePagesOpen(false);
    setIsMobileCategoriesOpen(false);
  };

  const togglePages = () => {
    setIsPagesOpen(!isPagesOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const toggleMobilePages = () => {
    setIsMobilePagesOpen(!isMobilePagesOpen);
  };

  const toggleMobileCategories = () => {
    setIsMobileCategoriesOpen(!isMobileCategoriesOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-primary text-white sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Mobile Menu Button - Opens Sidebar */}
          <button 
            className="lg:hidden text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
            onClick={toggleSidebar}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Desktop Categories Dropdown */}
          <div className="hidden lg:block relative" ref={dropdownRef}>
            <button 
              className="w-64 text-left py-2.5 px-4 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors"
              onClick={toggleCategories}
            >
              <Menu size={20} /> All Categories <ChevronDown size={16} className={`ml-auto transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoriesOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white text-gray-800 rounded-lg shadow-xl z-50 py-1 border border-gray-100 max-h-96 overflow-y-auto">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigation(`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`)}
                    className="flex items-center justify-between w-full px-4 py-3 hover:bg-primary/10 border-b last:border-0 cursor-pointer transition-colors text-left"
                  >
                    <span>{cat.name}</span>
                    <span className="text-gray-400 text-sm bg-gray-100 px-2 py-0.5 rounded-full">({cat.count})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Search - Only visible on mobile */}
          <div className="flex-1 lg:hidden mx-2">
            <div className="flex items-center bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors">
              <Search size={16} className="text-white/60 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent text-white placeholder-white/60 outline-none w-full text-sm ml-2"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <Link 
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors font-medium hover:bg-white/10 ${
                isActive('/') ? 'bg-white/20' : ''
              }`}
            >
              Home
            </Link>
            
            <Link 
              to="/shop"
              className={`px-3 py-2 rounded-lg transition-colors font-medium hover:bg-white/10 ${
                isActive('/shop') ? 'bg-white/20' : ''
              }`}
            >
              Shop
            </Link>
            
            <Link 
              to="/single-page"
              className={`px-3 py-2 rounded-lg transition-colors font-medium hover:bg-white/10 ${
                isActive('/single-page') ? 'bg-white/20' : ''
              }`}
            >
              Single Page
            </Link>
            
            {/* Pages Dropdown */}
            <div className="relative" ref={pagesDropdownRef}>
              <button 
                className={`px-3 py-2 rounded-lg transition-colors font-medium flex items-center gap-1 hover:bg-white/10 ${
                  isPagesOpen ? 'bg-white/20' : ''
                }`}
                onClick={togglePages}
              >
                Pages <ChevronDown size={16} className={`transition-transform ${isPagesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPagesOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl z-50 py-1 border border-gray-100">
                  <Link 
                    to="/bestseller"
                    className="block w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors"
                    onClick={() => setIsPagesOpen(false)}
                  >
                    Bestseller
                  </Link>
                  <Link 
                    to="/cart"
                    className="block w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors"
                    onClick={() => setIsPagesOpen(false)}
                  >
                    Cart Page
                  </Link>
                  <Link 
                    to="/checkout"
                    className="block w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors"
                    onClick={() => setIsPagesOpen(false)}
                  >
                    Checkout
                  </Link>
                  <Link 
                    to="/404"
                    className="block w-full text-left px-4 py-2.5 hover:bg-primary/10 transition-colors"
                    onClick={() => setIsPagesOpen(false)}
                  >
                    404 Page
                  </Link>
                </div>
              )}
            </div>
            
            <Link 
              to="/contact"
              className={`px-3 py-2 rounded-lg transition-colors font-medium hover:bg-white/10 ${
                isActive('/contact') ? 'bg-white/20' : ''
              }`}
            >
              Contact
            </Link>

            {/* Auth Links - Desktop */}
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="px-3 py-2 rounded-lg transition-colors font-medium hover:bg-red-500/20 text-sm"
              >
                Logout
              </button>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="px-3 py-2 rounded-lg transition-colors font-medium hover:bg-white/10 text-sm"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="px-3 py-2 bg-white text-primary rounded-lg transition-colors font-semibold hover:bg-gray-100 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Phone Button - Desktop */}
          <Link 
            to="/contact"
            className="hidden lg:inline-block bg-secondary text-white py-2 px-4 rounded-full transition-colors hover:bg-orange-600 text-sm font-medium"
          >
            <Phone size={16} className="inline mr-2" /> +255 74257 86 91
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[600px] opacity-100 pb-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="border-t border-white/10 space-y-1">
            <Link 
              to="/"
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-left ${
                isActive('/') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} /> Home
            </Link>
            
            <Link 
              to="/shop"
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-left ${
                isActive('/shop') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingBag size={18} /> Shop
            </Link>
            
            <Link 
              to="/single-page"
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-left ${
                isActive('/single-page') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Layers size={18} /> Single Page
            </Link>
            
            {/* Mobile Categories */}
            <div>
              <button 
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/10 rounded-lg transition-colors text-left"
                onClick={toggleMobileCategories}
              >
                <span className="flex items-center gap-3"><Menu size={18} /> Categories</span>
                <ChevronDown size={16} className={`transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMobileCategoriesOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-white/20 pl-4">
                  {categories.map((cat, idx) => (
                    <Link 
                      key={idx} 
                      to={`/category/${cat.name.toLowerCase().replace(/ /g, '-')}`}
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{cat.name}</span>
                      <span className="text-white/40 text-xs bg-white/10 px-2 py-0.5 rounded-full">({cat.count})</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Mobile Pages */}
            <div>
              <button 
                className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/10 rounded-lg transition-colors text-left"
                onClick={toggleMobilePages}
              >
                <span className="flex items-center gap-3"><Layers size={18} /> Pages</span>
                <ChevronDown size={16} className={`transition-transform ${isMobilePagesOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMobilePagesOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-white/20 pl-4">
                  <Link 
                    to="/bestseller"
                    className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bestseller
                  </Link>
                  <Link 
                    to="/cart"
                    className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart Page
                  </Link>
                  <Link 
                    to="/checkout"
                    className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Checkout
                  </Link>
                  <Link 
                    to="/404"
                    className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    404 Page
                  </Link>
                </div>
              )}
            </div>
            
            <Link 
              to="/contact"
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors text-left ${
                isActive('/contact') ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Mail size={18} /> Contact
            </Link>

            {/* Mobile Auth Links */}
            <div className="border-t border-white/10 my-2 pt-2">
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                    navigate('/login');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/20 rounded-lg transition-colors text-left text-red-300"
                >
                  <LogIn size={18} /> Logout
                </button>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 rounded-lg transition-colors text-left"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn size={18} /> Sign In
                  </Link>
                  <Link 
                    to="/register"
                    className="flex items-center gap-3 w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left font-semibold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserPlus size={18} /> Create Account
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Contact Button */}
            <Link 
              to="/contact"
              className="block w-full bg-secondary text-white text-center rounded-full py-2.5 transition-colors hover:bg-orange-600 mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Phone size={16} className="inline mr-2" /> +0123 456 7890
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;