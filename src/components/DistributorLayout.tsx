// src/components/distributor/DistributorLayout.tsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Award, 
  Settings, 
  LogOut,
  Home,
  Bell,
  User,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DistributorLayout: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/distributor', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/distributor/orders', label: 'My Orders', icon: <ShoppingBag size={18} /> },
    { path: '/distributor/downline', label: 'My Downline', icon: <Users size={18} /> },
    { path: '/distributor/commissions', label: 'Commissions', icon: <Award size={18} /> },
    { path: '/distributor/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-amber-50/30">
      {/* Distributor Header */}
      <header className="bg-white border-b border-amber-200/30 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/distributor" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-600">OMA</span>
              <span className="text-sm text-gray-400">Distributor</span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-amber-50 transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">{user?.name || 'Distributor'}</p>
                  <p className="text-xs text-amber-500">{user?.rank || 'Senior Leader'}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-amber-200/30 min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4 space-y-1">
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
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DistributorLayout;