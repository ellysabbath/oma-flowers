// src/components/admin/AdminHeader.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, User, ChevronDown, Settings, LogOut, HelpCircle } from 'lucide-react';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'New order #1234', time: '5 min ago', read: false },
    { id: 2, title: 'Product low stock', time: '1 hour ago', read: false },
    { id: 3, title: 'Customer review pending', time: '3 hours ago', read: true },
  ];

  return (
    <header className="bg-white border-b border-amber-200/30 shadow-sm sticky top-0 z-30">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-amber-50 transition-colors text-amber-600"
          >
            <Menu size={22} />
          </button>
          <div className="hidden md:flex items-center bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200/30">
            <Search size={18} className="text-amber-400" />
            <input type="text" placeholder="Search..." className="bg-transparent outline-none px-2 py-1 text-sm w-48" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-lg hover:bg-amber-50 transition-colors text-amber-600 relative"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-amber-200/30 z-50">
                <div className="px-4 py-3 border-b border-amber-100/50 bg-amber-50/30">
                  <h6 className="font-semibold text-gray-800">Notifications</h6>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-amber-50/50 border-b border-amber-100/30 ${!n.read ? 'bg-amber-50/30' : ''}`}>
                      <p className="text-sm text-gray-700">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-amber-100/50 text-center">
                  <Link to="/admin/notifications" className="text-sm text-amber-600 font-medium">View all</Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=amber&color=fff&size=32" alt="Admin" className="w-8 h-8 rounded-full" />
              <ChevronDown size={16} className={`text-amber-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-amber-200/30 z-50">
                <div className="px-4 py-3 border-b border-amber-100/50 bg-amber-50/30">
                  <p className="font-semibold text-gray-800">Admin User</p>
                  <p className="text-xs text-amber-500">admin@omaflowers.com</p>
                </div>
                <Link to="/admin/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80">
                  <User size={16} className="text-amber-400" /> Profile
                </Link>
                <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50/80">
                  <Settings size={16} className="text-amber-400" /> Settings
                </Link>
                <div className="border-t border-amber-100/50 mt-1 pt-1">
                  <button className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50">
                    <LogOut size={16} /> Logout
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