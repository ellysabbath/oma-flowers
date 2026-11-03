// src/pages/Admin/Bonuses.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
  Heart,
  PartyPopper,
  Zap,
  Clock,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

import { bonusAPI } from '../../api/bonuses';
import { SkeletonListPage } from '../../components/common/Skeleton';
import { useAuth } from '../../context/AuthContext';
import type { Bonus as ApiBonus, BonusStatus } from '../../types';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const typeConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bgColor: string; label: string }
> = {
  consistency: {
    color: 'text-blue-600 bg-blue-50',
    icon: <Clock size={16} />,
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'Reward for consistent active distributors.',
  },
  referral: {
    color: 'text-green-600 bg-green-50',
    icon: <Users size={16} />,
    bgColor: 'bg-green-50 border-green-200',
    label: 'Reward for referring new members.',
  },
  dynamic: {
    color: 'text-purple-600 bg-purple-50',
    icon: <TrendingUp size={16} />,
    bgColor: 'bg-purple-50 border-purple-200',
    label: 'Recognition for top monthly sales performers.',
  },
  training: {
    color: 'text-amber-600 bg-amber-50',
    icon: <Award size={16} />,
    bgColor: 'bg-amber-50 border-amber-200',
    label: 'Excellence in training through OMA Flowers Academy.',
  },
  event: {
    color: 'text-rose-600 bg-rose-50',
    icon: <PartyPopper size={16} />,
    bgColor: 'bg-rose-50 border-rose-200',
    label: 'Creative Design Bonus for best event decorations.',
  },
  booking: {
    color: 'text-indigo-600 bg-indigo-50',
    icon: <Calendar size={16} />,
    bgColor: 'bg-indigo-50 border-indigo-200',
    label: '5% commission on successful event bookings.',
  },
  design: {
    color: 'text-fuchsia-600 bg-fuchsia-50',
    icon: <Star size={16} />,
    bgColor: 'bg-fuchsia-50 border-fuchsia-200',
    label: 'Design excellence bonus.',
  },
  festival: {
    color: 'text-orange-600 bg-orange-50',
    icon: <Star size={16} />,
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Seasonal festival bonuses.',
  },
  loyalty: {
    color: 'text-amber-600 bg-amber-50',
    icon: <Heart size={16} />,
    bgColor: 'bg-amber-50 border-amber-200',
    label: 'Loyalty Sponsor Bonus for top sponsors.',
  },
};

const statusStyles: Record<BonusStatus, string> = {
  paid: 'bg-green-100 text-green-700 border-green-300',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  processing: 'bg-blue-100 text-blue-700 border-blue-300',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const todayISO = () => new Date().toISOString().split('T')[0];

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

const Bonuses: React.FC = () => {
  const { user: authUser, isLoading: authLoading } = useAuth();

  /* ---------- Data ---------- */
  const [bonuses, setBonuses] = useState<ApiBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Filters ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  /* ---------- Detail modal ---------- */
  const [selectedBonus, setSelectedBonus] = useState<ApiBonus | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  /* ================================================================ */
  /* Fetch                                                             */
  /* ================================================================ */

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const bonusList = await bonusAPI.getAll();
      setBonuses(bonusList);
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
    if (authLoading) return;
    if (!authUser) {
      setLoading(false);
      return;
    }
    fetchBonuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authUser?.id]);

  /* ================================================================ */
  /* Mark as paid                                                      */
  /* ================================================================ */

  const handleMarkPaid = async (bonus: ApiBonus) => {
    if (bonus.status === 'paid' || payingId !== null) return;
    setPayError(null);
    setPayingId(bonus.id);
    try {
      const updated = await bonusAPI.update(bonus.id, {
        status: 'paid',
        payment_date: todayISO(),
      });

      // Update local state so the card + modal reflect the change
      // without a full reload.
      setBonuses((prev) =>
        prev.map((b) => (b.id === bonus.id ? { ...b, ...updated } : b))
      );
      setSelectedBonus((prev) =>
        prev && prev.id === bonus.id ? { ...prev, ...updated } : prev
      );
    } catch (err: any) {
      console.error('Failed to mark bonus paid:', err);
      setPayError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to mark this bonus as paid.'
      );
    } finally {
      setPayingId(null);
    }
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
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (b.distributor_name || '').toLowerCase().includes(q) ||
        (b.name || '').toLowerCase().includes(q) ||
        (b.distributor_rank || '').toLowerCase().includes(q);
      const matchesType = filterType === 'All' || b.type === filterType;
      const matchesStatus =
        filterStatus === 'All' || capitalize(b.status) === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [bonuses, searchTerm, filterType, filterStatus]);

  const totalBonuses = bonuses.reduce((s, b) => s + num(b.amount), 0);
  const paidBonuses = bonuses
    .filter((b) => b.status === 'paid')
    .reduce((s, b) => s + num(b.amount), 0);
  const pendingBonuses = bonuses
    .filter((b) => b.status === 'pending' || b.status === 'processing')
    .reduce((s, b) => s + num(b.amount), 0);
  const activeBonuses = bonuses.filter((b) => b.status !== 'paid').length;

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
      b.distributor_name || `#${b.distributor}`,
      b.distributor_rank || '',
      num(b.amount),
      b.status,
      b.month,
      b.year,
      b.payment_date || '',
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

  if (authLoading || loading) {
    return <SkeletonListPage rows={8} cols={7} kpis toolbar />;
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bonuses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bonuses are calculated automatically by the system when
            distributors sell goods. You can mark them as paid from here.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchBonuses}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all text-sm font-medium"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredBonuses.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all text-sm font-medium disabled:opacity-50"
          >
            <Download size={16} />
            Export
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
          {bonusTypes.map((t) => (
            <option key={t} value={t}>
              {t === 'All' ? 'All Types' : capitalize(t)}
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
      {filteredBonuses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-12 text-center">
          <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-600">
            {bonuses.length === 0
              ? 'No bonuses yet'
              : 'No bonuses match your filters'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {bonuses.length === 0
              ? 'Bonuses will appear here automatically once sales are recorded.'
              : 'Try adjusting search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBonuses.map((b) => {
            const cfg = typeConfig[b.type];
            const isPaid = b.status === 'paid';
            const isPaying = payingId === b.id;
            return (
              <div
                key={b.id}
                className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedBonus(b)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg ${
                        cfg?.color || 'bg-gray-50'
                      }`}
                    >
                      {cfg?.icon || <Gift size={16} />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors text-sm">
                        {b.name}
                      </h3>
                      <p className="text-xs text-gray-400 capitalize">
                        {b.type} Bonus
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {b.distributor_name || `#${b.distributor}`}
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                      TSh {num(b.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        cfg?.color || 'bg-gray-50'
                      }`}
                    >
                      {b.distributor_rank || 'Associate'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {b.month} {b.year}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-100/30 flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      statusStyles[b.status]
                    }`}
                  >
                    {capitalize(b.status)}
                  </span>

                  {isPaid ? (
                    <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={12} />
                      Paid
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkPaid(b);
                      }}
                      disabled={isPaying}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPaying ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      {isPaying ? 'Paying…' : 'Mark Paid'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBonus && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedBonus(null);
            setPayError(null);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    typeConfig[selectedBonus.type]?.color || 'bg-gray-50'
                  }`}
                >
                  {typeConfig[selectedBonus.type]?.icon || <Gift size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedBonus.name}
                  </h3>
                  <p className="text-sm text-amber-600 capitalize">
                    {selectedBonus.type} Bonus
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedBonus(null);
                  setPayError(null);
                }}
                className="p-2 hover:bg-amber-50 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-6 text-center border border-amber-200/30">
                <p className="text-sm text-gray-500">Bonus Amount</p>
                <p className="text-3xl font-bold text-amber-600">
                  TSh {num(selectedBonus.amount).toLocaleString()}
                </p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${
                    statusStyles[selectedBonus.status]
                  }`}
                >
                  {capitalize(selectedBonus.status)}
                </span>
                {selectedBonus.payment_date && (
                  <p className="text-xs text-gray-500 mt-2">
                    Paid on {selectedBonus.payment_date}
                  </p>
                )}
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {payError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Distributor
                  </p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Name:</span>{' '}
                      {selectedBonus.distributor_name ||
                        `#${selectedBonus.distributor}`}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Rank:</span>{' '}
                      {selectedBonus.distributor_rank || 'Associate'}
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
                      <span className="capitalize">{selectedBonus.type}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Period:</span>{' '}
                      {selectedBonus.month} {selectedBonus.year}
                    </p>
                    {selectedBonus.payment_date && (
                      <p className="text-sm">
                        <span className="text-gray-500">Payment Date:</span>{' '}
                        {selectedBonus.payment_date}
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
                  {selectedBonus.description || '—'}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  typeConfig[selectedBonus.type]?.bgColor ||
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="text-sm font-medium text-gray-500">
                  Bonus Type Details
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {typeConfig[selectedBonus.type]?.label ||
                    'Special bonus for outstanding distributor performance.'}
                </p>
              </div>

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4 flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedBonus(null);
                    setPayError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedBonus.status !== 'paid' && (
                  <button
                    onClick={() => handleMarkPaid(selectedBonus)}
                    disabled={payingId === selectedBonus.id}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {payingId === selectedBonus.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    {payingId === selectedBonus.id
                      ? 'Marking as Paid…'
                      : 'Mark as Paid'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bonuses;