import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Globe, Phone, HelpCircle, LogIn, UserCircle, Heart, ShoppingCart, Settings, LogOut } from 'lucide-react';

const Topbar: React.FC = () => {
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  
  const currencyRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (path: string) => {
    window.location.href = path;
    setIsCurrencyOpen(false);
    setIsLanguageOpen(false);
    setIsDashboardOpen(false);
  };

  return (
    <>
      {/* Desktop Topbar */}
      <div className="hidden lg:block border-b bg-white">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            {/* Left Section - Help Links */}
            <div className="flex items-center gap-2">
              <span 
                onClick={() => handleNavigation('/help')}
                className="text-gray-600 cursor-pointer hover:text-primary transition-colors"
              >
                Help
              </span>
              <span className="text-gray-300">/</span>
              <span 
                onClick={() => handleNavigation('/support')}
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

            {/* Center Section - Phone */}
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-primary" />
              <span className="text-gray-600">Call Us:</span>
              <span className="text-gray-800 font-medium hover:text-primary cursor-pointer transition-colors">
                (+012) 1234 567890
              </span>
            </div>

            {/* Right Section - Dropdowns */}
            <div className="flex items-center gap-4">
              {/* Currency Dropdown */}
              <div className="relative" ref={currencyRef}>
                <button 
                  className="text-gray-600 hover:text-primary flex items-center gap-1 transition-colors"
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                >
                  <span className="font-medium">USD</span>
                  <ChevronDown size={14} className={`transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCurrencyOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    <span 
                      onClick={() => handleNavigation('/currency/usd')}
                      className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      USD - Dollar
                    </span>
                    <span 
                      onClick={() => handleNavigation('/currency/eur')}
                      className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      EUR - Euro
                    </span>
                    <span 
                      onClick={() => handleNavigation('/currency/gbp')}
                      className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      GBP - Pound
                    </span>
                  </div>
                )}
              </div>

              {/* Language Dropdown */}
              <div className="relative" ref={languageRef}>
                <button 
                  className="text-gray-600 hover:text-primary flex items-center gap-1 transition-colors"
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                >
                  <Globe size={14} />
                  <span className="font-medium">English</span>
                  <ChevronDown size={14} className={`transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    <span 
                      onClick={() => handleNavigation('/lang/en')}
                      className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      🇺🇸 English
                    </span>
                    <span 
                      onClick={() => handleNavigation('/lang/tr')}
                      className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      🇹🇷 Turkish
                    </span>
                    <span 
                      onClick={() => handleNavigation('/lang/es')}
                      className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      🇪🇸 Spanish
                    </span>
                    <span 
                      onClick={() => handleNavigation('/lang/fr')}
                      className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      🇫🇷 French
                    </span>
                    <span 
                      onClick={() => handleNavigation('/lang/de')}
                      className="block px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      🇩🇪 German
                    </span>
                  </div>
                )}
              </div>

              {/* Dashboard Dropdown */}
              <div className="relative" ref={dashboardRef}>
                <button 
                  className="text-gray-600 hover:text-primary flex items-center gap-1 transition-colors"
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                >
                  <User size={14} />
                  <span className="font-medium">My Dashboard</span>
                  <ChevronDown size={14} className={`transition-transform ${isDashboardOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDashboardOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-800">user@example.com</p>
                    </div>
                    <span 
                      onClick={() => handleNavigation('/login')}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      <LogIn size={16} /> Login
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
                      <UserCircle size={16} /> Account Settings
                    </span>
                    <span 
                      onClick={() => handleNavigation('/settings')}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </span>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <span 
                        onClick={() => handleNavigation('/logout')}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      >
                        <LogOut size={16} /> Log Out
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Topbar */}
      <div className="lg:hidden bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-xs">
            {/* Left - Help */}
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-primary" />
              <span 
                onClick={() => handleNavigation('/help')}
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

            {/* Right - Phone & Dropdowns */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-primary" />
                <span className="text-gray-600 text-[10px] hidden sm:inline">Call:</span>
                <span className="text-gray-800 font-medium text-[10px]">+0123 456 7890</span>
              </div>

              {/* Mobile Currency */}
              <div className="relative" ref={currencyRef}>
                <button 
                  className="text-gray-600 hover:text-primary flex items-center gap-0.5 transition-colors"
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                >
                  <span className="font-medium text-[10px]">USD</span>
                  <ChevronDown size={12} className={`transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCurrencyOpen && (
                  <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    <span 
                      onClick={() => handleNavigation('/currency/usd')}
                      className="block px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      USD
                    </span>
                    <span 
                      onClick={() => handleNavigation('/currency/eur')}
                      className="block px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      EUR
                    </span>
                    <span 
                      onClick={() => handleNavigation('/currency/gbp')}
                      className="block px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      GBP
                    </span>
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
                  <ChevronDown size={12} className={`transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                </button>
                {isLanguageOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                    <span 
                      onClick={() => handleNavigation('/lang/en')}
                      className="block px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      🇺🇸 English
                    </span>
                    <span 
                      onClick={() => handleNavigation('/lang/tr')}
                      className="block px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      🇹🇷 Turkish
                    </span>
                    <span 
                      onClick={() => handleNavigation('/lang/es')}
                      className="block px-3 py-1.5 text-xs hover:bg-primary/10 cursor-pointer transition-colors"
                    >
                      🇪🇸 Spanish
                    </span>
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