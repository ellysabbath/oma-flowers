// src/pages/shop/Analytics.tsx
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag, Award, Gift, Calendar } from 'lucide-react';

const ShopAnalytics: React.FC = () => {
  const monthlyData = [
    { month: 'Jan', revenue: 180000, orders: 45, customers: 23 },
    { month: 'Feb', revenue: 220000, orders: 52, customers: 28 },
    { month: 'Mar', revenue: 280000, orders: 61, customers: 35 },
    { month: 'Apr', revenue: 320000, orders: 58, customers: 32 },
    { month: 'May', revenue: 380000, orders: 72, customers: 41 },
    { month: 'Jun', revenue: 420000, orders: 85, customers: 48 },
    { month: 'Jul', revenue: 504250, orders: 98, customers: 54 },
  ];

  const topProducts = [
    { name: 'Luxury Class A Flower', sales: 45, revenue: 11250000 },
    { name: 'Classic Class B Flower', sales: 78, revenue: 2652000 },
    { name: 'Luxury Class B Flower', sales: 32, revenue: 5120000 },
    { name: 'Classic Class A Flower', sales: 56, revenue: 3136000 },
    { name: 'Luxury Class C Flower', sales: 28, revenue: 3360000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500">Shop performance analytics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Avg Monthly Revenue</p>
          <h3 className="text-xl font-bold text-amber-600">TSh 329K</h3>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> 18.3%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Avg Monthly Orders</p>
          <h3 className="text-xl font-bold text-blue-600">67</h3>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> 12.5%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Total Customers</p>
          <h3 className="text-xl font-bold text-purple-600">234</h3>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> 8.2%
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Customer Retention</p>
          <h3 className="text-xl font-bold text-green-600">76%</h3>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> 4.1%
          </p>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Monthly Performance</h3>
        <div className="space-y-3">
          {monthlyData.map((data, index) => {
            const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
            const height = (data.revenue / maxRevenue) * 100;
            return (
              <div key={index} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-10">{data.month}</span>
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 bg-amber-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>TSh {(data.revenue/1000).toFixed(0)}K</span>
                    <span>{data.orders} orders</span>
                    <span>{data.customers} customers</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-100/30">
          <h3 className="font-semibold text-gray-800">Top Performing Products</h3>
        </div>
        <div className="divide-y divide-amber-100/30">
          {topProducts.map((product, index) => (
            <div key={index} className="px-6 py-3 flex items-center justify-between hover:bg-amber-50/30 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-700' :
                  'bg-amber-300'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.sales} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-600">TSh {(product.revenue/1000).toFixed(0)}K</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopAnalytics;