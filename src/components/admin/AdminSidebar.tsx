// src/components/admin/AdminSidebar.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  Award,
  Gift,
  DollarSign,
  Store,
  Home,
  LogOut,
  Crown,
  TrendingUp,
  UserCog,
} from 'lucide-react';
import { authAPI } from '../../api/auth';
import type { User } from '../../types';

interface MenuItem {
  id: number;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { id: 1, label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin' },
  { id: 2, label: 'Users', icon: <UserCog size={18} />, path: '/admin/users' },
  { id: 3, label: 'Distributors', icon: <Users size={18} />, path: '/admin/distributors' },
  { id: 4, label: 'Products', icon: <Package size={18} />, path: '/admin/products' },
  { id: 5, label: 'Orders', icon: <ShoppingCart size={18} />, path: '/admin/orders' },
  { id: 6, label: 'Commissions', icon: <DollarSign size={18} />, path: '/admin/commissions' },
  { id: 7, label: 'Bonuses', icon: <Gift size={18} />, path: '/admin/bonuses' },
  { id: 8, label: 'Awards', icon: <Award size={18} />, path: '/admin/awards' },
  { id: 9, label: 'Shops', icon: <Store size={18} />, path: '/admin/shops' },
  { id: 10, label: 'Analytics', icon: <TrendingUp size={18} />, path: '/admin/analytics' },
  { id: 11, label: 'Categories', icon: <Tag size={18} />, path: '/admin/categories' },
  { id: 12, label: 'Settings', icon: <Settings size={18} />, path: '/admin/settings' },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (path: string) => {
    // Exact match for /admin, prefix match for the rest so
    // /admin/users/123 still highlights "Users".
    if (path === '/admin') return location.pathname === '/admin';
    return (
      location.pathname === path ||
      location.pathname.startsWith(path + '/')
    );
  };

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
        }

        const profile = await authAPI.getProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_type');
      localStorage.removeItem('distributor');

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_type');
      localStorage.removeItem('distributor');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.first_name && user.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    }
    if (user.first_name) return user.first_name[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return 'U';
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.full_name) return user.full_name;
    if (user.first_name && user.last_name)
      return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserRole = () => {
    if (!user) return 'Loading...';
    const roleMap: Record<string, string> = {
      admin: 'Administrator',
      distributor: 'Distributor',
      customer: 'Customer',
    };
    return roleMap[user.user_type] || user.user_type || 'User';
  };

  const getRoleColor = () => {
    if (!user) return 'text-amber-400/70';
    const colorMap: Record<string, string> = {
      admin: 'text-amber-400',
      distributor: 'text-emerald-400',
      customer: 'text-blue-400',
    };
    return colorMap[user.user_type] || 'text-amber-400/70';
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-amber-800 via-amber-700 to-amber-900 text-white z-50
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}
          flex flex-col shadow-2xl shadow-amber-900/30
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-20 border-b border-amber-600/30 px-4 flex-shrink-0">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="relative">
              <Crown
                className="text-amber-300 group-hover:text-amber-200 transition-colors"
                size={32}
              />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <span
              className={`
                font-bold text-lg bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent
                transition-all duration-300
                ${!isOpen ? 'lg:hidden' : ''}
              `}
            >
              OMA Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-amber-500/30">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${
                    isActive(item.path)
                      ? 'bg-amber-500/20 text-amber-100 shadow-inner border border-amber-400/20'
                      : 'hover:bg-amber-600/30 hover:text-amber-100'
                  }
                  ${!isOpen ? 'lg:justify-center' : ''}
                  group relative
                `}
                onClick={() => onClose?.()}
              >
                <span className="text-amber-300 group-hover:text-amber-200 transition-colors">
                  {item.icon}
                </span>
                <span
                  className={`
                    transition-all duration-300
                    ${!isOpen ? 'lg:hidden' : ''}
                    text-sm font-medium flex-1
                  `}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={`
                      bg-amber-500/30 text-amber-200 text-xs px-1.5 py-0.5 rounded-full
                      transition-all duration-300
                      ${!isOpen ? 'lg:hidden' : ''}
                    `}
                  >
                    {item.badge}
                  </span>
                )}
                {!isOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-amber-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap hidden lg:block">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div className="my-4 border-t border-amber-600/20"></div>

          <div className="space-y-1">
            <Link
              to="/"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                hover:bg-amber-600/30 hover:text-amber-100
                ${!isOpen ? 'lg:justify-center' : ''}
                group
              `}
            >
              <Home className="text-amber-300" size={18} />
              <span
                className={`${!isOpen ? 'lg:hidden' : ''} text-sm font-medium`}
              >
                Back to Site
              </span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                hover:bg-rose-500/20 hover:text-rose-200
                ${!isOpen ? 'lg:justify-center' : ''}
                group disabled:opacity-50
              `}
            >
              {isLoggingOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-rose-300 border-t-transparent"></div>
              ) : (
                <LogOut className="text-rose-300" size={18} />
              )}
              <span
                className={`${!isOpen ? 'lg:hidden' : ''} text-sm font-medium`}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            </button>
          </div>
        </nav>

        {/* User Profile */}
        <div
          className={`border-t border-amber-600/30 p-4 flex-shrink-0 ${
            !isOpen ? 'lg:p-3' : ''
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              !isOpen ? 'lg:justify-center' : ''
            }`}
          >
            {loading ? (
              <div className="w-9 h-9 rounded-full bg-amber-600/50 animate-pulse"></div>
            ) : user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={getDisplayName()}
                className="w-9 h-9 rounded-full border-2 border-amber-400/30 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-amber-600/50 flex items-center justify-center text-amber-200 font-bold text-sm border-2 border-amber-400/30">
                {getUserInitials()}
              </div>
            )}
            <div
              className={`transition-all duration-300 flex-1 min-w-0 ${
                !isOpen ? 'lg:hidden' : ''
              }`}
            >
              <p className="text-sm font-medium text-amber-100 truncate">
                {loading ? 'Loading...' : getDisplayName()}
              </p>
              <p className={`text-xs ${getRoleColor()} truncate`}>
                {loading ? 'Loading...' : getUserRole()}
              </p>
              {user?.email && (
                <p className="text-xs text-amber-400/50 truncate">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;