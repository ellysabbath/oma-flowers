// src/pages/admin/Awards.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trophy, 
  Crown, 
  Star, 
  Award, 
  Sparkles,
  Calendar,
  User,
  Gem,
  Eye,
  ChevronDown
} from 'lucide-react';

interface Award {
  id: number;
  name: string;
  category: 'Legacy Circle' | 'Legacy' | 'Annual' | 'Special';
  winner: string;
  rank: string;
  date: string;
  prize: string;
  description: string;
  year: number;
  status: 'Active' | 'Past' | 'Upcoming';
}

const awardsData: Award[] = [
  // Legacy Circle Awards
  {
    id: 1,
    name: 'Legacy Circle Award',
    category: 'Legacy Circle',
    winner: 'John Doe',
    rank: 'Royal Crown Director',
    date: '2026-07-15',
    prize: 'OMA LEGACY RING',
    description: 'Inducted into OMA Hall of Legends for exceptional contribution to OMA Flowers',
    year: 2026,
    status: 'Active'
  },
  {
    id: 2,
    name: 'Legacy Circle Award',
    category: 'Legacy Circle',
    winner: 'Sarah Smith',
    rank: 'Crown Director',
    date: '2026-07-15',
    prize: 'OMA LEGACY RING',
    description: 'Inducted into OMA Hall of Legends for outstanding leadership and growth',
    year: 2026,
    status: 'Active'
  },

  // Annual Awards
  {
    id: 3,
    name: 'Team Builder of the Year',
    category: 'Annual',
    winner: 'John Doe',
    rank: 'Royal Crown Director',
    date: '2026-06-20',
    prize: 'TSh 5,000,000',
    description: 'Best team building performance with active members and stable sales',
    year: 2026,
    status: 'Active'
  },
  {
    id: 4,
    name: 'Annual Sales Excellence Award',
    category: 'Annual',
    winner: 'Sarah Smith',
    rank: 'Crown Director',
    date: '2026-06-20',
    prize: 'TSh 3,000,000',
    description: 'Sales record achievement - Diamond Garden Star winner',
    year: 2026,
    status: 'Active'
  },
  {
    id: 5,
    name: 'Best Trainer Award',
    category: 'Annual',
    winner: 'John Doe',
    rank: 'Royal Crown Director',
    date: '2026-06-20',
    prize: 'TSh 2,500,000',
    description: 'Best Academy Trainer - Transformed lives through OMA Flower\'s Academy',
    year: 2026,
    status: 'Active'
  },
  {
    id: 6,
    name: 'Event Designer of the Year',
    category: 'Annual',
    winner: 'Sarah Smith',
    rank: 'Crown Director',
    date: '2026-06-20',
    prize: 'TSh 2,000,000',
    description: 'Best event decoration design for weddings and graduations',
    year: 2026,
    status: 'Active'
  },

  // Special Awards
  {
    id: 7,
    name: 'Innovation Award',
    category: 'Special',
    winner: 'Mike Johnson',
    rank: 'Director',
    date: '2026-06-20',
    prize: 'TSh 1,500,000',
    description: 'Innovative floral design concept and marketing idea',
    year: 2026,
    status: 'Active'
  },
  {
    id: 8,
    name: 'Gold Certificate Award',
    category: 'Special',
    winner: 'Peter Wilson',
    rank: 'Senior Manager',
    date: '2026-06-20',
    prize: 'Gold Certificate',
    description: 'Qualified Manager achievement - Special Gold Certificate',
    year: 2026,
    status: 'Active'
  },
  {
    id: 9,
    name: 'Diamond Garden Star',
    category: 'Special',
    winner: 'John Doe',
    rank: 'Royal Crown Director',
    date: '2026-06-20',
    prize: 'TSh 2,000,000',
    description: 'Top performer - Diamond Garden Star ★★★',
    year: 2026,
    status: 'Active'
  },
  {
    id: 10,
    name: 'Gold Garden Star',
    category: 'Special',
    winner: 'Sarah Smith',
    rank: 'Crown Director',
    date: '2026-06-20',
    prize: 'TSh 1,500,000',
    description: 'Second best performer - Gold Garden Star ★★',
    year: 2026,
    status: 'Active'
  },
  {
    id: 11,
    name: 'Silver Garden Star',
    category: 'Special',
    winner: 'Mike Johnson',
    rank: 'Director',
    date: '2026-06-20',
    prize: 'TSh 1,000,000',
    description: 'Third best performer - Silver Garden Star ★',
    year: 2026,
    status: 'Active'
  },

  // Past Awards
  {
    id: 12,
    name: 'Team Builder of the Year',
    category: 'Annual',
    winner: 'Sarah Smith',
    rank: 'Senior Manager',
    date: '2025-06-20',
    prize: 'TSh 4,000,000',
    description: 'Best team building performance - Built a strong network',
    year: 2025,
    status: 'Past'
  },
  {
    id: 13,
    name: 'Legacy Circle Award',
    category: 'Legacy Circle',
    winner: 'Peter Wilson',
    rank: 'Director',
    date: '2025-07-15',
    prize: 'OMA LEGACY RING',
    description: 'Inducted into OMA Hall of Legends - Long-term contribution',
    year: 2025,
    status: 'Past'
  },

  // Upcoming Awards
  {
    id: 14,
    name: 'Grand Gala Night Award',
    category: 'Special',
    winner: 'TBD',
    rank: 'TBD',
    date: '2026-12-20',
    prize: 'TSh 10,000,000',
    description: 'Grand Gala Night - Top performer of the year',
    year: 2026,
    status: 'Upcoming'
  }
];

const categoryConfig: Record<string, { color: string, icon: React.ReactNode, bgColor: string, borderColor: string }> = {
  'Legacy Circle': { 
    color: 'text-amber-600', 
    icon: <Crown size={18} />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300'
  },
  'Legacy': { 
    color: 'text-amber-600', 
    icon: <Crown size={18} />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300'
  },
  'Annual': { 
    color: 'text-blue-600', 
    icon: <Trophy size={18} />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300'
  },
  'Special': { 
    color: 'text-purple-600', 
    icon: <Star size={18} />,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300'
  }
};

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Past': 'bg-gray-100 text-gray-600',
  'Upcoming': 'bg-yellow-100 text-yellow-700'
};

const statusIcons: Record<string, React.ReactNode> = {
  'Active': <Sparkles size={14} className="text-green-500" />,
  'Past': <Calendar size={14} className="text-gray-500" />,
  'Upcoming': <Calendar size={14} className="text-yellow-500" />
};

const Awards: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);

  const categories = ['All', ...new Set(awardsData.map(a => a.category))];
  const statuses = ['All', ...new Set(awardsData.map(a => a.status))];

  const filteredAwards = awardsData.filter(a => {
    const matchesSearch = a.winner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalAwards = awardsData.length;
  const activeAwards = awardsData.filter(a => a.status === 'Active').length;
  const pastAwards = awardsData.filter(a => a.status === 'Past').length;
  const upcomingAwards = awardsData.filter(a => a.status === 'Upcoming').length;
  const legacyAwards = awardsData.filter(a => a.category === 'Legacy Circle').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Awards & Recognition</h1>
          <p className="text-sm text-gray-500 mt-1">Celebrating excellence in the OMA Flowers community</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
          <Trophy size={16} />
          Nominate
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Awards</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalAwards}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Award className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <h3 className="text-2xl font-bold text-green-600">{activeAwards}</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <Sparkles className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Past</p>
              <h3 className="text-2xl font-bold text-gray-600">{pastAwards}</h3>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg">
              <Calendar className="text-gray-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming</p>
              <h3 className="text-2xl font-bold text-yellow-600">{upcomingAwards}</h3>
            </div>
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <Calendar className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Legacy Circle Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Crown size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Legacy Circle Award</h3>
            <p className="text-amber-100 text-sm">"Success is celebrated, legacy is honored."</p>
            <p className="text-amber-200 text-xs mt-1">★ {legacyAwards} Members in OMA Hall of Legends ★</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by winner or award name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
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

      {/* Awards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAwards.map((award) => {
          const config = categoryConfig[award.category] || categoryConfig['Annual'];
          return (
            <div 
              key={award.id} 
              className={`bg-white rounded-xl shadow-sm border ${config.borderColor} p-5 hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => setSelectedAward(award)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color} ${config.bgColor}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{award.name}</h3>
                    <p className="text-xs text-gray-400">{award.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[award.status]}`}>
                  {award.status}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{award.winner}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {award.rank}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-amber-600">{award.prize}</span>
                  <span className="text-xs text-gray-400">{award.date}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-amber-100/30">
                <p className="text-xs text-gray-500 line-clamp-2">{award.description}</p>
              </div>

              {award.category === 'Legacy Circle' && (
                <div className="mt-2 flex items-center gap-1">
                  <Gem size={12} className="text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">★ Legacy Circle Member</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Award Details Modal */}
      {selectedAward && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAward(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${categoryConfig[selectedAward.category]?.color || 'text-amber-600'} bg-amber-50`}>
                  {categoryConfig[selectedAward.category]?.icon || <Award size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedAward.name}</h3>
                  <p className="text-sm text-amber-600">{selectedAward.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAward(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                selectedAward.status === 'Active' ? 'bg-green-50' : 
                selectedAward.status === 'Past' ? 'bg-gray-50' : 'bg-yellow-50'
              }`}>
                {statusIcons[selectedAward.status]}
                <span className="text-sm font-medium">
                  {selectedAward.status === 'Active' ? 'Award Active' : 
                   selectedAward.status === 'Past' ? 'Past Award' : 'Upcoming Award'}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{selectedAward.date}</span>
              </div>

              {/* Prize */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-6 text-center border border-amber-200/30">
                <p className="text-sm text-gray-500">Prize</p>
                <p className="text-3xl font-bold text-amber-600">{selectedAward.prize}</p>
              </div>

              {/* Winner Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Winner</p>
                  <div className="mt-2">
                    <p className="text-lg font-semibold text-gray-800">{selectedAward.winner}</p>
                    <p className="text-sm text-gray-500">{selectedAward.rank}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Award Information</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">Year: {selectedAward.year}</p>
                    <p className="text-sm text-gray-600">Status: {selectedAward.status}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm text-gray-700 mt-1">{selectedAward.description}</p>
              </div>

              {/* Legacy Circle Special */}
              {selectedAward.category === 'Legacy Circle' && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200/50">
                  <div className="flex items-center gap-2">
                    <Gem size={20} className="text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-700">Legacy Circle Member</p>
                      <p className="text-xs text-amber-600">★ Inducted into OMA Hall of Legends</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  View Certificate
                </button>
                <button className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                  Share Award
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Awards;