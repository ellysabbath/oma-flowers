// src/pages/distributor/MyBonuses.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
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
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

import { bonusAPI } from '../../api/bonuses';
import { useAuth } from '../../context/AuthContext';
import { SkeletonListPage } from '../../components/common/Skeleton';
import type { Bonus as ApiBonus, BonusStatus } from '../../types';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const STATUSES: BonusStatus[] = ['pending', 'processing', 'paid'];

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

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
};

const todayISO = () => new Date().toISOString().split('T')[0];

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */

const MyBonuses: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();

  const [bonuses, setBonuses] = useState<ApiBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterYear, setFilterYear] = useState('All');

  const [selectedBonus, setSelectedBonus] = useState<ApiBonus | null>(null);

  /* ================================================================ */
  /* Fetch                                                             */
  /* ================================================================ */

  const loadBonuses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try `getMine` first; fall back to `getAll` if backend filters by user.
      let list: ApiBonus[] = [];
      try {
        list = await bonusAPI.getMine();
      } catch (e: any) {
        // Some backends return 405/404 for `mine=true`; fall back to getAll
        if (e?.response?.status === 404 || e?.response?.status === 405) {
          list = await bonusAPI.getAll();
        } else {
          throw e;
        }
      }

      setBonuses(list);
    } catch (err: any) {
      console.error('Failed to load my bonuses:', err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load your bonuses.'
      );
      setBonuses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    loadBonuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, (user as any)?.id]);

  /* ================================================================ */
  /* Derived                                                           */
  /* ================================================================ */

  const years = useMemo(() => {
    const set = new Set<number>();
    bonuses.forEach((b) => set.add(b.year));
    return ['All', ...Array.from(set).sort((a, b) => b - a).map(String)];
  }, [bonuses]);

  const types = useMemo(
    () => ['All', ...Array.from(new Set(bonuses.map((b) => b.type)))],
    [bonuses]
  );

  const filteredBonuses = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return bonuses.filter((b) => {
      const matchesSearch =
        !q ||
        (b.name || '').toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q) ||
        (b.type || '').toLowerCase().includes(q);
      const matchesType = filterType === 'All' || b.type === filterType;
      const matchesStatus =
        filterStatus === 'All' ||
        capitalize(b.status) === filterStatus;
      const matchesYear =
        filterYear === 'All' || String(b.year) === filterYear;
      return matchesSearch && matchesType && matchesStatus && matchesYear;
    });
  }, [bonuses, searchTerm, filterType, filterStatus, filterYear]);

  const totalBonuses = bonuses.reduce((s, b) => s + num(b.amount), 0);
  const paidBonuses = bonuses
    .filter((b) => b.status === 'paid')
    .reduce((s, b) => s + num(b.amount), 0);
  const pendingBonuses = bonuses
    .filter((b) => b.status === 'pending' || b.status === 'processing')
    .reduce((s, b) => s + num(b.amount), 0);
  const paidCount = bonuses.filter((b) => b.status === 'paid').length;
  const pendingCount = bonuses.filter(
    (b) => b.status === 'pending' || b.status === 'processing'
  ).length;

  /* ================================================================ */
  /* CSV export                                                        */
  /* ================================================================ */

  const handleExportCSV = () => {
    if (filteredBonuses.length === 0) return;
    const headers = [
      'ID',
      'Name',
      'Type',
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
    a.download = `my-bonuses-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================================================================ */
  /* Loading / error                                                   */
  /* ================================================================ */

  if (authLoading || loading) {
    return <SkeletonListPage rows={6} cols={3} kpis toolbar />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h2 className="text-xl font-bold text-gray-800">
            Couldn't load your bonuses
          </h2>
          <p className="text-gray-500 mt-2 text-sm">{error}</p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={loadBonuses}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} /> Retry
            </button>
            <Link
              to="/distributor"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Gift className="text-amber-500" size={22} />
              <h1 className="text-3xl font-bold text-gray-800">My Bonuses</h1>
            </div>
            <p className="text-gray-500 mt-1">
              All bonuses, rewards, and payments assigned to you
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadBonuses}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredBonuses.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-xs text-gray-400 mt-0.5">
                  {bonuses.length} bonus{bonuses.length === 1 ? '' : 'es'}
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Gift className="text-amber-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paid</p>
                <h3 className="text-2xl font-bold text-green-600">
                  TSh {(paidBonuses / 1000).toFixed(1)}K
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {paidCount} payment{paidCount === 1 ? '' : 's'}
                </p>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg">
                <Trophy className="text-green-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <h3 className="text-2xl font-bold text-yellow-600">
                  TSh {(pendingBonuses / 1000).toFixed(1)}K
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {pendingCount} pending
                </p>
              </div>
              <div className="p-2.5 bg-yellow-50 rounded-lg">
                <Clock className="text-yellow-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {pendingCount}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Awaiting payment
                </p>
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
              placeholder="Search by name, description, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[140px]"
          >
            {types.map((t) => (
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
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[110px]"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y === 'All' ? 'All Years' : y}
              </option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {filteredBonuses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-12 text-center">
            <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium text-gray-600">
              {bonuses.length === 0
                ? 'You have no bonuses yet'
                : 'No bonuses match your filters'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {bonuses.length === 0
                ? 'Bonuses assigned to you will appear here.'
                : 'Try adjusting search or filters.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredBonuses.length} of {bonuses.length} bonuses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBonuses.map((b) => {
                const cfg = typeConfig[b.type];
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBonus(b)}
                    className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 hover:shadow-md hover:border-amber-300/60 transition-all cursor-pointer group"
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          statusStyles[b.status]
                        }`}
                      >
                        {capitalize(b.status)}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          {b.month} {b.year}
                        </span>
                        <span className="text-lg font-bold text-amber-600">
                          TSh {num(b.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {b.description && (
                      <div className="mt-3 pt-3 border-t border-amber-100/30">
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {b.description}
                        </p>
                      </div>
                    )}

                    {b.payment_date && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                        <CheckCircle2 size={12} />
                        Paid on {formatDate(b.payment_date)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

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
                    typeConfig[selectedBonus.type]?.color || 'bg-gray-50'
                  }`}
                >
                  {typeConfig[selectedBonus.type]?.icon || (
                    <Gift size={24} />
                  )}
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
                onClick={() => setSelectedBonus(null)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
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
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Bonus Information
                  </p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Type:</span>{' '}
                      <span className="capitalize">
                        {selectedBonus.type}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Period:</span>{' '}
                      {selectedBonus.month} {selectedBonus.year}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Assigned:</span>{' '}
                      {formatDate(selectedBonus.created_at)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Payment
                  </p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Status:</span>{' '}
                      {capitalize(selectedBonus.status)}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">
                        Payment Date:
                      </span>{' '}
                      {formatDate(selectedBonus.payment_date)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">
                  Description
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {selectedBonus.description || '—'}
                </p>
              </div>

              {/* Type details */}
              <div
                className={`p-4 rounded-lg border ${
                  typeConfig[selectedBonus.type]?.bgColor ||
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="text-sm font-medium text-gray-500">
                  About this bonus
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {typeConfig[selectedBonus.type]?.label ||
                    'Special bonus for outstanding distributor performance.'}
                </p>
              </div>

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4">
                <button
                  onClick={() => setSelectedBonus(null)}
                  className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBonuses;