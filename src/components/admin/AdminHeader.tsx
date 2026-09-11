// src/components/admin/AdminHeader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User as UserIcon,
  ChevronDown,
  Settings,
  LogOut,
  HelpCircle,
  Loader2,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'New order #1234', time: '5 min ago', read: false },
    { id: 2, title: 'Product low stock', time: '1 hour ago', read: false },
    { id: 3, title: 'Customer review pending', time: '3 hours ago', read: true },
  ];

  /* ---------- Close dropdowns on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------- Derived user info ---------- */
  const displayName =
    user?.full_name ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name) ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'User';

  const userEmail = user?.email || '';

  const initials = (() => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.first_name && user?.last_name) {
      return (
        user.first_name[0] + user.last_name[0]
      ).toUpperCase();
    }
    if (user?.first_name) return user.first_name[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  })();

  const avatarUrl =
    user?.profile_picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=amber&color=fff&size=64`;

  const roleLabel =
    user?.user_type === 'admin'
      ? 'Administrator'
      : user?.user_type === 'distributor'
      ? 'Distributor'
      : 'Customer';

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-amber-200/30 shadow-sm sticky top-0 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        {/* Left: menu + search */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-amber-50 transition-colors text-amber-600"
          >
            <Menu size={22} />
          </button>
          <div className="hidden md:flex items-center bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200/30">
            <Search size={18} className="text-amber-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none px-2 py-1 text-sm w-48"
            />
          </div>
        </div>

        {/* Right: notifications + profile */}
        <div className="flex items-center gap-2">
          {/* ---------- NOTIFICATIONS ---------- */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() =>
                setIsNotificationsOpen(!isNotificationsOpen)
              }
              className="p-2 rounded-lg hover:bg-amber-50 transition-colors text-amber-600 relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-amber-200/30 z-50">
                <div className="px-4 py-3 border-b border-amber-100/50 bg-amber-50/30 flex items-center justify-between">
                  <h6 className="font-semibold text-gray-800">
                    Notifications
                  </h6>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-gray-400">
                      No notifications
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-amber-50/50 border-b border-amber-100/30 ${
                          !n.read ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-700">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {n.time}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-amber-100/50 text-center">
                  <Link
                    to="/admin/notifications"
                    className="text-sm text-amber-600 font-medium hover:text-amber-700"
                    onClick={() => setIsNotificationsOpen(false)}
                  >
                    View all
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ---------- PROFILE ---------- */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Loader2 size={14} className="text-amber-500 animate-spin" />
                </div>
              ) : (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover border border-amber-200"
                />
              )}
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                  {isLoading ? 'Loading…' : displayName}
                </span>
                <span className="text-[10px] text-amber-500">
                  {isLoading ? '' : roleLabel}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-amber-500 transition-transform ${
                  isProfileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-amber-200/30 z-50">
                {/* Header: user info */}
                <div className="px-4 py-3 border-b border-amber-100/50 bg-amber-50/30">
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
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-medium">
                    <UserIcon size={10} />
                    {roleLabel}
                  </div>
                </div>

                {/* Menu links */}
                <Link
                  to="/admin/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 text-sm text-gray-700"
                >
                  <UserIcon size={16} className="text-amber-400" />
                  Profile
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 text-sm text-gray-700"
                >
                  <Settings size={16} className="text-amber-400" />
                  Settings
                </Link>
                <Link
                  to="/help"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80 text-sm text-gray-700"
                >
                  <HelpCircle size={16} className="text-amber-400" />
                  Help
                </Link>

                {/* Logout */}
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
    </header>
  );
};

export default AdminHeader;