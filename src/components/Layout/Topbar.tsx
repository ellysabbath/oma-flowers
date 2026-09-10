// src/components/Layout/Topbar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronDown,
  User,
  Globe,
  Phone,
  HelpCircle,
  LogIn,
  UserCircle,
  Heart,
  ShoppingCart,
  Settings,
  LogOut,
  UserPlus,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const CURRENCIES = [
  { code: 'TZS', label: 'TZS - Shillings' },
  { code: 'USD', label: 'USD - Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - Pound' },
];

const LANGUAGES = [
  { code: 'sw', label: '🇹🇿 Kiswahili' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'de', label: '🇩🇪 German' },
];

const PHONE_NUMBER = '+255 7425 786 91';

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const currencyRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  /* ---------- Close dropdowns on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node)
      ) {
        setIsCurrencyOpen(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setIsLanguageOpen(false);
      }
      if (
        dashboardRef.current &&
        !dashboardRef.current.contains(event.target as Node)
      ) {
        setIsDashboardOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------- Navigation helper ---------- */
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsCurrencyOpen(false);
    setIsLanguageOpen(false);
    setIsDashboardOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDashboardOpen(false);
    navigate('/login');
  };

  /* ---------- Derived user info ---------- */
  const displayName =
    (user as any)?.full_name ||
    `${(user as any)?.first_name || ''} ${
      (user as any)?.last_name || ''
    }`.trim() ||
    (user as any)?.username ||
    'User';

  const displayEmail = (user as any)?.email || '';

  const avatarInitial = (displayName || 'U').charAt(0).toUpperCase();

  /* ---------- Render ---------- */
  return (
    <>
      {/* ================= Desktop Topbar ================= */}
      <div className="hidden lg:block border-b bg-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            {/* Left – Help links */}
            <div className="flex items-center gap-2">
              <span
                onClick={() => handleNavigation('/faq')}
                className="text-gray-600 cursor-pointer hover:text-primary transition-colors"
              >
                Help
              </span>
              <span className="text-gray-300">/</span>
              <span
                onClick={() => handleNavigation('/contact')}
                className="text-gray-600 cursor-pointer hover:text-primary transition-colors"
              >
                Support
              </span>
              <span className="text-gray-300">/</span>
              <span
                onClick={() => handleNavigation('/contact')}
                className="text-gray-600 cursor-pointer hover:text-primary transition-colors"
              >
                Contact
              </span>
            </div>

            {/* Center – Phone */}
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-primary" />
              <span className="text-gray-600">Call Us:</span>
              <a
                href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
                className="text-gray-800 font-medium hover:text-primary transition-colors"
              >
                {PHONE_NUMBER}
              </a>
            </div>

            {/* Right – Dropdowns */}
            <div className="flex items-center gap-4">
              {/* Currency */}
              <div className="relative" ref={currencyRef}>
                <button
                  className="text-gray-600 hover:text-primary flex items-center gap-1 transition-colors"
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                >
                  <span className="font-medium">TZS</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      isCurrencyOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isCurrencyOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    {CURRENCIES.map((c) => (
                      <span
                        key={c.code}
                        onClick={() =>
                          handleNavigation(`/currency/${c.code.toLowerCase()}`)
                        }
                        className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Language */}
              <div className="relative" ref={languageRef}>
                <button
                  className="text-gray-600 hover:text-primary flex items-center gap-1 transition-colors"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                >
                  <Globe size={14} />
                  <span className="font-medium">Kiswahili</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      isLanguageOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    {LANGUAGES.map((l) => (
                      <span
                        key={l.code}
                        onClick={() =>
                          handleNavigation(`/lang/${l.code}`)
                        }
                        className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                      >
                        {l.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dashboard dropdown */}
              <div className="relative" ref={dashboardRef}>
                <button
                  className="text-gray-600 hover:text-primary flex items-center gap-1 transition-colors"
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                >
                  <User size={14} />
                  <span className="font-medium">
                    {isAuthenticated ? displayName : 'My Account'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      isDashboardOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isDashboardOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    {isAuthenticated ? (
                      <>
                        {/* Logged-in user header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                              {avatarInitial}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {displayName}
                              </p>
                              {displayEmail && (
                                <p className="text-xs text-gray-500 truncate">
                                  {displayEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          onClick={() => handleNavigation('/account')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <UserCircle size={16} /> My Account
                        </span>
                        <span
                          onClick={() => handleNavigation('/orders')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <ShoppingBag size={16} /> My Orders
                        </span>
                        <span
                          onClick={() => handleNavigation('/wishlist')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <Heart size={16} /> Wishlist
                        </span>
                        <span
                          onClick={() => handleNavigation('/cart')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <ShoppingCart size={16} /> My Cart
                        </span>
                        <span
                          onClick={() => handleNavigation('/account')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <Settings size={16} /> Settings
                        </span>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <span
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          >
                            <LogOut size={16} /> Log Out
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Guest header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-white">
                          <p className="text-sm font-semibold text-gray-800">
                            Welcome
                          </p>
                          <p className="text-xs text-amber-600">
                            Sign in to your account
                          </p>
                        </div>

                        <span
                          onClick={() => handleNavigation('/login')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <LogIn size={16} /> Sign In
                        </span>
                        <span
                          onClick={() => handleNavigation('/register')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <UserPlus size={16} /> Create Account
                        </span>
                        <span
                          onClick={() => handleNavigation('/wishlist')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <Heart size={16} /> Wishlist
                        </span>
                        <span
                          onClick={() => handleNavigation('/cart')}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <ShoppingCart size={16} /> My Cart
                        </span>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <span
                            onClick={() => handleNavigation('/reset-password')}
                            className="block px-4 py-2 text-xs text-gray-500 hover:text-primary cursor-pointer transition-colors"
                          >
                            Forgot Password?
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Mobile Topbar ================= */}
      <div className="lg:hidden bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            {/* Left – Help */}
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-primary" />
              <span
                onClick={() => handleNavigation('/faq')}
                className="text-gray-600 cursor-pointer hover:text-primary transition-colors"
              >
                Help
              </span>
              <span className="text-gray-300">|</span>
              <span
                onClick={() => handleNavigation('/contact')}
                className="text-gray-600 cursor-pointer hover:text-primary transition-colors"
              >
                Contact
              </span>
            </div>

            {/* Right – Phone & Dropdowns */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-primary" />
                <span className="text-gray-600 text-[10px] hidden sm:inline">
                  Call:
                </span>
                <a
                  href={`tel:${PHONE_NUMBER.replace(/\s/g, '')}`}
                  className="text-gray-800 font-medium text-[10px]"
                >
                  {PHONE_NUMBER}
                </a>
              </div>

              {/* Mobile Account */}
              <div className="relative" ref={dashboardRef}>
                <button
                  className="text-gray-600 hover:text-primary flex items-center gap-0.5 transition-colors"
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                >
                  <User size={12} />
                  <span className="font-medium text-[10px] max-w-[80px] truncate">
                    {isAuthenticated ? displayName : 'Account'}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${
                      isDashboardOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isDashboardOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    {isAuthenticated ? (
                      <>
                        <div className="px-3 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {displayEmail || displayName}
                          </p>
                        </div>
                        <span
                          onClick={() => handleNavigation('/account')}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <UserCircle size={16} /> My Account
                        </span>
                        <span
                          onClick={() => handleNavigation('/orders')}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <ShoppingBag size={16} /> My Orders
                        </span>
                        <span
                          onClick={() => handleNavigation('/wishlist')}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <Heart size={16} /> Wishlist
                        </span>
                        <span
                          onClick={() => handleNavigation('/cart')}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <ShoppingCart size={16} /> Cart
                        </span>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <span
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                          >
                            <LogOut size={16} /> Log Out
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span
                          onClick={() => handleNavigation('/login')}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <LogIn size={16} /> Sign In
                        </span>
                        <span
                          onClick={() => handleNavigation('/register')}
                          className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <UserPlus size={16} /> Create Account
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Currency */}
              <div className="relative" ref={currencyRef}>
                <button
                  className="text-gray-600 hover:text-primary flex items-center gap-0.5 transition-colors"
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                >
                  <span className="font-medium text-[10px]">TZS</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${
                      isCurrencyOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isCurrencyOpen && (
                  <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    {CURRENCIES.map((c) => (
                      <span
                        key={c.code}
                        onClick={() =>
                          handleNavigation(`/currency/${c.code.toLowerCase()}`)
                        }
                        className="block px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                      >
                        {c.code}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Language */}
              <div className="relative" ref={languageRef}>
                <button
                  className="text-gray-600 hover:text-primary flex items-center gap-0.5 transition-colors"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                >
                  <Globe size={12} />
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${
                      isLanguageOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    {LANGUAGES.map((l) => (
                      <span
                        key={l.code}
                        onClick={() => handleNavigation(`/lang/${l.code}`)}
                        className="block px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                      >
                        {l.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;