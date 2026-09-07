// src/pages/shop/Dashboard.tsx
import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Gift,
  UserPlus
} from 'lucide-react';

const ShopDashboard: React.FC = () => {
  const stats = [
    { label: 'Total Orders', value: 156, change: 12.5, icon: <ShoppingBag size={20} />, color: 'amber' },
    { label: 'Total Customers', value: 234, change: 8.2, icon: <Users size={20} />, color: 'blue' },
    { label: 'Products in Stock', value: 189, change: -3.1, icon: <Package size={20} />, color: 'green' },
    { label: 'Revenue Today', value: 'TSh 128K', change: 15.3, icon: <DollarSign size={20} />, color: 'purple' },
  ];

  // Distributors data
  const distributors = [
    { id: 1, name: 'John Doe', rank: 'Royal Crown Director', pbv: 350, status: 'Active' },
    { id: 2, name: 'Sarah Smith', rank: 'Crown Director', pbv: 280, status: 'Active' },
    { id: 3, name: 'Mike Johnson', rank: 'Director', pbv: 220, status: 'Active' },
    { id: 4, name: 'Peter Wilson', rank: 'Senior Manager', pbv: 180, status: 'Active' },
    { id: 5, name: 'Jane Brown', rank: 'Manager', pbv: 140, status: 'Active' },
  ];

  // Bonuses data
  const bonuses = [
    { id: 1, name: 'Consistency Bonus', amount: 150000, winner: 'John Doe', type: 'Consistency' },
    { id: 2, name: 'Smart Referral Score', amount: 75000, winner: 'John Doe', type: 'Referral' },
    { id: 3, name: 'Diamond Garden Star', amount: 200000, winner: 'John Doe', type: 'Dynamic' },
    { id: 4, name: 'Gold Garden Star', amount: 150000, winner: 'Sarah Smith', type: 'Dynamic' },
    { id: 5, name: 'Mentor Academy Bonus', amount: 250000, winner: 'John Doe', type: 'Training' },
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'Jane Smith', amount: 'TSh 45,000', status: 'Completed', time: '2 mins ago' },
    { id: 'ORD-002', customer: 'John Doe', amount: 'TSh 78,500', status: 'Processing', time: '15 mins ago' },
    { id: 'ORD-003', customer: 'Mary Johnson', amount: 'TSh 32,000', status: 'Pending', time: '1 hour ago' },
    { id: 'ORD-004', customer: 'Peter Wilson', amount: 'TSh 120,000', status: 'Completed', time: '2 hours ago' },
    { id: 'ORD-005', customer: 'Sarah Brown', amount: 'TSh 56,000', status: 'Cancelled', time: '3 hours ago' },
  ];

  const statusColors = {
    'Completed': 'bg-green-100 text-green-700',
    'Processing': 'bg-blue-100 text-blue-700',
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Cancelled': 'bg-red-100 text-red-700'
  };

  const statusIcons = {
    'Completed': <CheckCircle size={14} className="text-green-500" />,
    'Processing': <Clock size={14} className="text-blue-500" />,
    'Pending': <AlertCircle size={14} className="text-yellow-500" />,
    'Cancelled': <XCircle size={14} className="text-red-500" />
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Shop Dashboard</h1>
        <p className="text-gray-500">Welcome back, Sarah! Here's your shop overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h3 className="text-xl font-bold text-gray-800">{stat.value}</h3>
                <p className={`text-xs mt-1 flex items-center gap-1 ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(stat.change)}%
                </p>
              </div>
              <div className={`p-2.5 bg-${stat.color}-50 rounded-lg`}>
                <span className={`text-${stat.color}-500`}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distributors & Bonuses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distributors */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100/30 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-amber-500" />
              Top Distributors
            </h3>
            <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">View All</button>
          </div>
          <div className="divide-y divide-amber-100/30">
            {distributors.map((dist) => (
              <div key={dist.id} className="px-6 py-3 flex items-center justify-between hover:bg-amber-50/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{dist.name}</p>
                  <p className="text-xs text-amber-600">{dist.rank}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-amber-600">{dist.pbv} PBV</p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {dist.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonuses */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100/30 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Gift size={18} className="text-amber-500" />
              Recent Bonuses
            </h3>
            <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">View All</button>
          </div>
          <div className="divide-y divide-amber-100/30">
            {bonuses.map((bonus) => (
              <div key={bonus.id} className="px-6 py-3 flex items-center justify-between hover:bg-amber-50/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{bonus.name}</p>
                  <p className="text-xs text-gray-500">{bonus.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600">TSh {bonus.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{bonus.winner}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-100/30 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Orders</h3>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">View All</button>
        </div>
        <div className="divide-y divide-amber-100/30">
          {recentOrders.map((order) => (
            <div key={order.id} className="px-6 py-3 flex items-center justify-between hover:bg-amber-50/30 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-800">{order.id}</p>
                <p className="text-xs text-gray-500">{order.customer}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-amber-600">{order.amount}</p>
                <p className="text-xs text-gray-400">{order.time}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {statusIcons[order.status as keyof typeof statusIcons]}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;