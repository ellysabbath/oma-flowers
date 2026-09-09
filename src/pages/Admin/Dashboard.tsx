import React, { useEffect } from 'react';
import { Users, DollarSign, Award, Store, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { distributorAPI } from '../../api/distributors';
import { orderAPI } from '../../api/orders';
import type { Distributor } from '../../types';

const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  
  const {
    data: distributors,
    loading: distributorsLoading,
    execute: fetchDistributors,
  } = useApi<Distributor[]>();

  const {
    data: orders,
    loading: ordersLoading,
    execute: fetchOrders,
  } = useApi<any>();

  useEffect(() => {
    if (isAdmin) {
      fetchDistributors(() => distributorAPI.getAll().then(res => res.results));
      fetchOrders(() => orderAPI.getAll().then(res => res.results));
    }
  }, [isAdmin]);

  // Calculate stats
  const totalDistributors = distributors?.length || 0;
  const totalCommissions = 504250; // Will come from API
  const totalBonuses = 450000; // Will come from API
  const totalAwards = 6; // Will come from API
  const totalShops = 5; // Will come from API

  if (distributorsLoading || ordersLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">OMA Flowers Business Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/30">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Distributors</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalDistributors}</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> 12.5%
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <Users className="text-amber-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Commissions</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">TSh 504K</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> 20.1%
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bonuses</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">TSh 450K</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> 15.3%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Award className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Awards</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalAwards}</h3>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> 8.2%
              </p>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg">
              <Award className="text-rose-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Top Distributors</h3>
          <div className="space-y-3">
            {distributors?.slice(0, 3).map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50/50 transition-colors border-b border-amber-100/30 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{d.full_name}</p>
                  <p className="text-xs text-gray-400">{d.rank} • {d.pbv} PBV</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Active
                  </span>
                  <p className="text-xs text-gray-400 mt-1">CGV: {d.cgv.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/50">
              <span className="text-sm text-gray-600">Active Distributors</span>
              <span className="font-bold text-amber-700">3</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-50/50">
              <span className="text-sm text-gray-600">Total Shops</span>
              <span className="font-bold text-green-700">5</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/50">
              <span className="text-sm text-gray-600">Products</span>
              <span className="font-bold text-purple-700">6</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/50">
              <span className="text-sm text-gray-600">Awards Given</span>
              <span className="font-bold text-rose-700">6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;