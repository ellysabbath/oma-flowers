// src/pages/shop/Customers.tsx
import React, { useState } from 'react';
import { Search, Filter, UserPlus, Eye, Mail, Phone, Calendar, Users } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
}

const customersData: Customer[] = [
  { id: 1, name: 'Jane Smith', email: 'jane.smith@email.com', phone: '+255 712 345 678', orders: 12, totalSpent: 450000, joinDate: '2026-01-15', status: 'Active' },
  { id: 2, name: 'John Doe', email: 'john.doe@email.com', phone: '+255 765 432 100', orders: 8, totalSpent: 320000, joinDate: '2026-02-20', status: 'Active' },
  { id: 3, name: 'Mary Johnson', email: 'mary.johnson@email.com', phone: '+255 698 765 432', orders: 5, totalSpent: 180000, joinDate: '2026-03-10', status: 'Active' },
  { id: 4, name: 'Peter Wilson', email: 'peter.wilson@email.com', phone: '+255 754 321 987', orders: 15, totalSpent: 560000, joinDate: '2025-11-05', status: 'Active' },
  { id: 5, name: 'Sarah Brown', email: 'sarah.brown@email.com', phone: '+255 745 678 123', orders: 3, totalSpent: 95000, joinDate: '2026-04-18', status: 'Inactive' },
];

const ShopCustomers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredCustomers = customersData.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customersData.length;
  const activeCustomers = customersData.filter(c => c.status === 'Active').length;
  const totalOrders = customersData.reduce((sum, c) => sum + c.orders, 0);
  const totalRevenue = customersData.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500">Manage shop customers</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors shadow-md hover:shadow-lg text-sm font-medium">
          <UserPlus size={16} />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <h3 className="text-2xl font-bold text-gray-800">{totalCustomers}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Active Customers</p>
          <h3 className="text-2xl font-bold text-green-600">{activeCustomers}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <h3 className="text-2xl font-bold text-blue-600">{totalOrders}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <h3 className="text-2xl font-bold text-amber-600">TSh {(totalRevenue/1000).toFixed(1)}K</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-200/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{customer.name}</p>
                      <p className="text-xs text-gray-400">Joined {customer.joinDate}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <p className="text-xs text-gray-400">{customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">{customer.orders}</td>
                  <td className="px-4 py-3 font-bold text-amber-600">TSh {customer.totalSpent.toLocaleString()}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
                      <Eye size={16} className="text-gray-400 hover:text-amber-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-amber-100/30 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredCustomers.length} of {customersData.length} customers</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-amber-500 text-white">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCustomers;