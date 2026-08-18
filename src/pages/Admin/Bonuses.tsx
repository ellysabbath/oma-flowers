// src/pages/admin/Bonuses.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown,
  Gift,
  Users,
  TrendingUp,
  Award,
  Star,
  Crown,
  Medal,
  Calendar,
  User,
  Trophy,
  Sparkles,
  Heart,
  PartyPopper,
  Target,
  Zap,
  Clock
} from 'lucide-react';

// Bonus data based on OMA Flowers business plan
interface Bonus {
  id: number;
  name: string;
  type: 'Consistency' | 'Referral' | 'Dynamic' | 'Training' | 'Event' | 'Booking' | 'Design' | 'Festival' | 'Loyalty';
  amount: number;
  distributor: string;
  rank: string;
  month: string;
  year: number;
  description: string;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentDate?: string;
  icon?: React.ReactNode;
}

const bonusesData: Bonus[] = [
  // Consistency Bonuses
  {
    id: 1,
    name: 'Consistency Bonus - Q3 2026',
    type: 'Consistency',
    amount: 150000,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    month: 'July',
    year: 2026,
    description: 'Consistent active distributor for 6+ months with stable sales performance',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 2,
    name: 'Consistency Bonus - Q3 2026',
    type: 'Consistency',
    amount: 100000,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    month: 'July',
    year: 2026,
    description: 'Consistent active distributor for 4+ months with growing network',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 3,
    name: 'Consistency Bonus - Q3 2026',
    type: 'Consistency',
    amount: 75000,
    distributor: 'Mike Johnson',
    rank: 'Director',
    month: 'July',
    year: 2026,
    description: 'Consistent active distributor for 4+ months with steady growth',
    status: 'Processing',
    paymentDate: '2026-08-15'
  },

  // Smart Referral Score Bonuses
  {
    id: 4,
    name: 'Smart Referral Score Bonus',
    type: 'Referral',
    amount: 75000,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    month: 'July',
    year: 2026,
    description: 'Referred 10+ new members with Smart Referral Score exceeding 50 points',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 5,
    name: 'Smart Referral Score Bonus',
    type: 'Referral',
    amount: 50000,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    month: 'July',
    year: 2026,
    description: 'Referred 8+ new members with Smart Referral Score exceeding 50 points',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 6,
    name: 'Smart Referral Score Bonus',
    type: 'Referral',
    amount: 25000,
    distributor: 'Mike Johnson',
    rank: 'Director',
    month: 'July',
    year: 2026,
    description: 'Referred 5+ new members with Smart Referral Score',
    status: 'Pending',
    paymentDate: '2026-08-20'
  },

  // Dynamic Team Sales Bonus - Garden Stars
  {
    id: 7,
    name: 'Diamond Garden Star',
    type: 'Dynamic',
    amount: 200000,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    month: 'July',
    year: 2026,
    description: 'Top sales performer with over 250 PV monthly - Diamond Garden Star ★★★',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 8,
    name: 'Gold Garden Star',
    type: 'Dynamic',
    amount: 150000,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    month: 'July',
    year: 2026,
    description: 'Second best sales performer - Gold Garden Star ★★',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 9,
    name: 'Silver Garden Star',
    type: 'Dynamic',
    amount: 100000,
    distributor: 'Mike Johnson',
    rank: 'Director',
    month: 'July',
    year: 2026,
    description: 'Third best sales performer - Silver Garden Star ★',
    status: 'Processing',
    paymentDate: '2026-08-15'
  },

  // Training Excellence Bonus
  {
    id: 10,
    name: 'Mentor Academy Bonus',
    type: 'Training',
    amount: 250000,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    month: 'July',
    year: 2026,
    description: 'Outstanding Academy Trainer of the Year - Best transformation in OMA Flower\'s Academy',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 11,
    name: 'Training Excellence Bonus',
    type: 'Training',
    amount: 150000,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    month: 'July',
    year: 2026,
    description: 'Excellence in training and development of new distributors',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },

  // Event Bonuses
  {
    id: 12,
    name: 'Wedding Decoration Award',
    type: 'Event',
    amount: 120000,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    month: 'July',
    year: 2026,
    description: 'Best Wedding Decoration Award - Creative Design Bonus winner',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 13,
    name: 'Graduation Decoration Award',
    type: 'Event',
    amount: 80000,
    distributor: 'Mike Johnson',
    rank: 'Director',
    month: 'July',
    year: 2026,
    description: 'Best Graduation Decoration Award - Creative Design Bonus winner',
    status: 'Processing',
    paymentDate: '2026-08-15'
  },

  // Booking Bonuses
  {
    id: 14,
    name: 'Event Booking Bonus',
    type: 'Booking',
    amount: 45000,
    distributor: 'Mike Johnson',
    rank: 'Director',
    month: 'July',
    year: 2026,
    description: '5% commission on event booking - Wedding event worth TSh 900,000',
    status: 'Paid',
    paymentDate: '2026-07-31'
  },
  {
    id: 15,
    name: 'Event Booking Bonus',
    type: 'Booking',
    amount: 30000,
    distributor: 'Peter Wilson',
    rank: 'Senior Manager',
    month: 'July',
    year: 2026,
    description: '5% commission on event booking - Birthday party event',
    status: 'Pending',
    paymentDate: '2026-08-20'
  },

  // Festival Bonuses
  {
    id: 16,
    name: 'Christmas Festival Bonus',
    type: 'Festival',
    amount: 80000,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    month: 'December',
    year: 2025,
    description: 'Christmas season festival bonus - Top performing Academy',
    status: 'Paid',
    paymentDate: '2025-12-31'
  },
  {
    id: 17,
    name: 'Easter Festival Bonus',
    type: 'Festival',
    amount: 60000,
    distributor: 'Sarah Smith',
    rank: 'Crown Director',
    month: 'April',
    year: 2026,
    description: 'Easter season festival bonus - Excellence in decoration',
    status: 'Paid',
    paymentDate: '2026-04-30'
  },

  // Loyalty Sponsor Bonus
  {
    id: 18,
    name: 'Loyalty Sponsor Bonus',
    type: 'Loyalty',
    amount: 50000,
    distributor: 'John Doe',
    rank: 'Royal Crown Director',
    month: 'July',
    year: 2026,
    description: 'Loyalty Sponsor Bonus - Special birthday recognition for top sponsors',
    status: 'Paid',
    paymentDate: '2026-07-31'
  }
];

// Bonus type colors and icons
const bonusTypeConfig: Record<string, { color: string, icon: React.ReactNode, bgColor: string }> = {
  'Consistency': { 
    color: 'text-blue-600 bg-blue-50', 
    icon: <Clock size={16} />,
    bgColor: 'bg-blue-50 border-blue-200'
  },
  'Referral': { 
    color: 'text-green-600 bg-green-50', 
    icon: <Users size={16} />,
    bgColor: 'bg-green-50 border-green-200'
  },
  'Dynamic': { 
    color: 'text-purple-600 bg-purple-50', 
    icon: <TrendingUp size={16} />,
    bgColor: 'bg-purple-50 border-purple-200'
  },
  'Training': { 
    color: 'text-amber-600 bg-amber-50', 
    icon: <Award size={16} />,
    bgColor: 'bg-amber-50 border-amber-200'
  },
  'Event': { 
    color: 'text-rose-600 bg-rose-50', 
    icon: <PartyPopper size={16} />,
    bgColor: 'bg-rose-50 border-rose-200'
  },
  'Booking': { 
    color: 'text-indigo-600 bg-indigo-50', 
    icon: <Calendar size={16} />,
    bgColor: 'bg-indigo-50 border-indigo-200'
  },
  'Design': { 
    color: 'text-pink-600 bg-pink-50', 
    icon: <Sparkles size={16} />,
    bgColor: 'bg-pink-50 border-pink-200'
  },
  'Festival': { 
    color: 'text-orange-600 bg-orange-50', 
    icon: <Star size={16} />,
    bgColor: 'bg-orange-50 border-orange-200'
  },
  'Loyalty': { 
    color: 'text-amber-600 bg-amber-50', 
    icon: <Heart size={16} />,
    bgColor: 'bg-amber-50 border-amber-200'
  }
};

const statusColors: Record<string, string> = {
  'Paid': 'bg-green-100 text-green-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Processing': 'bg-blue-100 text-blue-700'
};

const Bonuses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);

  // Get unique types for filter
  const bonusTypes = ['All', ...new Set(bonusesData.map(b => b.type))];

  // Filter bonuses
  const filteredBonuses = bonusesData.filter(b => {
    const matchesSearch = b.distributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.rank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || b.type === filterType;
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const totalBonuses = bonusesData.reduce((sum, b) => sum + b.amount, 0);
  const paidBonuses = bonusesData.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const pendingBonuses = bonusesData.filter(b => b.status === 'Pending' || b.status === 'Processing').reduce((sum, b) => sum + b.amount, 0);
  const activeBonuses = bonusesData.filter(b => b.status !== 'Paid').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bonuses</h1>
          <p className="text-sm text-gray-500 mt-1">Track all distributor bonuses and rewards</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium">
            <Gift size={16} />
            View Calendar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bonuses</p>
              <h3 className="text-2xl font-bold text-amber-600">TSh {(totalBonuses/1000).toFixed(1)}K</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Gift className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid Bonuses</p>
              <h3 className="text-2xl font-bold text-green-600">TSh {(paidBonuses/1000).toFixed(1)}K</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <Trophy className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Bonuses</p>
              <h3 className="text-2xl font-bold text-yellow-600">TSh {(pendingBonuses/1000).toFixed(1)}K</h3>
            </div>
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <Clock className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Bonuses</p>
              <h3 className="text-2xl font-bold text-blue-600">{activeBonuses}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Zap className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Types Summary */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {Object.keys(bonusTypeConfig).slice(0, 6).map(type => {
          const count = bonusesData.filter(b => b.type === type).length;
          const total = bonusesData.filter(b => b.type === type).reduce((sum, b) => sum + b.amount, 0);
          return (
            <div key={type} className="bg-white rounded-lg border border-amber-200/30 p-2 text-center hover:shadow-md transition-shadow">
              <p className="text-xs text-gray-500">{type}</p>
              <p className="text-sm font-bold text-amber-600">{count}</p>
              <p className="text-xs text-gray-400">TSh {(total/1000).toFixed(1)}K</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by distributor, bonus name, or rank..."
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
          {bonusTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
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

      {/* Bonuses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBonuses.map((bonus) => (
          <div 
            key={bonus.id} 
            className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => setSelectedBonus(bonus)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${bonusTypeConfig[bonus.type]?.color || 'bg-gray-50'}`}>
                  {bonusTypeConfig[bonus.type]?.icon || <Gift size={16} />}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors text-sm">
                    {bonus.name}
                  </h3>
                  <p className="text-xs text-gray-400">{bonus.type} Bonus</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[bonus.status]}`}>
                {bonus.status}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{bonus.distributor}</span>
                <span className="text-sm font-bold text-amber-600">TSh {bonus.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${bonusTypeConfig[bonus.type]?.color || 'bg-gray-50'}`}>
                  {bonus.rank}
                </span>
                <span className="text-xs text-gray-400">{bonus.month} {bonus.year}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-amber-100/30">
              <p className="text-xs text-gray-500 line-clamp-2">{bonus.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bonus Details Modal */}
      {selectedBonus && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedBonus(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${bonusTypeConfig[selectedBonus.type]?.color || 'bg-gray-50'}`}>
                  {bonusTypeConfig[selectedBonus.type]?.icon || <Gift size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedBonus.name}</h3>
                  <p className="text-sm text-amber-600">{selectedBonus.type} Bonus</p>
                </div>
              </div>
              <button onClick={() => setSelectedBonus(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-6 text-center border border-amber-200/30">
                <p className="text-sm text-gray-500">Bonus Amount</p>
                <p className="text-3xl font-bold text-amber-600">TSh {selectedBonus.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedBonus.status}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Distributor Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedBonus.distributor}</p>
                    <p className="text-sm"><span className="text-gray-500">Rank:</span> {selectedBonus.rank}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Bonus Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Type:</span> {selectedBonus.type}</p>
                    <p className="text-sm"><span className="text-gray-500">Period:</span> {selectedBonus.month} {selectedBonus.year}</p>
                    {selectedBonus.paymentDate && (
                      <p className="text-sm"><span className="text-gray-500">Payment Date:</span> {selectedBonus.paymentDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm text-gray-700 mt-1">{selectedBonus.description}</p>
              </div>

              {/* Bonus Type Info */}
              <div className={`p-4 rounded-lg border ${bonusTypeConfig[selectedBonus.type]?.bgColor || 'bg-gray-50 border-gray-200'}`}>
                <p className="text-sm font-medium text-gray-500">Bonus Type Details</p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBonus.type === 'Consistency' && 'Reward for consistent active distributors with stable sales performance.'}
                  {selectedBonus.type === 'Referral' && 'Reward for referring new members with high Smart Referral Score.'}
                  {selectedBonus.type === 'Dynamic' && 'Top sales performers who exceed 250 PV monthly - Garden Stars recognition.'}
                  {selectedBonus.type === 'Training' && 'Excellence in training and development through OMA Flower\'s Academy.'}
                  {selectedBonus.type === 'Event' && 'Creative Design Bonus for best event decorations.'}
                  {selectedBonus.type === 'Booking' && '5% commission on event bookings.'}
                  {selectedBonus.type === 'Festival' && 'Seasonal festival bonuses for special occasions.'}
                  {selectedBonus.type === 'Loyalty' && 'Loyalty Sponsor Bonus - Special recognition for top sponsors.'}
                </p>
              </div>

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  Process Payment
                </button>
                <button className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bonuses;