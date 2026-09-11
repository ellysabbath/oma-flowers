// src/pages/admin/Bonuses.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Gift,
  Users,
  TrendingUp,
  Award,
  Star,
  Calendar,
  Trophy,
  Sparkles,
  Heart,
  PartyPopper,
  Zap,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

import { bonusAPI } from '../../api/bonuses';
import type { Bonus as ApiBonus } from '../../types';

/* ------------------------------------------------------------------ */
/* UI view-model                                                       */
/* ------------------------------------------------------------------ */

interface Bonus {
  id: number;
  name: string;
  type:
    | 'Consistency'
    | 'Referral'
    | 'Dynamic'
    | 'Training'
    | 'Event'
    | 'Booking'
    | 'Festival'
    | 'Loyalty';
  amount: number;
  distributor: string;
  rank: string;
  month: string;
  year: number;
  description: string;
  status: 'Paid' | 'Pending' | 'Processing';
  paymentDate?: string;
  rawStatus: 'paid' | 'pending' | 'processing';
  isUpdating?: boolean;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: number | string | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const todayISO = () => new Date().toISOString().split('T')[0];

/* ------------------------------------------------------------------ */
/* Bonus type config                                                   */
/* ------------------------------------------------------------------ */

const bonusTypeConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bgColor: string; label: string }
> = {
  Consistency: {
    color: 'text-blue-600 bg-blue-50',
    icon: <Clock size={16} />,
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Reward for consistent active distributors.',
  },
  Referral: {
    color: 'text-green-600 bg-green-50',
    icon: <Users size={16} />,
    bgColor: 'bg-green-50 border-green-200',
    label: 'Reward for referring new members with a high Smart Referral Score.',
  },
  Dynamic: {
    color: 'text-purple-600 bg-purple-50',
    icon: <TrendingUp size={16} />,
    bgColor: 'bg-purple-50 border-purple-200',
    label: 'Garden Star recognition for top monthly sales performers.',
  },
  Training: {
    color: 'text-amber-600 bg-amber-50',
    icon: <Award size={16} />,
    bgColor: 'bg-amber-50 border-amber-200',
    label: 'Excellence in training through OMA Flowers Academy.',
  },
  Event: {
    color: 'text-rose-600 bg-rose-50',
    icon: <PartyPopper size={16} />,
    bgColor: 'bg-rose-50 border-rose-200',
    label: 'Creative Design Bonus for best event decorations.',
  },
  Booking: {
    color: 'text-indigo-600 bg-indigo-50',
    icon: <Calendar size={16} />,
    bgColor: 'bg-indigo-50 border-indigo-200',
    label: '5% commission on successful event bookings.',
  },
  Festival: {
    color: 'text-orange-600 bg-orange-50',
    icon: <Star size={16} />,
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Seasonal festival bonuses.',
  },
  Loyalty: {
    color: 'text-amber-600 bg-amber-50',
    icon: <Heart size={16} />,
    bgColor: 'bg-amber-50 border-amber-200',
    label: 'Loyalty Sponsor Bonus for top sponsors.',
  },
};

const statusColors: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700 border-green-300',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Processing: 'bg-blue-100 text-blue-700 border-blue-300',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Bonuses: React.FC = () => {
  /* ---------- Data ---------- */
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  /* ---------- Filters ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  /* ---------- Modal ---------- */
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);

  /* ================================================================ */
  /* Fetch from /api/v1/bonuses/                                       */
  /* ================================================================ */

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: any = await bonusAPI.getAll();
      const raw: ApiBonus[] = normalizeList<ApiBonus>(data);

      const transformed: Bonus[] = raw.map((b: any) => ({
        id: b.id,
        name: b.name,
        type: capitalize(b.type) as Bonus['type'],
        amount: num(b.amount),
        distributor: b.distributor_name || `#${b.distributor}`,
        rank: b.distributor_rank || 'Associate',
        month: b.month || '',
        year: b.year || new Date().getFullYear(),
        description: b.description || '',
        status: capitalize(b.status) as Bonus['status'],
        paymentDate: b.payment_date || undefined,
        rawStatus: b.status,
      }));

      setBonuses(transformed);
    } catch (err: any) {
      console.error('Failed to load bonuses:', err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load bonuses.';
      setError(message);
      setBonuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  /* ================================================================ */
  /* Status change — local (backend PATCH pending)                     */
  /* ================================================================ */

  const handleStatusChange = (
    bonusId: number,
    newStatus: 'paid' | 'pending' | 'processing'
  ) => {
    const paymentDate = newStatus === 'paid' ? todayISO() : undefined;

    setBonuses((prev) =>
      prev.map((b) =>
        b.id === bonusId
          ? {
              ...b,
              rawStatus: newStatus,
              status: capitalize(newStatus) as Bonus['status'],
              paymentDate: paymentDate ?? b.paymentDate,
            }
          : b
      )
    );

    if (selectedBonus && selectedBonus.id === bonusId) {
      setSelectedBonus((prev) =>
        prev
          ? {
              ...prev,
              rawStatus: newStatus,
              status: capitalize(newStatus) as Bonus['status'],
              paymentDate: paymentDate ?? prev.paymentDate,
            }
          : null
      );
    }

    setBanner({
      type: 'success',
      text: `Bonus #${bonusId} marked as ${newStatus}.`,
    });
    setTimeout(() => setBanner(null), 3000);
  };

  /* ================================================================ */
  /* Derived                                                           */
  /* ================================================================ */

  const bonusTypes = useMemo(
    () => ['All', ...Array.from(new Set(bonuses.map((b) => b.type)))],
    [bonuses]
  );

  const filteredBonuses = useMemo(() => {
    return bonuses.filter((b) => {
      const matchesSearch =
        b.distributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.rank.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || b.type === filterType;
      const matchesStatus =
        filterStatus === 'All' || b.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [bonuses, searchTerm, filterType, filterStatus]);

  const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
  const paidBonuses = bonuses
    .filter((b) => b.status === 'Paid')
    .reduce((sum, b) => sum + b.amount, 0);
  const pendingBonuses = bonuses
    .filter((b) => b.status === 'Pending' || b.status === 'Processing')
    .reduce((sum, b) => sum + b.amount, 0);
  const activeBonuses = bonuses.filter((b) => b.status !== 'Paid').length;

  /* ================================================================ */
  /* CSV export                                                        */
  /* ================================================================ */

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Type',
      'Distributor',
      'Rank',
      'Amount (TSh)',
      'Status',
      'Month',
      'Year',
      'Payment Date',
      'Description',
    ];
    const rows = filteredBonuses.map((b) => [
      b.id,
      b.name,
      b.type,
      b.distributor,
      b.rank,
      b.amount,
      b.status,
      b.month,
      b.year,
      b.paymentDate || '',
      b.description,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bonuses-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================================================================ */
  /* Loading / error                                                   */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <p className="font-medium">Failed to load bonuses</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchBonuses}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Banner */}
      {banner && (
        <div
          className={`rounded-lg p-3 flex items-center gap-2 text-sm ${
            banner.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {banner.type === 'success' ? (
            <Check size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="flex-1">{banner.text}</span>
          <button onClick={() => setBanner(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bonuses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all distributor bonuses and rewards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBonuses}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredBonuses.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Bonuses</p>
              <h3 className="text-2xl font-bold text-amber-600">
                TSh {(totalBonuses / 1000).toFixed(1)}K
              </h3>
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
              <h3 className="text-2xl font-bold text-green-600">
                TSh {(paidBonuses / 1000).toFixed(1)}K
              </h3>
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
              <h3 className="text-2xl font-bold text-yellow-600">
                TSh {(pendingBonuses / 1000).toFixed(1)}K
              </h3>
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
              <h3 className="text-2xl font-bold text-blue-600">
                {activeBonuses}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Zap className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Types Summary */}
      {bonuses.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {Object.keys(bonusTypeConfig)
            .filter((type) => bonuses.some((b) => b.type === type))
            .slice(0, 6)
            .map((type) => {
              const list = bonuses.filter((b) => b.type === type);
              const count = list.length;
              const total = list.reduce((sum, b) => sum + b.amount, 0);
              return (
                <div
                  key={type}
                  className="bg-white rounded-lg border border-amber-200/30 p-2 text-center hover:shadow-md transition-shadow"
                >
                  <p className="text-xs text-gray-500">{type}</p>
                  <p className="text-sm font-bold text-amber-600">{count}</p>
                  <p className="text-xs text-gray-400">
                    TSh {(total / 1000).toFixed(1)}K
                  </p>
                </div>
              );
            })}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
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
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[150px]"
        >
          {bonusTypes.map((type) => (
            <option key={type} value={type}>
              {type === 'All' ? 'All Types' : type}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[130px]"
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Processing">Processing</option>
          <option value="Pending">Pending</option>
        </select>
        <button
          onClick={fetchBonuses}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Bonuses Grid */}
      {bonuses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-12 text-center">
          <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-600">No bonuses yet</p>
          <p className="text-sm text-gray-400">
            Bonuses appear here when the backend creates them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBonuses.map((bonus) => (
            <div
              key={bonus.id}
              className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => setSelectedBonus(bonus)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg ${
                      bonusTypeConfig[bonus.type]?.color || 'bg-gray-50'
                    }`}
                  >
                    {bonusTypeConfig[bonus.type]?.icon || <Gift size={16} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors text-sm">
                      {bonus.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {bonus.type} Bonus
                    </p>
                  </div>
                </div>

                {/* Inline status dropdown */}
                <div className="relative">
                  <select
                    value={bonus.rawStatus}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleStatusChange(
                        bonus.id,
                        e.target.value as
                          | 'paid'
                          | 'pending'
                          | 'processing'
                      )
                    }
                    className={`appearance-none pr-6 pl-2.5 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                      statusColors[bonus.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {bonus.distributor}
                  </span>
                  <span className="text-sm font-bold text-amber-600">
                    TSh {bonus.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      bonusTypeConfig[bonus.type]?.color || 'bg-gray-50'
                    }`}
                  >
                    {bonus.rank}
                  </span>
                  <span className="text-xs text-gray-400">
                    {bonus.month} {bonus.year}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-amber-100/30">
                <p className="text-xs text-gray-500 line-clamp-2">
                  {bonus.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBonus && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBonus(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    bonusTypeConfig[selectedBonus.type]?.color ||
                    'bg-gray-50'
                  }`}
                >
                  {bonusTypeConfig[selectedBonus.type]?.icon || (
                    <Gift size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedBonus.name}
                  </h3>
                  <p className="text-sm text-amber-600">
                    {selectedBonus.type} Bonus
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBonus(null)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-6 text-center border border-amber-200/30">
                <p className="text-sm text-gray-500">Bonus Amount</p>
                <p className="text-3xl font-bold text-amber-600">
                  TSh {selectedBonus.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedBonus.status}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Distributor
                  </p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Name:</span>{' '}
                      {selectedBonus.distributor}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Rank:</span>{' '}
                      {selectedBonus.rank}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Bonus Information
                  </p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Type:</span>{' '}
                      {selectedBonus.type}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Period:</span>{' '}
                      {selectedBonus.month} {selectedBonus.year}
                    </p>
                    {selectedBonus.paymentDate && (
                      <p className="text-sm">
                        <span className="text-gray-500">
                          Payment Date:
                        </span>{' '}
                        {selectedBonus.paymentDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">
                  Description
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {selectedBonus.description}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  bonusTypeConfig[selectedBonus.type]?.bgColor ||
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="text-sm font-medium text-gray-500">
                  Bonus Type Details
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {bonusTypeConfig[selectedBonus.type]?.label ||
                    'Special bonus for outstanding distributor performance.'}
                </p>
              </div>

              {/* Status buttons */}
              <div className="border-t border-amber-100/30 pt-4">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Change Status
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() =>
                      handleStatusChange(selectedBonus.id, 'pending')
                    }
                    disabled={selectedBonus.rawStatus === 'pending'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                      statusColors['Pending']
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedBonus.id, 'processing')
                    }
                    disabled={selectedBonus.rawStatus === 'processing'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                      statusColors['Processing']
                    }`}
                  >
                    Processing
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedBonus.id, 'paid')
                    }
                    disabled={selectedBonus.rawStatus === 'paid'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                      statusColors['Paid']
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>

              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button
                  onClick={() => setSelectedBonus(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
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