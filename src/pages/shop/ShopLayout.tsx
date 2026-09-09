// src/components/shop/ShopLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  Settings, 
  LogOut,
  Home,
  Bell,
  Store,
  ChevronDown,
  Menu,
  X,
  ChevronUp,
  BarChart,
  Calendar,
  ShoppingBagIcon
} from 'lucide-react';

const ShopLayout: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mock shop user data
  const user = {
    name: 'Sarah Johnson',
    role: 'Shop Manager',
    shop: 'OMA Flowers - Dar es Salaam'
  };

// src/components/shop/ShopLayout.tsx (updated navItems)
const navItems = [
  { path: '/shops', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/shops/orders', label: 'Orders', icon: <ShoppingBagIcon size={18} /> },
  { path: '/shops/inventory', label: 'Inventory', icon: <Package size={18} /> },
  { path: '/shops/customers', label: 'Customers', icon: <Users size={18} /> },
  { path: '/shops/analytics', label: 'Analytics', icon: <BarChart size={18} /> },
  { path: '/shops/calendar', label: 'Calendar', icon: <Calendar size={18} /> },
  { path: '/shops/settings', label: 'Settings', icon: <Settings size={18} /> },
];

  const isActive = (path: string) => location.pathname === path;

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ 
        top: scrollContainerRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col">
      {/* shop Header */}
      <header className="bg-white border-b border-amber-200/30 shadow-sm sticky top-0 z-40 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
              >
                {isMobileMenuOpen ? <X size={22} className="text-gray-600" /> : <Menu size={22} className="text-gray-600" />}
              </button>

              <Link to="/shop" className="flex items-center gap-2">
                <Store className="text-amber-600" size={24} />
                <span className="text-xl font-bold text-amber-600">OMA shop</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 rounded-lg hover:bg-amber-50 transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-sm">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'shop Manager'}</p>
                  <p className="text-xs text-amber-500">{user?.role || 'Manager'}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
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

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-200/30">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
              style={{
                width: scrollContainerRef.current 
                  ? `${(scrollContainerRef.current.scrollTop / (scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight)) * 100}%` 
                  : '0%'
              }}
            />
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div 
          className={`fixed top-16 left-0 bottom-0 w-72 bg-white border-r border-amber-200/30 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-amber-100/30 bg-amber-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.name || 'shop Manager'}</p>
                  <p className="text-xs text-amber-500">{user?.role || 'Manager'}</p>
                  <p className="text-xs text-gray-400">{user?.shop}</p>
                </div>
              </div>
            </div>

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
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ShopLayout;