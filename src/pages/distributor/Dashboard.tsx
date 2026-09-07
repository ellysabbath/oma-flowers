// src/pages/distributor/Dashboard.tsx
import React, { useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Award, 
  ChevronDown,
  Eye,
  Download,
  Calendar,
  UserPlus,
  Star,
  Crown,
  Gift
} from 'lucide-react';

interface DistributorStats {
  totalOrders: number;
  totalCommission: number;
  totalBonuses: number;
  downlineCount: number;
  activeDownline: number;
  rank: string;
  pbv: number;
  cgv: number;
  growthRate: number;
}

const stats: DistributorStats = {
  totalOrders: 45,
  totalCommission: 504250,
  totalBonuses: 150000,
  downlineCount: 12,
  activeDownline: 8,
  rank: 'Senior Leader',
  pbv: 85,
  cgv: 12500,
  growthRate: 23.5
};

const DistributorDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('This Month');

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back, John!</h1>
              <p className="text-amber-100 mt-1">Here's your distributor performance overview</p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <span className="bg-white/20 px-4 py-2 rounded-lg text-sm">
                Rank: <span className="font-bold">{stats.rank}</span>
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-lg text-sm">
                PBV: <span className="font-bold">{stats.pbv}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> 12% increase
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <ShoppingBag className="text-amber-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Commission</p>
                <h3 className="text-2xl font-bold text-amber-600">TSh {(stats.totalCommission/1000).toFixed(1)}K</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> 18% increase
                </p>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg">
                <DollarSign className="text-green-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bonuses</p>
                <h3 className="text-2xl font-bold text-purple-600">TSh {(stats.totalBonuses/1000).toFixed(1)}K</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> 8% increase
                </p>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Gift className="text-purple-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Downline</p>
                <h3 className="text-2xl font-bold text-blue-600">{stats.downlineCount}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> {stats.activeDownline} Active
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Users className="text-blue-500" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 hover:shadow-md transition-shadow text-center">
            <div className="p-2 bg-amber-100 rounded-lg inline-block mb-2">
              <UserPlus className="text-amber-600" size={20} />
            </div>
            <p className="text-sm font-medium text-gray-700">Add Downline</p>
          </button>
          <button className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 hover:shadow-md transition-shadow text-center">
            <div className="p-2 bg-blue-100 rounded-lg inline-block mb-2">
              <ShoppingBag className="text-blue-600" size={20} />
            </div>
            <p className="text-sm font-medium text-gray-700">New Order</p>
          </button>
          <button className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 hover:shadow-md transition-shadow text-center">
            <div className="p-2 bg-green-100 rounded-lg inline-block mb-2">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <p className="text-sm font-medium text-gray-700">Request Payout</p>
          </button>
          <button className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 hover:shadow-md transition-shadow text-center">
            <div className="p-2 bg-purple-100 rounded-lg inline-block mb-2">
              <Download className="text-purple-600" size={20} />
            </div>
            <p className="text-sm font-medium text-gray-700">View Reports</p>
          </button>
        </div>

        {/* Recent Orders & Downline Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders />
          <DownlineActivity />
        </div>
      </div>
    </div>
  );
};

// Recent Orders Component
const RecentOrders: React.FC = () => {
  const orders = [
    { id: 'OMA-2026-0045', customer: 'Jane Smith', amount: 250000, status: 'Delivered', date: '2026-07-20' },
    { id: 'OMA-2026-0044', customer: 'Peter Wilson', amount: 34000, status: 'Processing', date: '2026-07-19' },
    { id: 'OMA-2026-0043', customer: 'Sarah Johnson', amount: 120000, status: 'Shipped', date: '2026-07-18' },
    { id: 'OMA-2026-0042', customer: 'Mike Brown', amount: 56000, status: 'Pending', date: '2026-07-17' },
  ];

  const statusColors = {
    'Delivered': 'bg-green-100 text-green-700',
    'Processing': 'bg-blue-100 text-blue-700',
    'Shipped': 'bg-purple-100 text-purple-700',
    'Pending': 'bg-yellow-100 text-yellow-700'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Recent Orders</h3>
        <button className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          View All <Eye size={14} />
        </button>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50/50 transition-colors border-b border-amber-100/30 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-700">{order.id}</p>
              <p className="text-xs text-gray-400">{order.customer}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-amber-600">TSh {order.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{order.date}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
              {order.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Downline Activity Component
const DownlineActivity: React.FC = () => {
  const downline = [
    { name: 'Sarah Smith', rank: 'Crown Director', pbv: 280, orders: 12, commission: 196000, status: 'Active' },
    { name: 'Mike Johnson', rank: 'Director', pbv: 220, orders: 8, commission: 132000, status: 'Active' },
    { name: 'Peter Wilson', rank: 'Senior Manager', pbv: 180, orders: 6, commission: 90000, status: 'Active' },
    { name: 'Jane Brown', rank: 'Manager', pbv: 140, orders: 4, commission: 59500, status: 'Active' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Downline Activity</h3>
        <button className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          View All <Eye size={14} />
        </button>
      </div>
      <div className="space-y-3">
        {downline.map((member, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50/50 transition-colors border-b border-amber-100/30 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{member.name}</p>
                <p className="text-xs text-amber-600">{member.rank}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-amber-600">TSh {member.commission.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{member.orders} orders</p>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {member.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributorDashboard;