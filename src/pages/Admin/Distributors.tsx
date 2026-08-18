// src/pages/admin/Distributors.tsx
import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical, 
  ChevronDown,
  TrendingUp,
  Users,
  Award,
  DollarSign
} from 'lucide-react';

// Distributor data based on OMA Flowers business plan
interface Distributor {
  id: number;
  name: string;
  email: string;
  phone: string;
  rank: string;
  level: number;
  pbv: number;
  cgv: number;
  bonus: number;
  qualified: string;
  upline?: string;
  downline: string[];
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
  avatar: string;
  country: string;
  region: string;
  city: string;
}

const distributorsData: Distributor[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@omaflowers.com',
    phone: '+255 712 345 678',
    rank: 'Royal Crown Director',
    level: 10,
    pbv: 350,
    cgv: 184000,
    bonus: 32,
    qualified: '5 Crown Director',
    downline: ['Sarah Smith', 'Mike Johnson'],
    status: 'Active',
    joinDate: '2023-01-15',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Dar es Salaam',
    city: 'Kinondoni'
  },
  {
    id: 2,
    name: 'Sarah Smith',
    email: 'sarah.smith@omaflowers.com',
    phone: '+255 765 432 100',
    rank: 'Crown Director',
    level: 9,
    pbv: 280,
    cgv: 120000,
    bonus: 28,
    qualified: '4 Director',
    upline: 'John Doe',
    downline: ['Peter Wilson', 'Jane Brown'],
    status: 'Active',
    joinDate: '2023-03-20',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Arusha',
    city: 'Arusha City'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@omaflowers.com',
    phone: '+255 698 765 432',
    rank: 'Director',
    level: 8,
    pbv: 220,
    cgv: 60000,
    bonus: 24,
    qualified: '5 Senior Manager',
    upline: 'John Doe',
    downline: ['Robert Davis'],
    status: 'Active',
    joinDate: '2023-05-10',
    avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Mwanza',
    city: 'Mwanza City'
  },
  {
    id: 4,
    name: 'Peter Wilson',
    email: 'peter.wilson@omaflowers.com',
    phone: '+255 745 678 123',
    rank: 'Senior Manager',
    level: 7,
    pbv: 180,
    cgv: 25000,
    bonus: 20,
    qualified: '3 Manager',
    upline: 'Sarah Smith',
    downline: [],
    status: 'Active',
    joinDate: '2023-07-05',
    avatar: 'https://ui-avatars.com/api/?name=Peter+Wilson&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Kilimanjaro',
    city: 'Moshi'
  },
  {
    id: 5,
    name: 'Jane Brown',
    email: 'jane.brown@omaflowers.com',
    phone: '+255 754 321 987',
    rank: 'Manager',
    level: 6,
    pbv: 140,
    cgv: 10000,
    bonus: 17,
    qualified: '3 Executive',
    upline: 'Sarah Smith',
    downline: [],
    status: 'Active',
    joinDate: '2023-09-12',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Brown&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Tanga',
    city: 'Tanga City'
  },
  {
    id: 6,
    name: 'Robert Davis',
    email: 'robert.davis@omaflowers.com',
    phone: '+255 712 987 654',
    rank: 'Executive',
    level: 5,
    pbv: 90,
    cgv: 4000,
    bonus: 14,
    qualified: '2 Senior Leader',
    upline: 'Mike Johnson',
    downline: [],
    status: 'Active',
    joinDate: '2023-11-18',
    avatar: 'https://ui-avatars.com/api/?name=Robert+Davis&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Dodoma',
    city: 'Dodoma City'
  },
  {
    id: 7,
    name: 'Alice Mwangi',
    email: 'alice.mwangi@omaflowers.com',
    phone: '+255 756 789 123',
    rank: 'Senior Leader',
    level: 4,
    pbv: 70,
    cgv: 1500,
    bonus: 11,
    qualified: '2 Leader',
    upline: 'Peter Wilson',
    downline: [],
    status: 'Active',
    joinDate: '2024-01-20',
    avatar: 'https://ui-avatars.com/api/?name=Alice+&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Dar es Salaam',
    city: 'Ubungo'
  },
  {
    id: 8,
    name: 'James Kariuki',
    email: 'james.kariuki@omaflowers.com',
    phone: '+255 710 234 567',
    rank: 'Leader',
    level: 3,
    pbv: 50,
    cgv: 600,
    bonus: 8,
    qualified: '1 Builder',
    upline: 'Robert Davis',
    downline: [],
    status: 'Active',
    joinDate: '2024-03-15',
    avatar: 'https://ui-avatars.com/api/?name=James+&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Mwanza',
    city: 'Nyamagana'
  },
  {
    id: 9,
    name: 'Grace Ochieng',
    email: 'grace.ochieng@omaflowers.com',
    phone: '+255 723 456 789',
    rank: 'Builder',
    level: 2,
    pbv: 30,
    cgv: 200,
    bonus: 5,
    qualified: '—',
    upline: 'Alice Mwangi',
    downline: [],
    status: 'Pending',
    joinDate: '2024-05-10',
    avatar: 'https://ui-avatars.com/api/?name=Grace+&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Arusha',
    city: 'Meru'
  },
  {
    id: 10,
    name: 'David Mgaya',
    email: 'david.mgaya@omaflowers.com',
    phone: '+255 734 567 890',
    rank: 'Associate',
    level: 1,
    pbv: 20,
    cgv: 0,
    bonus: 4,
    qualified: '—',
    upline: 'James Kariuki',
    downline: [],
    status: 'Inactive',
    joinDate: '2024-06-01',
    avatar: 'https://ui-avatars.com/api/?name=David+&background=amber&color=fff',
    country: 'Tanzania',
    region: 'Kilimanjaro',
    city: 'Same'
  }
];

// Rank colors for badges
const rankColors: Record<string, string> = {
  'Royal Crown Director': 'bg-amber-100 text-amber-700 border-amber-300',
  'Crown Director': 'bg-purple-100 text-purple-700 border-purple-300',
  'Director': 'bg-blue-100 text-blue-700 border-blue-300',
  'Senior Manager': 'bg-green-100 text-green-700 border-green-300',
  'Manager': 'bg-emerald-100 text-emerald-700 border-emerald-300',
  'Executive': 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'Senior Leader': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  'Leader': 'bg-sky-100 text-sky-700 border-sky-300',
  'Builder': 'bg-orange-100 text-orange-700 border-orange-300',
  'Associate': 'bg-gray-100 text-gray-600 border-gray-300',
  'Seed': 'bg-gray-50 text-gray-400 border-gray-200'
};

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Inactive': 'bg-red-100 text-red-700',
  'Pending': 'bg-yellow-100 text-yellow-700'
};

// Rank levels for filtering
const rankLevels = [
  'All',
  'Royal Crown Director',
  'Crown Director',
  'Director',
  'Senior Manager',
  'Manager',
  'Executive',
  'Senior Leader',
  'Leader',
  'Builder',
  'Associate'
];

const Distributors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  // Filter distributors
  const filteredDistributors = distributorsData.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRank = filterRank === 'All' || d.rank === filterRank;
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus;
    return matchesSearch && matchesRank && matchesStatus;
  });

  // Stats
  const totalDistributors = distributorsData.length;
  const activeDistributors = distributorsData.filter(d => d.status === 'Active').length;
  const totalCGV = distributorsData.reduce((sum, d) => sum + d.cgv, 0);
  const totalPBV = distributorsData.reduce((sum, d) => sum + d.pbv, 0);

  const handleViewDetails = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Distributors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your OMA Flowers distributors network</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
          <UserPlus size={16} />
          Add Distributor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Distributors</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalDistributors}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Users className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Distributors</p>
              <h3 className="text-2xl font-bold text-green-600">{activeDistributors}</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total CGV</p>
              <h3 className="text-2xl font-bold text-blue-600">{totalCGV.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <DollarSign className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total PBV</p>
              <h3 className="text-2xl font-bold text-purple-600">{totalPBV}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Award className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search distributors by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterRank}
          onChange={(e) => setFilterRank(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[160px]"
        >
          {rankLevels.map(rank => (
            <option key={rank} value={rank}>{rank}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Distributors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-200/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">PBV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">CGV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Bonus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredDistributors.map((distributor) => (
                <tr key={distributor.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => handleViewDetails(distributor)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={distributor.avatar} alt={distributor.name} className="w-9 h-9 rounded-full border-2 border-amber-200/50" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{distributor.name}</p>
                        <p className="text-xs text-gray-400">{distributor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${rankColors[distributor.rank] || 'bg-gray-100 text-gray-600'}`}>
                      {distributor.rank}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">Level {distributor.level}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{distributor.pbv}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{distributor.cgv.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                    <span className="font-medium text-amber-600">{distributor.bonus}%</span>
                    <p className="text-xs text-gray-400">{distributor.qualified}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[distributor.status]}`}>
                      {distributor.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors">
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-amber-100/30 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredDistributors.length} of {distributorsData.length} distributors</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-amber-500 text-white">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">2</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Distributor Details Modal */}
      {selectedDistributor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedDistributor(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedDistributor.avatar} alt={selectedDistributor.name} className="w-12 h-12 rounded-full border-2 border-amber-300" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedDistributor.name}</h3>
                  <p className="text-sm text-amber-600">{selectedDistributor.rank} • Level {selectedDistributor.level}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDistributor(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">PBV</p>
                  <p className="text-lg font-bold text-amber-700">{selectedDistributor.pbv}</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">CGV</p>
                  <p className="text-lg font-bold text-blue-700">{selectedDistributor.cgv.toLocaleString()}</p>
                </div>
                <div className="bg-green-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Bonus</p>
                  <p className="text-lg font-bold text-green-700">{selectedDistributor.bonus}%</p>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`text-lg font-bold ${statusColors[selectedDistributor.status]}`}>{selectedDistributor.status}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Email:</span> {selectedDistributor.email}</p>
                    <p className="text-sm"><span className="text-gray-500">Phone:</span> {selectedDistributor.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Country:</span> {selectedDistributor.country}</p>
                    <p className="text-sm"><span className="text-gray-500">Region:</span> {selectedDistributor.region}</p>
                    <p className="text-sm"><span className="text-gray-500">City:</span> {selectedDistributor.city}</p>
                  </div>
                </div>
              </div>

              {/* Network */}
              <div className="border-t border-amber-100/30 pt-4">
                <p className="text-sm font-medium text-gray-500">Network</p>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="bg-amber-50/30 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Upline</p>
                    <p className="text-sm font-medium">{selectedDistributor.upline || '—'}</p>
                  </div>
                  <div className="bg-blue-50/30 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Downline</p>
                    <p className="text-sm font-medium">{selectedDistributor.downline.length > 0 ? selectedDistributor.downline.join(', ') : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="border-t border-amber-100/30 pt-4">
                <p className="text-sm text-gray-500">Joined: {selectedDistributor.joinDate}</p>
                <p className="text-sm text-gray-500">Qualified: {selectedDistributor.qualified}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Distributors;