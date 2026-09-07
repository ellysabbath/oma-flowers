// src/pages/shop/Orders.tsx
import React, { useState } from 'react';
import { Search, Filter, Eye, ChevronDown, Printer, Download } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  phone: string;
  items: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  payment: 'Paid' | 'Unpaid' | 'Partial';
  date: string;
}

const ordersData: Order[] = [
  { id: 'ORD-001', customer: 'Jane Smith', phone: '+255 712 345 678', items: 3, total: 45000, status: 'Completed', payment: 'Paid', date: '2026-07-20' },
  { id: 'ORD-002', customer: 'John Doe', phone: '+255 765 432 100', items: 2, total: 78500, status: 'Processing', payment: 'Paid', date: '2026-07-20' },
  { id: 'ORD-003', customer: 'Mary Johnson', phone: '+255 698 765 432', items: 1, total: 32000, status: 'Pending', payment: 'Unpaid', date: '2026-07-19' },
  { id: 'ORD-004', customer: 'Peter Wilson', phone: '+255 754 321 987', items: 4, total: 120000, status: 'Completed', payment: 'Paid', date: '2026-07-19' },
  { id: 'ORD-005', customer: 'Sarah Brown', phone: '+255 745 678 123', items: 2, total: 56000, status: 'Cancelled', payment: 'Unpaid', date: '2026-07-18' },
  { id: 'ORD-006', customer: 'Michael Davis', phone: '+255 756 789 123', items: 3, total: 95000, status: 'Processing', payment: 'Partial', date: '2026-07-18' },
];

const statusColors = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Processing': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700'
};

const paymentColors = {
  'Paid': 'bg-green-100 text-green-700',
  'Unpaid': 'bg-red-100 text-red-700',
  'Partial': 'bg-yellow-100 text-yellow-700'
};

const ShopOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');

  const filteredOrders = ordersData.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    const matchesPayment = filterPayment === 'All' || o.payment === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const stats = {
    total: ordersData.length,
    pending: ordersData.filter(o => o.status === 'Pending').length,
    processing: ordersData.filter(o => o.status === 'Processing').length,
    completed: ordersData.filter(o => o.status === 'Completed').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-500">Manage shop orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors text-sm font-medium">
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <h3 className="text-2xl font-bold text-yellow-600">{stats.pending}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Processing</p>
          <h3 className="text-2xl font-bold text-blue-600">{stats.processing}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
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
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          <option value="All">All Payment</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial</option>
        </select>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-200/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{order.id}</p>
                    <p className="text-xs text-gray-400">{order.date}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{order.items}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[order.payment]}`}>
                      {order.payment}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">
                    TSh {order.total.toLocaleString()}
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
          <span>Showing {filteredOrders.length} of {ordersData.length} orders</span>
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

export default ShopOrders;