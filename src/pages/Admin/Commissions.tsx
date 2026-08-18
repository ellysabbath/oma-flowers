// src/pages/admin/Commissions.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Calculator,
  FileText,
  Eye,
  Calendar,
  User
} from 'lucide-react';

// Commission data based on OMA Flowers business plan
interface Commission {
  id: number;
  distributor: string;
  rank: string;
  level: number;
  pbv: number;
  percentage: number;
  amount: number;
  type: 'Personal' | 'Differential';
  month: string;
  year: number;
  source?: string;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentDate?: string;
}

// Personal Bonuses - Based on business plan examples
const personalCommissions: Commission[] = [
  {
    id: 1,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    level: 10,
    pbv: 350,
    percentage: 32,
    amount: 280000,
    type: 'Personal',
    month: 'July',
    year: 2026,
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 2,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    level: 9,
    pbv: 280,
    percentage: 28,
    amount: 196000,
    type: 'Personal',
    month: 'July',
    year: 2026,
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 3,
    distributor: 'Mike Johnson',
    rank: 'Director',
    level: 8,
    pbv: 220,
    percentage: 24,
    amount: 132000,
    type: 'Personal',
    month: 'July',
    year: 2026,
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 4,
    distributor: 'Peter Wilson',
    rank: 'Senior Manager',
    level: 7,
    pbv: 180,
    percentage: 20,
    amount: 90000,
    type: 'Personal',
    month: 'July',
    year: 2026,
    status: 'Processing',
    paymentDate: '2026-08-15'
  },
  {
    id: 5,
    distributor: 'Jane Brown',
    rank: 'Manager',
    level: 6,
    pbv: 140,
    percentage: 17,
    amount: 59500,
    type: 'Personal',
    month: 'July',
    year: 2026,
    status: 'Pending',
    paymentDate: '2026-08-20'
  },
  {
    id: 6,
    distributor: 'Robert Davis',
    rank: 'Executive',
    level: 5,
    pbv: 90,
    percentage: 14,
    amount: 31500,
    type: 'Personal',
    month: 'July',
    year: 2026,
    status: 'Pending',
    paymentDate: '2026-08-20'
  },
  {
    id: 7,
    distributor: 'Alice Mwangi',
    rank: 'Senior Leader',
    level: 4,
    pbv: 70,
    percentage: 11,
    amount: 19250,
    type: 'Personal',
    month: 'July',
    year: 2026,
    status: 'Pending',
    paymentDate: '2026-08-20'
  }
];

// Differential Bonuses - Based on business plan examples
const differentialCommissions: Commission[] = [
  {
    id: 101,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    level: 10,
    pbv: 0,
    percentage: 32,
    amount: 352000,
    type: 'Differential',
    month: 'July',
    year: 2026,
    source: 'Sarah Smith - Crown Director (28%)',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 102,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    level: 10,
    pbv: 0,
    percentage: 32,
    amount: 224000,
    type: 'Differential',
    month: 'July',
    year: 2026,
    source: 'Mike Johnson - Director (24%)',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 103,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    level: 9,
    pbv: 0,
    percentage: 28,
    amount: 210000,
    type: 'Differential',
    month: 'July',
    year: 2026,
    source: 'Peter Wilson - Senior Manager (20%)',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 104,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    level: 9,
    pbv: 0,
    percentage: 28,
    amount: 154000,
    type: 'Differential',
    month: 'July',
    year: 2026,
    source: 'Jane Brown - Manager (17%)',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 105,
    distributor: 'Mike Johnson',
    rank: 'Director',
    level: 8,
    pbv: 0,
    percentage: 24,
    amount: 120000,
    type: 'Differential',
    month: 'July',
    year: 2026,
    source: 'Robert Davis - Executive (14%)',
    status: 'Processing',
    paymentDate: '2026-08-15'
  }
];

// Combine all commissions
const allCommissions = [...personalCommissions, ...differentialCommissions];

// Rank colors
const rankColors: Record<string, string> = {
  'Royal Crown Director': 'bg-amber-100 text-amber-700 border-amber-300',
  'Crown Director': 'bg-purple-100 text-purple-700 border-purple-300',
  'Director': 'bg-blue-100 text-blue-700 border-blue-300',
  'Senior Manager': 'bg-green-100 text-green-700 border-green-300',
  'Manager': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'Executive': 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'Senior Leader': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  'Leader': 'bg-sky-100 text-sky-700 border-sky-300'
};

const statusColors: Record<string, string> = {
  'Paid': 'bg-green-100 text-green-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Processing': 'bg-blue-100 text-blue-700'
};

const Commissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  // Get unique months for filter
  const months = ['All', ...new Set(allCommissions.map(c => c.month))];

  // Filter commissions
  const filteredCommissions = allCommissions.filter(c => {
    const matchesSearch = c.distributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.rank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || c.type === filterType;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesMonth = filterMonth === 'All' || c.month === filterMonth;
    return matchesSearch && matchesType && matchesStatus && matchesMonth;
  });

  // Stats
  const totalCommissions = allCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPersonal = personalCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalDifferential = differentialCommissions.reduce((sum, c) => sum + c.amount, 0);
  const paidCommissions = allCommissions.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = allCommissions.filter(c => c.status === 'Pending' || c.status === 'Processing').reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Commissions</h1>
          <p className="text-sm text-gray-500 mt-1">Track distributor commissions and bonuses</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium">
            <FileText size={16} />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Commissions</p>
              <h3 className="text-2xl font-bold text-amber-600">TSh {(totalCommissions/1000).toFixed(1)}K</h3>
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
              <User className="text-blue-500" size={20} />
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
              <Users className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Commissions</p>
              <h3 className="text-2xl font-bold text-yellow-600">TSh {(pendingCommissions/1000).toFixed(1)}K</h3>
            </div>
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <TrendingUp className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Commission Calculation Info */}
      <div className="bg-gradient-to-r from-amber-50/80 to-amber-100/30 rounded-xl border border-amber-200/30 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Calculator className="text-amber-600" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Commission Formula</h4>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Personal Bonus:</span> PBV × Bonus Percentage × 2,500
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Differential Bonus:</span> (Your % - Downline %) × Their PBV × 2,500
            </p>
            <p className="text-xs text-amber-600 mt-1">Example: John Doe (32%) - Sarah Smith (28%) = 4% × 280 × 2,500 = TSh 28,000</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by distributor or rank..."
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
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Processing">Processing</option>
          <option value="Pending">Pending</option>
        </select>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
        >
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">PBV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">%</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredCommissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => setSelectedCommission(commission)}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{commission.distributor}</p>
                      <p className="text-xs text-gray-400">{commission.month} {commission.year}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${rankColors[commission.rank] || 'bg-gray-100 text-gray-600'}`}>
                      {commission.rank}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">Level {commission.level}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${commission.type === 'Personal' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {commission.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{commission.pbv || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-amber-600 hidden lg:table-cell">{commission.percentage}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[commission.status]}`}>
                      {commission.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="text-sm font-bold text-amber-600">TSh {commission.amount.toLocaleString()}</p>
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
          <span>Showing {filteredCommissions.length} of {allCommissions.length} commissions</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-amber-500 text-white">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">2</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Commission Details Modal */}
      {selectedCommission && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCommission(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Commission Details</h3>
                <p className="text-sm text-amber-600">{selectedCommission.distributor} • {selectedCommission.month} {selectedCommission.year}</p>
              </div>
              <button onClick={() => setSelectedCommission(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className={`text-sm font-bold mt-1 ${selectedCommission.type === 'Personal' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {selectedCommission.type}
                  </p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">PBV</p>
                  <p className="text-lg font-bold text-blue-700">{selectedCommission.pbv || '—'}</p>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Percentage</p>
                  <p className="text-lg font-bold text-purple-700">{selectedCommission.percentage}%</p>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-6 text-center border border-amber-200/30">
                <p className="text-sm text-gray-500">Commission Amount</p>
                <p className="text-3xl font-bold text-amber-600">TSh {selectedCommission.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Calculated: {selectedCommission.pbv || 'N/A'} × {selectedCommission.percentage}% × 2,500
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Distributor Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedCommission.distributor}</p>
                    <p className="text-sm"><span className="text-gray-500">Rank:</span> {selectedCommission.rank}</p>
                    <p className="text-sm"><span className="text-gray-500">Level:</span> {selectedCommission.level}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Status:</span> {selectedCommission.status}</p>
                    {selectedCommission.paymentDate && (
                      <p className="text-sm"><span className="text-gray-500">Payment Date:</span> {selectedCommission.paymentDate}</p>
                    )}
                    <p className="text-sm"><span className="text-gray-500">Month:</span> {selectedCommission.month} {selectedCommission.year}</p>
                  </div>
                </div>
              </div>

              {/* Source for Differential Bonuses */}
              {selectedCommission.type === 'Differential' && selectedCommission.source && (
                <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-200/30">
                  <p className="text-sm font-medium text-gray-500">Source</p>
                  <p className="text-sm text-gray-700 mt-1">{selectedCommission.source}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Differential: ({selectedCommission.percentage}% - Source %) × PBV × 2,500
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  Process Payment
                </button>
                <button className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                  View Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commissions;