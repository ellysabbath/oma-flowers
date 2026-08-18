// src/components/admin/AdminLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

const AdminLayout: React.FC = () => {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useAdmin();

  return (
    <div className="min-h-screen bg-amber-50/30 flex flex-col">
      <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className={`transition-all duration-300 flex flex-col min-h-screen ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <AdminHeader toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;