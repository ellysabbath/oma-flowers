// src/components/distributor/DistributorLayout.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Award,
  Settings,
  LogOut,
  Home,
  Bell,
  ChevronDown,
  Menu,
  X,
  ChevronUp,
  Loader2,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext'; 

const DistributorLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, distributor, logout, isLoading } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ---------- Derived user info ---------- */
  const displayName =
    user?.full_name ||
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'Distributor';

  const displayRank = distributor?.rank || 'Associate';

  const initials = useMemo(() => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.first_name && user?.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    }
    if (user?.first_name) return user.first_name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'D';
  }, [user]);

  const avatarUrl =
    user?.profile_picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=f59e0b&color=fff&size=64`;

  const navItems = [
    {
      path: '/distributor',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      path: '/distributor/orders',
      label: 'My Orders',
      icon: <ShoppingBag size={18} />,
    },
    {
      path: '/distributor/downline',
      label: 'My Downline',
      icon: <Users size={18} />,
    },
    {
      path: '/distributor/commissions',
      label: 'Commissions',
      icon: <Award size={18} />,
    },
    {
      path: '/distributor/settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  /* ---------- Scroll detection ---------- */
  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        setShowScrollTop(scrollTop > 20);
        setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 20);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      setTimeout(checkScroll, 100);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  /* ---------- Close menus on route change ---------- */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  /* ---------- Close profile dropdown on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------- Scroll helpers ---------- */
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed:', e);
      // Fallback: force-clear and redirect
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('distributor');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="bg-white border-b border-amber-200/30 shadow-sm sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: menu toggle + logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X size={22} className="text-gray-600" />
                ) : (
                  <Menu size={22} className="text-gray-600" />
                )}
              </button>

              <Link to="/distributor" className="flex items-center gap-2">
                <span className="text-2xl font-bold text-amber-600">OMA</span>
                <span className="text-sm text-gray-400 hidden sm:inline">
                  Distributor
                </span>
              </Link>
            </div>

            {/* Right: notifications + profile */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 rounded-lg hover:bg-amber-50 transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  {isLoading ? (
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Loader2
                        size={14}
                        className="text-amber-500 animate-spin"
                      />
                    </div>
                  ) : (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover border border-amber-200"
                    />
                  )}
                  <div className="hidden md:block text-left leading-tight">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">
                      {isLoading ? 'Loading…' : displayName}
                    </p>
                    <p className="text-xs text-amber-500 truncate max-w-[140px]">
                      {isLoading ? '' : displayRank}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 hidden sm:block transition-transform ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-amber-200/30 z-50">
                    <div className="p-4 border-b border-amber-100/50 bg-amber-50/30">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-10 h-10 rounded-full object-cover border border-amber-200"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-amber-500 truncate">
                            {user?.email || ''}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                        {displayRank}
                      </div>
                    </div>

                    <Link
                      to="/distributor/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 text-sm text-gray-700"
                    >
                      <Settings size={16} className="text-amber-400" />
                      Settings
                    </Link>
                    <Link
                      to="/distributor/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 text-sm text-gray-700"
                    >
                      <Home size={16} className="text-amber-400" />
                      my profile
                    </Link>

                    <div className="border-t border-amber-100/50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-sm disabled:opacity-50"
                      >
                        {isLoggingOut ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <LogOut size={16} />
                        )}
                        {isLoggingOut ? 'Logging out…' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= LAYOUT ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---------- Desktop sidebar ---------- */}
        <aside
          ref={sidebarRef}
          className="hidden md:flex md:flex-col w-64 bg-white border-r border-amber-200/30 flex-shrink-0 sticky top-16 h-[calc(100vh-64px)]"
        >
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="absolute left-1/2 -translate-x-1/2 z-10 bg-amber-500/80 hover:bg-amber-500 text-white rounded-full p-1.5 shadow-lg transition-all duration-300 border border-amber-400/30"
              style={{ top: '4px' }}
            >
              <ChevronUp size={14} />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-amber-300/30 scrollbar-track-transparent hover:scrollbar-thumb-amber-400/40"
          >
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-amber-50 text-amber-600 font-medium border border-amber-200/50'
                      : 'text-gray-600 hover:bg-amber-50/50 hover:text-amber-600'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="border-t border-amber-100/30 my-2 pt-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-gray-600 hover:bg-amber-50/50 hover:text-amber-600"
                >
                  <Home size={18} />
                  <span>Back to Site</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <LogOut size={18} />
                  )}
                  <span>{isLoggingOut ? 'Logging out…' : 'Logout'}</span>
                </button>
              </div>
            </nav>
          </div>

          {showScrollBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute left-1/2 -translate-x-1/2 z-10 bg-amber-500/80 hover:bg-amber-500 text-white rounded-full p-1.5 shadow-lg transition-all duration-300 border border-amber-400/30"
              style={{ bottom: '4px' }}
            >
              <ChevronDown size={14} />
            </button>
          )}
        </aside>

        {/* ---------- Mobile sidebar overlay ---------- */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* ---------- Mobile sidebar ---------- */}
        <div
          className={`fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-amber-200/30 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Mobile user info */}
            <div className="p-4 border-b border-amber-100/30 bg-amber-50/30">
              <div className="flex items-center gap-3">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-amber-200"
                />
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-amber-500 truncate">
                    {displayRank}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-amber-50 text-amber-600 font-medium border border-amber-200/50'
                        : 'text-gray-600 hover:bg-amber-50/50 hover:text-amber-600'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="border-t border-amber-100/30 my-2 pt-2">
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-amber-50/50 hover:text-amber-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Home size={18} />
                    <span>Back to Site</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LogOut size={18} />
                    )}
                    <span>{isLoggingOut ? 'Logging out…' : 'Logout'}</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* ---------- Main content ---------- */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DistributorLayout;