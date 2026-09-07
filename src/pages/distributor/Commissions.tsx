// src/pages/distributor/Commissions.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown,
  DollarSign,
  TrendingUp,
  Calendar,
  Eye,
  Award,
  Users
} from 'lucide-react';

interface Commission {
  id: number;
  orderId: string;
  customer: string;
  amount: number;
  commission: number;
  percentage: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Processing';
  type: 'Personal' | 'Differential';
  source?: string;
}

const commissionsData: Commission[] = [
  {
    id: 1,
    orderId: 'OMA-2026-0045',
    customer: 'Jane Smith',
    amount: 250000,
    commission: 75000,
    percentage: 30,
    date: '2026-07-20',
    status: 'Paid',
    type: 'Personal',
    source: 'Direct Sale'
  },
  {
    id: 2,
    orderId: 'OMA-2026-0044',
    customer: 'Peter Wilson',
    amount: 34000,
    commission: 10200,
    percentage: 30,
    date: '2026-07-19',
    status: 'Paid',
    type: 'Personal',
    source: 'Direct Sale'
  },
  {
    id: 3,
    orderId: 'OMA-2026-0043',
    customer: 'Sarah Johnson',
    amount: 120000,
    commission: 36000,
    percentage: 30,
    date: '2026-07-18',
    status: 'Processing',
    type: 'Personal',
    source: 'Direct Sale'
  },
  {
    id: 4,
    orderId: 'OMA-2026-0042',
    customer: 'Mike Brown',
    amount: 56000,
    commission: 16800,
    percentage: 30,
    date: '2026-07-17',
    status: 'Pending',
    type: 'Personal',
    source: 'Direct Sale'
  },
  {
    id: 5,
    orderId: 'OMA-2026-0041',
    customer: 'Alice Mwangi',
    amount: 340000,
    commission: 102000,
    percentage: 30,
    date: '2026-07-16',
    status: 'Paid',
    type: 'Differential',
    source: 'Downline: Sarah Smith (28%)'
  },
  {
    id: 6,
    orderId: 'OMA-2026-0040',
    customer: 'Robert Davis',
    amount: 56000,
    commission: 16800,
    percentage: 30,
    date: '2026-07-15',
    status: 'Paid',
    type: 'Differential',
    source: 'Downline: Mike Johnson (24%)'
  },
  {
    id: 7,
    orderId: 'OMA-2026-0039',
    customer: 'Jane Brown',
    amount: 120000,
    commission: 36000,
    percentage: 30,
    date: '2026-07-14',
    status: 'Processing',
    type: 'Differential',
    source: 'Downline: Peter Wilson (20%)'
  }
];

const statusColors: Record<string, string> = {
  'Paid': 'bg-green-100 text-green-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Processing': 'bg-blue-100 text-blue-700'
};

const typeColors: Record<string, string> = {
  'Personal': 'bg-blue-100 text-blue-700',
  'Differential': 'bg-purple-100 text-purple-700'
};

const DistributorCommissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredCommissions = commissionsData.filter(c => {
    const matchesSearch = c.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || c.type === filterType;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCommission = commissionsData.reduce((sum, c) => sum + c.commission, 0);
  const totalPersonal = commissionsData.filter(c => c.type === 'Personal').reduce((sum, c) => sum + c.commission, 0);
  const totalDifferential = commissionsData.filter(c => c.type === 'Differential').reduce((sum, c) => sum + c.commission, 0);
  const pendingCommission = commissionsData.filter(c => c.status === 'Pending' || c.status === 'Processing').reduce((sum, c) => sum + c.commission, 0);

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Commissions</h1>
            <p className="text-gray-500 mt-1">Track your earnings and commissions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
            <Download size={16} />
            Download Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Commission</p>
                <h3 className="text-2xl font-bold text-amber-600">TSh {(totalCommission/1000).toFixed(1)}K</h3>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <DollarSign className="text-amber-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Personal Bonus</p>
                <h3 className="text-2xl font-bold text-blue-600">TSh {(totalPersonal/1000).toFixed(1)}K</h3>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Users className="text-blue-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Differential Bonus</p>
                <h3 className="text-2xl font-bold text-purple-600">TSh {(totalDifferential/1000).toFixed(1)}K</h3>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Award className="text-purple-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <h3 className="text-2xl font-bold text-yellow-600">TSh {(pendingCommission/1000).toFixed(1)}K</h3>
              </div>
              <div className="p-2.5 bg-yellow-50 rounded-lg">
                <TrendingUp className="text-yellow-500" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Commission Formula Info */}
        <div className="bg-gradient-to-r from-amber-50/80 to-amber-100/30 rounded-xl border border-amber-200/30 p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="text-amber-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Commission Formula</h4>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Personal Bonus:</span> Order Amount × 30%
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Differential Bonus:</span> (Your % - Downline %) × Downline Order Amount
              </p>
            </div>
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
          >
            <option value="All">All Types</option>
            <option value="Personal">Personal Bonus</option>
            <option value="Differential">Differential Bonus</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
          </select>
          <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-200/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/30">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{commission.orderId}</p>
                      <p className="text-xs text-gray-400">{commission.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-700">{commission.customer}</p>
                      {commission.type === 'Differential' && commission.source && (
                        <p className="text-xs text-gray-400">{commission.source}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[commission.type]}`}>
                        {commission.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">
                      TSh {commission.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[commission.status]}`}>
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div>
                        <p className="text-sm font-bold text-amber-600">TSh {commission.commission.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{commission.percentage}%</p>
                      </div>
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
            <span>Showing {filteredCommissions.length} of {commissionsData.length} commissions</span>
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

export default DistributorCommissions;