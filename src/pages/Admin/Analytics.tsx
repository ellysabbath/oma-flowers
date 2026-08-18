// src/pages/admin/Analytics.tsx
import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  Store,
  Package,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  BarChart,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalCommissions: number;
  totalBonuses: number;
  totalDistributors: number;
  activeDistributors: number;
  totalShops: number;
  totalOrders: number;
  totalBV: number;
  growthRate: number;
  monthlyData: MonthlyData[];
  topPerformers: TopPerformer[];
  rankDistribution: RankDistribution[];
}

interface MonthlyData {
  month: string;
  revenue: number;
  commissions: number;
  bonuses: number;
  orders: number;
  distributors: number;
}

interface TopPerformer {
  name: string;
  rank: string;
  value: number;
  type: 'Revenue' | 'Sales' | 'Commissions' | 'Bonuses';
}

interface RankDistribution {
  rank: string;
  count: number;
  percentage: number;
}

const analyticsData: AnalyticsData = {
  totalRevenue: 2450000,
  totalCommissions: 504250,
  totalBonuses: 450000,
  totalDistributors: 10,
  activeDistributors: 8,
  totalShops: 5,
  totalOrders: 6,
  totalBV: 108,
  growthRate: 18.5,
  monthlyData: [
    { month: 'Jan', revenue: 180000, commissions: 35000, bonuses: 28000, orders: 3, distributors: 4 },
    { month: 'Feb', revenue: 220000, commissions: 42000, bonuses: 32000, orders: 4, distributors: 5 },
    { month: 'Mar', revenue: 280000, commissions: 55000, bonuses: 45000, orders: 5, distributors: 6 },
    { month: 'Apr', revenue: 320000, commissions: 68000, bonuses: 52000, orders: 5, distributors: 7 },
    { month: 'May', revenue: 380000, commissions: 78000, bonuses: 65000, orders: 6, distributors: 8 },
    { month: 'Jun', revenue: 420000, commissions: 85000, bonuses: 72000, orders: 6, distributors: 9 },
    { month: 'Jul', revenue: 504250, commissions: 504250, bonuses: 450000, orders: 6, distributors: 10 },
  ],
  topPerformers: [
    { name: 'John Doe', rank: 'Royal Crown Director', value: 504250, type: 'Revenue' },
    { name: 'Sarah Smith', rank: 'Crown Director', value: 346000, type: 'Revenue' },
    { name: 'Mike Johnson', rank: 'Director', value: 252000, type: 'Revenue' },
    { name: 'Peter Wilson', rank: 'Senior Manager', value: 90000, type: 'Revenue' },
    { name: 'Jane Brown', rank: 'Manager', value: 59500, type: 'Revenue' },
    { name: 'Robert Davis', rank: 'Executive', value: 31500, type: 'Revenue' },
  ],
  rankDistribution: [
    { rank: 'Royal Crown Director', count: 1, percentage: 10 },
    { rank: 'Crown Director', count: 1, percentage: 10 },
    { rank: 'Director', count: 1, percentage: 10 },
    { rank: 'Senior Manager', count: 1, percentage: 10 },
    { rank: 'Manager', count: 1, percentage: 10 },
    { rank: 'Executive', count: 1, percentage: 10 },
    { rank: 'Senior Leader', count: 1, percentage: 10 },
    { rank: 'Leader', count: 1, percentage: 10 },
    { rank: 'Builder', count: 1, percentage: 10 },
    { rank: 'Associate', count: 1, percentage: 10 },
  ]
};

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7 Months');
  const [selectedMetric, setSelectedMetric] = useState('Revenue');

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">View business analytics and performance reports</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-sm"
          >
            <option>7 Months</option>
            <option>12 Months</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-amber-600">TSh {(analyticsData.totalRevenue/1000).toFixed(1)}K</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> {analyticsData.growthRate}% growth
              </p>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <DollarSign className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Distributors</p>
              <h3 className="text-2xl font-bold text-blue-600">{analyticsData.totalDistributors}</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> {analyticsData.activeDistributors} Active
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Users className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Commissions</p>
              <h3 className="text-2xl font-bold text-purple-600">TSh {(analyticsData.totalCommissions/1000).toFixed(1)}K</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> 22.3% increase
              </p>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <BarChart className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Shops</p>
              <h3 className="text-2xl font-bold text-green-600">{analyticsData.totalShops}</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> 2 new this year
              </p>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <Store className="text-green-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Monthly Performance</h3>
          <div className="flex items-center gap-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-sm"
            >
              <option>Revenue</option>
              <option>Commissions</option>
              <option>Bonuses</option>
              <option>Orders</option>
            </select>
          </div>
        </div>
        
        {/* Chart Visualization */}
        <div className="h-64 relative">
          <div className="flex items-end h-48 gap-2 pt-2">
            {analyticsData.monthlyData.map((data, index) => {
              const maxValue = Math.max(...analyticsData.monthlyData.map(d => d.revenue));
              const height = (data.revenue / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full max-w-[40px] bg-gradient-to-t from-amber-400 to-amber-500 rounded-t transition-all duration-500 hover:opacity-80 cursor-pointer"
                    style={{ height: `${Math.max(height, 10)}%` }}
                  />
                  <span className="text-xs text-gray-400 rotate-45">{data.month}</span>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-6 left-0 right-0 border-t border-gray-200"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-4 border-t border-amber-100/30">
          <div className="text-center">
            <p className="text-xs text-gray-500">Highest Month</p>
            <p className="text-sm font-bold text-amber-600">July</p>
            <p className="text-xs text-gray-400">TSh 504,250</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Average Revenue</p>
            <p className="text-sm font-bold text-blue-600">TSh {(analyticsData.monthlyData.reduce((sum, d) => sum + d.revenue, 0) / analyticsData.monthlyData.length).toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Growth Rate</p>
            <p className="text-sm font-bold text-green-600">{analyticsData.growthRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-sm font-bold text-purple-600">{analyticsData.totalOrders}</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Performers</h3>
            <Award className="text-amber-500" size={18} />
          </div>
          <div className="space-y-3">
            {analyticsData.topPerformers.slice(0, 5).map((performer, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-50/50 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-amber-700' :
                  'bg-amber-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{performer.name}</p>
                  <p className="text-xs text-gray-400">{performer.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-600">TSh {performer.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{performer.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rank Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Rank Distribution</h3>
            <PieChart className="text-amber-500" size={18} />
          </div>
          <div className="space-y-2.5">
            {analyticsData.rankDistribution.map((rank) => (
              <div key={rank.rank} className="flex items-center gap-3">
                <div className="w-28 text-xs font-medium text-gray-600 truncate">{rank.rank}</div>
                <div className="flex-1 bg-amber-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                    style={{ width: `${rank.percentage}%` }}
                  />
                </div>
                <div className="w-8 text-xs font-bold text-amber-700 text-right">{rank.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Key Metrics Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-amber-50/50 rounded-lg">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-lg font-bold text-amber-600">TSh {(analyticsData.totalRevenue/1000000).toFixed(2)}M</p>
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg">
            <p className="text-xs text-gray-500">Total BV</p>
            <p className="text-lg font-bold text-blue-600">{analyticsData.totalBV}</p>
          </div>
          <div className="p-3 bg-green-50/50 rounded-lg">
            <p className="text-xs text-gray-500">Active Distributors</p>
            <p className="text-lg font-bold text-green-600">{analyticsData.activeDistributors}</p>
          </div>
          <div className="p-3 bg-purple-50/50 rounded-lg">
            <p className="text-xs text-gray-500">Total Bonuses</p>
            <p className="text-lg font-bold text-purple-600">TSh {(analyticsData.totalBonuses/1000).toFixed(1)}K</p>
          </div>
        </div>
      </div>

      {/* Business Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl p-4 border border-amber-200/30">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-amber-600" size={18} />
            <h4 className="font-semibold text-gray-800">Growth Opportunity</h4>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {analyticsData.growthRate}% growth in the last 7 months. Focus on expanding the distributor network and shop locations.
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-4 border border-blue-200/30">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600" size={18} />
            <h4 className="font-semibold text-gray-800">Network Strength</h4>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {analyticsData.activeDistributors} active distributors out of {analyticsData.totalDistributors}. 80% active rate.
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/30 rounded-xl p-4 border border-green-200/30">
          <div className="flex items-center gap-2">
            <Store className="text-green-600" size={18} />
            <h4 className="font-semibold text-gray-800">Shop Performance</h4>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {analyticsData.totalShops} shops generating TSh {(analyticsData.totalRevenue/1000).toFixed(1)}K revenue. 1 Gold Crown shop.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;