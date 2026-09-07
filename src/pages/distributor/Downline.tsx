// src/pages/distributor/Downline.tsx
import React, { useState } from 'react';
import { Search, Filter, UserPlus, ChevronDown, Mail, Phone, Eye, Users, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DownlineMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  rank: string;
  pbv: number;
  cgv: number;
  orders: number;
  commission: number;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  level: number;
}

const downlineData: DownlineMember[] = [
  {
    id: 1,
    name: 'Sarah Smith',
    email: 'sarah.smith@omaflowers.com',
    phone: '+255 765 432 100',
    rank: 'Crown Director',
    pbv: 280,
    cgv: 120000,
    orders: 45,
    commission: 196000,
    joinDate: '2023-03-20',
    status: 'Active',
    level: 1
  },
  {
    id: 2,
    name: 'Mike Johnson',
    email: 'mike.johnson@omaflowers.com',
    phone: '+255 698 765 432',
    rank: 'Director',
    pbv: 220,
    cgv: 60000,
    orders: 28,
    commission: 132000,
    joinDate: '2023-05-10',
    status: 'Active',
    level: 1
  },
  {
    id: 3,
    name: 'Peter Wilson',
    email: 'peter.wilson@omaflowers.com',
    phone: '+255 745 678 123',
    rank: 'Senior Manager',
    pbv: 180,
    cgv: 25000,
    orders: 18,
    commission: 90000,
    joinDate: '2023-07-05',
    status: 'Active',
    level: 2
  },
  {
    id: 4,
    name: 'Jane Brown',
    email: 'jane.brown@omaflowers.com',
    phone: '+255 754 321 987',
    rank: 'Manager',
    pbv: 140,
    cgv: 10000,
    orders: 12,
    commission: 59500,
    joinDate: '2023-09-12',
    status: 'Active',
    level: 2
  },
  {
    id: 5,
    name: 'Robert Davis',
    email: 'robert.davis@omaflowers.com',
    phone: '+255 712 987 654',
    rank: 'Executive',
    pbv: 90,
    cgv: 4000,
    orders: 8,
    commission: 31500,
    joinDate: '2023-11-18',
    status: 'Active',
    level: 2
  },
  {
    id: 6,
    name: 'Alice Mwangi',
    email: 'alice.mwangi@omaflowers.com',
    phone: '+255 756 789 123',
    rank: 'Senior Leader',
    pbv: 70,
    cgv: 1500,
    orders: 6,
    commission: 19250,
    joinDate: '2024-01-20',
    status: 'Pending',
    level: 3
  }
];

const rankColors: Record<string, string> = {
  'Royal Crown Director': 'bg-amber-100 text-amber-700',
  'Crown Director': 'bg-purple-100 text-purple-700',
  'Director': 'bg-blue-100 text-blue-700',
  'Senior Manager': 'bg-green-100 text-green-700',
  'Manager': 'bg-emerald-100 text-emerald-700',
  'Executive': 'bg-indigo-100 text-indigo-700',
  'Senior Leader': 'bg-cyan-100 text-cyan-700'
};

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Inactive': 'bg-red-100 text-red-700',
  'Pending': 'bg-yellow-100 text-yellow-700'
};

const DistributorDownline: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedMember, setSelectedMember] = useState<DownlineMember | null>(null);

  const ranks = ['All', ...new Set(downlineData.map(m => m.rank))];
  const statuses = ['All', ...new Set(downlineData.map(m => m.status))];

  const filteredMembers = downlineData.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = filterRank === 'All' || m.rank === filterRank;
    const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
    return matchesSearch && matchesRank && matchesStatus;
  });

  const totalDownline = downlineData.length;
  const activeDownline = downlineData.filter(m => m.status === 'Active').length;
  const totalCommission = downlineData.reduce((sum, m) => sum + m.commission, 0);
  const totalOrders = downlineData.reduce((sum, m) => sum + m.orders, 0);

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Downline</h1>
            <p className="text-gray-500 mt-1">Manage and monitor your team members</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
            <UserPlus size={16} />
            Add Member
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Downline</p>
                <h3 className="text-2xl font-bold text-gray-800">{totalDownline}</h3>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Users className="text-amber-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Members</p>
                <h3 className="text-2xl font-bold text-green-600">{activeDownline}</h3>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <h3 className="text-2xl font-bold text-blue-600">{totalOrders}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Users className="text-blue-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Commission</p>
                <h3 className="text-2xl font-bold text-amber-600">TSh {(totalCommission/1000).toFixed(1)}K</h3>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Award className="text-amber-500" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
          >
            {ranks.map(rank => (
              <option key={rank} value={rank}>{rank}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Downline Table */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-200/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">PBV</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">CGV</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/30">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => setSelectedMember(member)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{member.name}</p>
                          <p className="text-xs text-gray-400">Level {member.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${rankColors[member.rank] || 'bg-gray-100 text-gray-600'}`}>
                        {member.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{member.pbv}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">{member.cgv.toLocaleString()}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">{member.orders}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[member.status]}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-amber-600">
                      TSh {member.commission.toLocaleString()}
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
            <span>Showing {filteredMembers.length} of {downlineData.length} members</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
              <button className="px-3 py-1 rounded-lg bg-amber-500 text-white">1</button>
              <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
            </div>
          </div>
        </div>

        {/* Member Details Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-lg">
                    {selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedMember.name}</h3>
                    <p className="text-sm text-amber-600">{selectedMember.rank} • Level {selectedMember.level}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">PBV</p>
                    <p className="text-lg font-bold text-amber-700">{selectedMember.pbv}</p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">CGV</p>
                    <p className="text-lg font-bold text-blue-700">{selectedMember.cgv.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-50/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="text-lg font-bold text-green-700">{selectedMember.orders}</p>
                  </div>
                  <div className="bg-purple-50/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Commission</p>
                    <p className="text-lg font-bold text-purple-700">TSh {selectedMember.commission.toLocaleString()}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Contact Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm flex items-center gap-2">
                      <Mail size={16} className="text-amber-500" />
                      {selectedMember.email}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Phone size={16} className="text-amber-500" />
                      {selectedMember.phone}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Information</p>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm"><span className="text-gray-500">Status:</span> {selectedMember.status}</p>
                      <p className="text-sm"><span className="text-gray-500">Joined:</span> {selectedMember.joinDate}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Performance</p>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm"><span className="text-gray-500">PBV:</span> {selectedMember.pbv}</p>
                      <p className="text-sm"><span className="text-gray-500">CGV:</span> {selectedMember.cgv.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                    View Full Profile
                  </button>
                  <button className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistributorDownline;