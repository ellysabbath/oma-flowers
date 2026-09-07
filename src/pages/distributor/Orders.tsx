// src/pages/distributor/Orders.tsx
import React, { useState } from 'react';
import { Search, Filter, Eye, ChevronDown, Calendar, Download, Printer } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  customerPhone: string;
  items: number;
  amount: number;
  commission: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
}

const ordersData: Order[] = [
  {
    id: 'OMA-2026-0045',
    customer: 'Jane Smith',
    customerPhone: '+255 712 345 678',
    items: 3,
    amount: 250000,
    commission: 75000,
    status: 'Delivered',
    date: '2026-07-20',
    paymentStatus: 'Paid'
  },
  {
    id: 'OMA-2026-0044',
    customer: 'Peter Wilson',
    customerPhone: '+255 765 432 100',
    items: 2,
    amount: 34000,
    commission: 10200,
    status: 'Processing',
    date: '2026-07-19',
    paymentStatus: 'Paid'
  },
  {
    id: 'OMA-2026-0043',
    customer: 'Sarah Johnson',
    customerPhone: '+255 698 765 432',
    items: 1,
    amount: 120000,
    commission: 36000,
    status: 'Shipped',
    date: '2026-07-18',
    paymentStatus: 'Paid'
  },
  {
    id: 'OMA-2026-0042',
    customer: 'Mike Brown',
    customerPhone: '+255 754 321 987',
    items: 2,
    amount: 56000,
    commission: 16800,
    status: 'Pending',
    date: '2026-07-17',
    paymentStatus: 'Unpaid'
  },
  {
    id: 'OMA-2026-0041',
    customer: 'Alice Mwangi',
    customerPhone: '+255 745 678 123',
    items: 4,
    amount: 340000,
    commission: 102000,
    status: 'Delivered',
    date: '2026-07-16',
    paymentStatus: 'Paid'
  },
  {
    id: 'OMA-2026-0040',
    customer: 'Robert Davis',
    customerPhone: '+255 756 789 123',
    items: 1,
    amount: 56000,
    commission: 16800,
    status: 'Cancelled',
    date: '2026-07-15',
    paymentStatus: 'Unpaid'
  }
];

const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Processing': 'bg-blue-100 text-blue-700',
  'Shipped': 'bg-purple-100 text-purple-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700'
};

const paymentColors: Record<string, string> = {
  'Paid': 'bg-green-100 text-green-700',
  'Unpaid': 'bg-red-100 text-red-700',
  'Partial': 'bg-yellow-100 text-yellow-700'
};

const DistributorOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');

  const filteredOrders = ordersData.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    const matchesPayment = filterPayment === 'All' || o.paymentStatus === filterPayment;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalOrders = ordersData.length;
  const totalCommission = ordersData.reduce((sum, o) => sum + o.commission, 0);
  const totalAmount = ordersData.reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = ordersData.filter(o => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
            <p className="text-gray-500 mt-1">Manage and track all your customer orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium">
              <Download size={16} />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalOrders}</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <h3 className="text-2xl font-bold text-yellow-600">{pendingOrders}</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-amber-600">TSh {(totalAmount/1000).toFixed(1)}K</h3>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <p className="text-sm text-gray-500">Total Commission</p>
            <h3 className="text-2xl font-bold text-green-600">TSh {(totalCommission/1000).toFixed(1)}K</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
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
                      <p className="text-xs text-gray-400">{order.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{order.items}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentColors[order.paymentStatus]}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-amber-600">
                      TSh {order.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">
                      TSh {order.commission.toLocaleString()}
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
    </div>
  );
};

export default DistributorOrders;