// src/components/Layout/Header.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Heart,
  RefreshCw,
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cartAPI } from '../../api/cart';
import { categoryAPI } from '../../api/categories';
import type { Category } from '../../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const getOrCreateSessionKey = (): string => {
  const KEY = 'cart_session_key';
  let sk = localStorage.getItem(KEY);
  if (!sk) {
    sk = `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem(KEY, sk);
  }
  return sk;
};

const readUserId = (): number | null => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
};

const readWishlistCount = (): number => {
  try {
    const raw = localStorage.getItem('wishlist');
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
};

const formatTZS = (value: number): string =>
  `${value.toLocaleString()}TZS/=`;

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

interface HeaderProps {
  cartCount?: number;
}

const Header: React.FC<HeaderProps> = ({ cartCount: cartCountOverride }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /* ---------- Categories (OMA Flowers classes) ---------- */
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  /* ---------- Live cart state ---------- */
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState<number>(cartCountOverride ?? 0);
  const [cartSubtotal, setCartSubtotal] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(
    readWishlistCount()
  );

  /* ---------- Load categories once ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await categoryAPI.getAll();
        const normalized: Category[] = Array.isArray(data)
          ? data
          : (data as any)?.results || [];
        if (!cancelled) setCategories(normalized);
      } catch (err) {
        console.warn('Header: could not load categories', err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Load cart ---------- */
  const loadCart = useCallback(async () => {
    try {
      const userId = readUserId();
      const sessionKey = userId ? null : getOrCreateSessionKey();

      const cart = await cartAPI.getOrCreateForUser(userId, sessionKey);

      setCartId(cart.id);
      setCartCount(cart.total_items ?? 0);
      setCartSubtotal(Number(cart.subtotal ?? 0));
    } catch (err) {
      console.warn('Header: could not load cart', err);
    }
  }, []);

  const refreshWishlist = () => setWishlistCount(readWishlistCount());

  /* ---------- Effects ---------- */
  useEffect(() => {
    loadCart();
    refreshWishlist();

    const onCartUpdated = () => loadCart();
    const onWishlistUpdated = () => refreshWishlist();

    window.addEventListener('cart:updated', onCartUpdated);
    window.addEventListener('wishlist:updated', onWishlistUpdated);

    return () => {
      window.removeEventListener('cart:updated', onCartUpdated);
      window.removeEventListener('wishlist:updated', onWishlistUpdated);
    };
  }, [loadCart]);

  useEffect(() => {
    loadCart();
  }, [isAuthenticated, loadCart]);

  /* ---------- Handlers ---------- */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);

    const query = params.toString();
    navigate(query ? `/search?${query}` : '/shop');
  };

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    navigate('/login');
    setTimeout(() => loadCart(), 0);
  };

  /* ---------- Derived ---------- */
  const effectiveCartCount = cartCountOverride ?? cartCount;
  const displayName =
    user?.first_name || user?.username || user?.email || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  /* ---------- Render ---------- */
  return (
    <header className="bg-gradient-to-r from-amber-50 via-white to-amber-50 py-4 hidden lg:block border-b border-amber-200/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <Crown
                className="text-amber-600 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:text-amber-700"
                size={32}
              />
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

          {/* Search — dropdown now shows real OMA Flowers classes */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
            <div className="flex rounded-full border-2 border-amber-200/60 overflow-hidden shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-300 bg-white">
              <input
                type="text"
                placeholder="Search Looking For?"
                className="flex-1 px-4 py-3 outline-none text-gray-700 bg-transparent placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-l border-amber-200/60 outline-none bg-amber-50/50 text-gray-600 hover:bg-amber-100/50 cursor-pointer transition-colors duration-200 max-w-[220px] truncate"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.code}>
                    {cat.code} — {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:shadow-lg"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              className="p-2.5 border-2 border-amber-200/60 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 transform group"
              aria-label="Compare"
            >
              <RefreshCw
                size={20}
                className="text-amber-600 group-hover:text-amber-700 transition-colors"
              />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 border-2 border-amber-200/60 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 transform relative group"
            >
              <Heart
                size={20}
                className="text-amber-600 group-hover:text-amber-700 transition-colors"
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center gap-2 p-2.5 border-2 border-amber-200/60 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 transform group"
            >
              <div className="relative">
                <ShoppingCart
                  size={20}
                  className="text-amber-600 group-hover:text-amber-700 transition-colors"
                />
                {effectiveCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-md">
                    {effectiveCartCount}
                  </span>
                )}
              </div>
              <span className="text-amber-800 font-semibold">
                {formatTZS(cartSubtotal)}
              </span>
            </Link>

            {/* Account dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center gap-1 p-2.5 border-2 border-amber-200/60 rounded-full hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 hover:scale-105 transform group"
              >
                <User
                  size={20}
                  className="text-amber-600 group-hover:text-amber-700 transition-colors"
                />
                <ChevronDown
                  size={16}
                  className={`text-amber-400 transition-all duration-300 ${
                    isAccountOpen ? 'rotate-180 text-amber-600' : ''
                  }`}
                />
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-amber-200/50 py-2 z-50 animate-fadeIn">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-amber-100/80 bg-gradient-to-r from-amber-50/50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                            {avatarInitial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">
                              {displayName}
                            </p>
                            <p className="text-sm text-amber-600 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <User
                          size={18}
                          className="text-amber-500 group-hover:text-amber-600"
                        />
                        <span className="group-hover:text-amber-700">
                          My Account
                        </span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <ShoppingBag
                          size={18}
                          className="text-amber-500 group-hover:text-amber-600"
                        />
                        <span className="group-hover:text-amber-700">
                          My Orders
                        </span>
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <Heart
                          size={18}
                          className="text-amber-500 group-hover:text-amber-600"
                        />
                        <span className="group-hover:text-amber-700">
                          Wishlist
                        </span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 transition-colors duration-200 border-t border-amber-100/80 mt-1 group"
                      >
                        <LogIn
                          size={18}
                          className="group-hover:text-rose-700"
                        />
                        <span className="group-hover:text-rose-700">
                          Logout
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-amber-100/80">
                        <p className="font-semibold text-gray-800">Welcome!</p>
                        <p className="text-sm text-amber-500">
                          Sign in to your account
                        </p>
                      </div>
                      <Link
                        to="/login"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <LogIn
                          size={18}
                          className="text-amber-500 group-hover:text-amber-600"
                        />
                        <span className="group-hover:text-amber-700">
                          Sign In
                        </span>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 group"
                        onClick={() => setIsAccountOpen(false)}
                      >
                        <UserPlus
                          size={18}
                          className="text-amber-500 group-hover:text-amber-600"
                        />
                        <span className="group-hover:text-amber-700">
                          Create Account
                        </span>
                      </Link>
                      <div className="border-t border-amber-100/80 mt-1 pt-1">
                        <Link
                          to="/reset-password"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 transition-colors duration-200 text-sm text-amber-500 group"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <span className="group-hover:text-amber-700">
                            Forgot Password?
                          </span>
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