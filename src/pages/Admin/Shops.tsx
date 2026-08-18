// src/pages/admin/Shops.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Store, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Star,
  Crown,
  Award,
  Users,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Plus
} from 'lucide-react';

interface Shop {
  id: number;
  name: string;
  owner: string;
  ownerAvatar: string;
  location: string;
  region: string;
  country: string;
  performanceLevel: 'Seed' | 'Bloom' | 'Garden' | 'Emerald' | 'Diamond' | 'Crown' | 'Gold Crown';
  monthlyRevenue: number;
  bonusPercentage: number;
  customers: number;
  rating: number;
  status: 'Active' | 'Inactive' | 'Pending';
  established: string;
  phone: string;
  email: string;
}

const shopsData: Shop[] = [
  {
    id: 1,
    name: 'OMA Flowers - Dar es Salaam',
    owner: 'John Doe',
    ownerAvatar: 'https://ui-avatars.com/api/?name=John+Doe&background=amber&color=fff',
    location: 'Dar es Salaam',
    region: 'Kinondoni',
    country: 'Tanzania',
    performanceLevel: 'Gold Crown',
    monthlyRevenue: 55000,
    bonusPercentage: 6.0,
    customers: 245,
    rating: 4.9,
    status: 'Active',
    established: '2023-01-15',
    phone: '+255 712 345 678',
    email: 'shop.dar@omaflowers.com'
  },
  {
    id: 2,
    name: 'OMA Flowers - Arusha',
    owner: 'Sarah Smith',
    ownerAvatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=amber&color=fff',
    location: 'Arusha',
    region: 'Arusha City',
    country: 'Tanzania',
    performanceLevel: 'Crown',
    monthlyRevenue: 35000,
    bonusPercentage: 5.5,
    customers: 189,
    rating: 4.7,
    status: 'Active',
    established: '2023-03-20',
    phone: '+255 765 432 100',
    email: 'shop.arusha@omaflowers.com'
  },
  {
    id: 3,
    name: 'OMA Flowers - Mwanza',
    owner: 'Mike Johnson',
    ownerAvatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=amber&color=fff',
    location: 'Mwanza',
    region: 'Mwanza City',
    country: 'Tanzania',
    performanceLevel: 'Diamond',
    monthlyRevenue: 25000,
    bonusPercentage: 5.0,
    customers: 156,
    rating: 4.5,
    status: 'Active',
    established: '2023-05-10',
    phone: '+255 698 765 432',
    email: 'shop.mwanza@omaflowers.com'
  },
  {
    id: 4,
    name: 'OMA Flowers - Kilimanjaro',
    owner: 'Peter Wilson',
    ownerAvatar: 'https://ui-avatars.com/api/?name=Peter+Wilson&background=amber&color=fff',
    location: 'Moshi',
    region: 'Kilimanjaro',
    country: 'Tanzania',
    performanceLevel: 'Emerald',
    monthlyRevenue: 15000,
    bonusPercentage: 4.5,
    customers: 98,
    rating: 4.3,
    status: 'Active',
    established: '2023-07-05',
    phone: '+255 745 678 123',
    email: 'shop.kilimanjaro@omaflowers.com'
  },
  {
    id: 5,
    name: 'OMA Flowers - Tanga',
    owner: 'Jane Brown',
    ownerAvatar: 'https://ui-avatars.com/api/?name=Jane+Brown&background=amber&color=fff',
    location: 'Tanga',
    region: 'Tanga City',
    country: 'Tanzania',
    performanceLevel: 'Garden',
    monthlyRevenue: 8000,
    bonusPercentage: 4.0,
    customers: 67,
    rating: 4.1,
    status: 'Active',
    established: '2023-09-12',
    phone: '+255 754 321 987',
    email: 'shop.tanga@omaflowers.com'
  },
  {
    id: 6,
    name: 'OMA Flowers - Dodoma',
    owner: 'Robert Davis',
    ownerAvatar: 'https://ui-avatars.com/api/?name=Robert+Davis&background=amber&color=fff',
    location: 'Dodoma',
    region: 'Dodoma City',
    country: 'Tanzania',
    performanceLevel: 'Bloom',
    monthlyRevenue: 4000,
    bonusPercentage: 3.5,
    customers: 45,
    rating: 3.9,
    status: 'Pending',
    established: '2024-01-10',
    phone: '+255 712 987 654',
    email: 'shop.dodoma@omaflowers.com'
  }
];

// Performance level colors and icons
const performanceConfig: Record<string, { color: string, icon: React.ReactNode, bgColor: string }> = {
  'Gold Crown': { 
    color: 'text-amber-600', 
    icon: <Crown size={16} />,
    bgColor: 'bg-amber-50 border-amber-200'
  },
  'Crown': { 
    color: 'text-purple-600', 
    icon: <Crown size={16} />,
    bgColor: 'bg-purple-50 border-purple-200'
  },
  'Diamond': { 
    color: 'text-blue-600', 
    icon: <Star size={16} />,
    bgColor: 'bg-blue-50 border-blue-200'
  },
  'Emerald': { 
    color: 'text-emerald-600', 
    icon: <Award size={16} />,
    bgColor: 'bg-emerald-50 border-emerald-200'
  },
  'Garden': { 
    color: 'text-green-600', 
    icon: <Store size={16} />,
    bgColor: 'bg-green-50 border-green-200'
  },
  'Bloom': { 
    color: 'text-rose-600', 
    icon: <Store size={16} />,
    bgColor: 'bg-rose-50 border-rose-200'
  },
  'Seed': { 
    color: 'text-gray-600', 
    icon: <Store size={16} />,
    bgColor: 'bg-gray-50 border-gray-200'
  }
};

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Inactive': 'bg-red-100 text-red-700',
  'Pending': 'bg-yellow-100 text-yellow-700'
};

const Shops: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const levels = ['All', ...new Set(shopsData.map(s => s.performanceLevel))];
  const statuses = ['All', ...new Set(shopsData.map(s => s.status))];

  const filteredShops = shopsData.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'All' || s.performanceLevel === filterLevel;
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const totalShops = shopsData.length;
  const activeShops = shopsData.filter(s => s.status === 'Active').length;
  const totalRevenue = shopsData.reduce((sum, s) => sum + s.monthlyRevenue, 0);
  const totalCustomers = shopsData.reduce((sum, s) => sum + s.customers, 0);
  const goldCrownShops = shopsData.filter(s => s.performanceLevel === 'Gold Crown').length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">OMA Shops</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all OMA Flowers shop locations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
          <Plus size={16} />
          Add Shop
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Shops</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalShops}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Store className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Shops</p>
              <h3 className="text-2xl font-bold text-green-600">{activeShops}</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Revenue</p>
              <h3 className="text-2xl font-bold text-blue-600">TSh {(totalRevenue/1000).toFixed(1)}K</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <DollarSign className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Gold Crown</p>
              <h3 className="text-2xl font-bold text-amber-600">{goldCrownShops}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Crown className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Level Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-600">Performance Levels:</span>
          {Object.entries(performanceConfig).map(([level, config]) => (
            <div key={level} className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bgColor}`}>
              {config.icon}
              <span className={`text-xs font-medium ${config.color}`}>{level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by shop name, owner, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          {levels.map(level => (
            <option key={level} value={level}>{level}</option>
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

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShops.map((shop) => {
          const config = performanceConfig[shop.performanceLevel] || performanceConfig['Seed'];
          return (
            <div 
              key={shop.id} 
              className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedShop(shop)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${config.color} ${config.bgColor}`}>
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{shop.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={12} /> {shop.location}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[shop.status]}`}>
                  {shop.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-amber-50/50 rounded-lg">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-sm font-bold text-amber-600">TSh {shop.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="text-center p-2 bg-blue-50/50 rounded-lg">
                  <p className="text-xs text-gray-500">Customers</p>
                  <p className="text-sm font-bold text-blue-600">{shop.customers}</p>
                </div>
                <div className="text-center p-2 bg-green-50/50 rounded-lg">
                  <p className="text-xs text-gray-500">Bonus</p>
                  <p className="text-sm font-bold text-green-600">{shop.bonusPercentage}%</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-amber-100/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={shop.ownerAvatar} alt={shop.owner} className="w-6 h-6 rounded-full" />
                  <span className="text-xs text-gray-600">{shop.owner}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-medium text-gray-600">{shop.rating}</span>
                </div>
              </div>

              {shop.performanceLevel === 'Gold Crown' && (
                <div className="mt-2 flex items-center gap-1">
                  <Crown size={12} className="text-amber-500" />
                  <span className="text-xs text-amber-600 font-medium">★ Premium Location</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Shop Details Modal */}
      {selectedShop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedShop(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{selectedShop.name}</h3>
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <MapPin size={16} /> {selectedShop.location}, {selectedShop.region}
                </p>
              </div>
              <button onClick={() => setSelectedShop(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Performance Badge */}
              <div className={`flex items-center gap-3 p-3 rounded-lg ${performanceConfig[selectedShop.performanceLevel]?.bgColor}`}>
                {performanceConfig[selectedShop.performanceLevel]?.icon}
                <div>
                  <p className="text-sm font-medium">{selectedShop.performanceLevel}</p>
                  <p className="text-xs text-gray-500">{selectedShop.bonusPercentage}% Bonus Rate</p>
                </div>
                <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedShop.status]}`}>
                  {selectedShop.status}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Monthly Revenue</p>
                  <p className="text-lg font-bold text-amber-600">TSh {selectedShop.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Customers</p>
                  <p className="text-lg font-bold text-blue-600">{selectedShop.customers}</p>
                </div>
                <div className="bg-yellow-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-lg font-bold text-yellow-600">{selectedShop.rating} ★</p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Shop Owner</p>
                <div className="mt-2 flex items-center gap-3">
                  <img src={selectedShop.ownerAvatar} alt={selectedShop.owner} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-800">{selectedShop.owner}</p>
                    <p className="text-sm text-gray-500">{selectedShop.phone}</p>
                    <p className="text-sm text-gray-500">{selectedShop.email}</p>
                  </div>
                </div>
              </div>

              {/* Shop Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="text-gray-500">City:</span> {selectedShop.location}</p>
                    <p className="text-sm"><span className="text-gray-500">Region:</span> {selectedShop.region}</p>
                    <p className="text-sm"><span className="text-gray-500">Country:</span> {selectedShop.country}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Shop Information</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><span className="text-gray-500">Established:</span> {selectedShop.established}</p>
                    <p className="text-sm"><span className="text-gray-500">Status:</span> {selectedShop.status}</p>
                    <p className="text-sm"><span className="text-gray-500">Performance:</span> {selectedShop.performanceLevel}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  Edit Shop
                </button>
                <button className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shops;