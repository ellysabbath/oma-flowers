// src/components/admin/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from '../admin/AdminHeader';

const AdminLayout: React.FC = () => {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useAdmin();

  return (
    <div className="min-h-screen bg-amber-50/30">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <AdminHeader toggleSidebar={toggleSidebar} />
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;