// src/pages/admin/Commissions.tsx
// Read-only view of the logged-in distributor's commissions.
// Data comes straight from the backend — no editing.

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  DollarSign,
  Users,
  TrendingUp,
  Calculator,
  FileText,
  Eye,
  User,
  Loader2,
  RefreshCw,
  AlertCircle,
  Store,
  X,
} from 'lucide-react';

import { commissionAPI } from '../../api/commissions';
import { distributorAPI } from '../../api/distributors';
import type { Commission as ApiCommission } from '../../types';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const BV_TO_TSH = 2500;

/* ------------------------------------------------------------------ */
/* UI view-model                                                       */
/* ------------------------------------------------------------------ */

interface Commission {
  id: number;
  distributor: string;
  distributorId: number;
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
  rawStatus: 'paid' | 'pending' | 'processing';
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

const monthName = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('en-US', { month: 'long' });
  } catch {
    return 'Unknown';
  }
};

const yearOf = (iso: string) => {
  try {
    return new Date(iso).getFullYear();
  } catch {
    return new Date().getFullYear();
  }
};

const normalizeList = <T,>(data: any): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.results)) return data.data.results;
  return [];
};

const todayISO = () => new Date().toISOString().split('T')[0];

/* ------------------------------------------------------------------ */
/* Rank + status colors                                                */
/* ------------------------------------------------------------------ */

const rankColors: Record<string, string> = {
  'Royal Crown Director': 'bg-amber-100 text-amber-700 border-amber-300',
  'Crown Director': 'bg-purple-100 text-purple-700 border-purple-300',
  Director: 'bg-blue-100 text-blue-700 border-blue-300',
  'Senior Manager': 'bg-green-100 text-green-700 border-green-300',
  Manager: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Executive: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'Senior Leader': 'bg-cyan-100 text-cyan-700 border-cyan-300',
  Leader: 'bg-sky-100 text-sky-700 border-sky-300',
  Builder: 'bg-orange-100 text-orange-700 border-orange-300',
  Associate: 'bg-gray-100 text-gray-600 border-gray-300',
};

const statusColors: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700 border-green-300',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Processing: 'bg-blue-100 text-blue-700 border-blue-300',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Commissions: React.FC = () => {
  /* ---------- Identity (from API, no useAuth) ---------- */
  const [myDistributorId, setMyDistributorId] = useState<number | null>(null);
  const [myProfile, setMyProfile] = useState<any | null>(null);
  const [identityChecked, setIdentityChecked] = useState(false);

  /* ---------- Data ---------- */
  const [allCommissions, setAllCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Filters ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');

  /* ---------- Modal ---------- */
  const [selectedCommission, setSelectedCommission] =
    useState<Commission | null>(null);

  /* ================================================================ */
  /* 1) Resolve the logged-in distributor via /distributors/me/...    */
  /* ================================================================ */

  const resolveMyDistributor = async (): Promise<number | null> => {
    try {
      const res: any = await distributorAPI.getMyHierarchy();
      const dist = res?.distributor ?? res?.data?.distributor ?? res?.data ?? res;
      const id = Number(dist?.id);
      if (Number.isFinite(id) && id > 0) {
        setMyProfile(dist);
        setMyDistributorId(id);
        return id;
      }
    } catch {
      // fall through
    }

    try {
      const list = await distributorAPI.getAll();
      const storedUser = localStorage.getItem('user');
      const u = storedUser ? JSON.parse(storedUser) : null;

      const myUserId = Number(u?.id);
      const myEmail = String(u?.email || '').toLowerCase();

      const match = list.find((d: any) => {
        const dUserId =
          d?.user?.id ??
          d?.user_id ??
          (typeof d?.user === 'number' ? d.user : null);
        const dEmail = String(d?.user?.email ?? d?.email ?? '').toLowerCase();

        if (Number.isFinite(myUserId) && Number(dUserId) === myUserId) return true;
        if (myEmail && dEmail === myEmail) return true;
        return false;
      });

      if (match?.id) {
        setMyProfile(match);
        setMyDistributorId(Number(match.id));
        return Number(match.id);
      }
    } catch {
      // ignore
    }

    return null;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const id = await resolveMyDistributor();
      if (!cancelled) {
        setMyDistributorId(id);
        setIdentityChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================ */
  /* 2) Fetch — read-only                                              */
  /* ================================================================ */

  const fetchCommissions = async () => {
    if (!myDistributorId) return;
    try {
      setLoading(true);
      setError(null);

      const data: any = await commissionAPI.getAll({
        distributor: myDistributorId,
      });
      const raw: ApiCommission[] = normalizeList<ApiCommission>(data);

      const mine = raw.filter((c: any) => {
        const cid =
          c?.distributor?.id ??
          c?.distributor_id ??
          (typeof c?.distributor === 'number' ? c.distributor : null);
        if (cid == null) return true;
        return Number(cid) === myDistributorId;
      });

      const transformed: Commission[] = mine.map((c: any) => ({
        id: c.id,
        distributorId:
          c?.distributor?.id ??
          c?.distributor_id ??
          Number(c.distributor) ??
          0,
        distributor:
          c.distributor_name ||
          myProfile?.user?.full_name ||
          myProfile?.full_name ||
          'You',
        rank: c.distributor_rank || myProfile?.rank || 'Associate',
        level: c.distributor_level ?? myProfile?.level ?? 1,
        pbv: num(c.pbv),
        percentage: num(c.percentage),
        amount: num(c.amount),
        type: capitalize(c.type) as 'Personal' | 'Differential',
        month: monthName(c.created_at),
        year: yearOf(c.created_at),
        source: c.source_distributor_name || undefined,
        status: capitalize(c.status) as 'Paid' | 'Pending' | 'Processing',
        paymentDate: c.payment_date || undefined,
        rawStatus: c.status,
      }));

      setAllCommissions(transformed);
    } catch (err: any) {
      console.error('Failed to load commissions:', err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load commissions.';
      setError(message);
      setAllCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!identityChecked) return;
    if (!myDistributorId) {
      setLoading(false);
      return;
    }
    fetchCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identityChecked, myDistributorId]);

  /* ================================================================ */
  /* Derived                                                           */
  /* ================================================================ */

  const months = useMemo(
    () => ['All', ...Array.from(new Set(allCommissions.map((c) => c.month)))],
    [allCommissions]
  );

  const filteredCommissions = useMemo(() => {
    return allCommissions.filter((c) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.distributor.toLowerCase().includes(q) ||
        c.rank.toLowerCase().includes(q);
      const matchesType = filterType === 'All' || c.type === filterType;
      const matchesStatus =
        filterStatus === 'All' || c.status === filterStatus;
      const matchesMonth = filterMonth === 'All' || c.month === filterMonth;
      return matchesSearch && matchesType && matchesStatus && matchesMonth;
    });
  }, [allCommissions, searchTerm, filterType, filterStatus, filterMonth]);

  const totalCommissions = allCommissions.reduce(
    (sum, c) => sum + c.amount,
    0
  );
  const totalPersonal = allCommissions
    .filter((c) => c.type === 'Personal')
    .reduce((sum, c) => sum + c.amount, 0);
  const totalDifferential = allCommissions
    .filter((c) => c.type === 'Differential')
    .reduce((sum, c) => sum + c.amount, 0);
  const pendingCommissions = allCommissions
    .filter((c) => c.status === 'Pending' || c.status === 'Processing')
    .reduce((sum, c) => sum + c.amount, 0);
  const paidCommissions = allCommissions
    .filter((c) => c.status === 'Paid')
    .reduce((sum, c) => sum + c.amount, 0);

  /* ================================================================ */
  /* CSV export                                                        */
  /* ================================================================ */

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Distributor',
      'Rank',
      'Level',
      'Type',
      'PBV',
      'Percentage',
      'Amount (TSh)',
      'Status',
      'Month',
      'Year',
      'Source',
      'Payment Date',
    ];
    const rows = filteredCommissions.map((c) => [
      c.id,
      c.distributor,
      c.rank,
      c.level,
      c.type,
      c.pbv,
      `${c.percentage}%`,
      c.amount,
      c.status,
      c.month,
      c.year,
      c.source || '',
      c.paymentDate || '',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-commissions-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================================================================ */
  /* Loading / error / no-identity                                     */
  /* ================================================================ */

  if (!identityChecked || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!myDistributorId) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <p className="font-medium">No distributor profile linked</p>
          </div>
          <p className="text-sm mt-1">
            Your account is not linked to a distributor record, so no
            commissions can be shown.
          </p>
          <button
            onClick={() => {
              setIdentityChecked(false);
              (async () => {
                const id = await resolveMyDistributor();
                setMyDistributorId(id);
                setIdentityChecked(true);
              })();
            }}
            className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <p className="font-medium">Failed to load commissions</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchCommissions}
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

  const myDisplayName =
    myProfile?.user?.full_name ||
    myProfile?.full_name ||
    myProfile?.user?.email ||
    'You';

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Commissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {myDisplayName} — your commission records
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCommissions}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredCommissions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Commissions</p>
              <h3 className="text-2xl font-bold text-amber-600">
                TSh {(totalCommissions / 1000).toFixed(1)}K
              </h3>
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
              <h3 className="text-2xl font-bold text-blue-600">
                TSh {(totalPersonal / 1000).toFixed(1)}K
              </h3>
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
              <h3 className="text-2xl font-bold text-purple-600">
                TSh {(totalDifferential / 1000).toFixed(1)}K
              </h3>
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
              <h3 className="text-2xl font-bold text-yellow-600">
                TSh {(pendingCommissions / 1000).toFixed(1)}K
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Paid: TSh {(paidCommissions / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="p-2.5 bg-yellow-50 rounded-lg">
              <TrendingUp className="text-yellow-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Formula info */}
      <div className="bg-gradient-to-r from-amber-50/80 to-amber-100/30 rounded-xl border border-amber-200/30 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Calculator className="text-amber-600" size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">
              Commission Formula
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Personal Bonus:</span> PBV × Bonus
              Percentage × 2,500
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Differential Bonus:</span> (Your %
              − Downline %) × Their PBV × 2,500
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Auto-generated by the backend • 1 BV ={' '}
              {BV_TO_TSH.toLocaleString()} TSh
            </p>
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
            placeholder="Search by distributor or rank..."
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
          <option value="All">All Types</option>
          <option value="Personal">Personal Bonus</option>
          <option value="Differential">Differential Bonus</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[150px]"
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Processing">Processing</option>
          <option value="Pending">Pending</option>
        </select>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[130px]"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        {allCommissions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">No commissions yet</p>
            <p className="text-sm">
              Your commissions will appear here once you have sales.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50/50 border-b border-amber-200/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Distributor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      PBV
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/30">
                  {filteredCommissions.map((commission) => (
                    <tr
                      key={commission.id}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => setSelectedCommission(commission)}
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {commission.distributor}
                        </p>
                        <p className="text-xs text-gray-400">
                          {commission.month} {commission.year}
                        </p>
                      </td>
                      <td
                        className="px-4 py-3 cursor-pointer"
                        onClick={() => setSelectedCommission(commission)}
                      >
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            rankColors[commission.rank] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {commission.rank}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Level {commission.level}
                        </p>
                      </td>
                      <td
                        className="px-4 py-3 hidden md:table-cell cursor-pointer"
                        onClick={() => setSelectedCommission(commission)}
                      >
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            commission.type === 'Personal'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {commission.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                        {commission.pbv || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-amber-600 hidden lg:table-cell">
                        {commission.percentage}%
                      </td>

                      {/* Status — READ ONLY */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                            statusColors[commission.status] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {commission.status}
                        </span>
                      </td>

                      <td
                        className="px-4 py-3 text-right cursor-pointer"
                        onClick={() => setSelectedCommission(commission)}
                      >
                        <p className="text-sm font-bold text-amber-600">
                          TSh {commission.amount.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedCommission(commission)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye
                            size={16}
                            className="text-gray-400 hover:text-amber-600"
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-amber-100/30 text-sm text-gray-500">
              Showing {filteredCommissions.length} of {allCommissions.length}{' '}
              commissions
            </div>
          </>
        )}
      </div>

      {/* Detail Modal — READ ONLY */}
      {selectedCommission && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCommission(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Commission Details
                </h3>
                <p className="text-sm text-amber-600">
                  {selectedCommission.distributor} •{' '}
                  {selectedCommission.month} {selectedCommission.year}
                </p>
              </div>
              <button
                onClick={() => setSelectedCommission(null)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Type</p>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      selectedCommission.type === 'Personal'
                        ? 'text-blue-600'
                        : 'text-purple-600'
                    }`}
                  >
                    {selectedCommission.type}
                  </p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">PBV</p>
                  <p className="text-lg font-bold text-blue-700">
                    {selectedCommission.pbv || '—'}
                  </p>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Percentage</p>
                  <p className="text-lg font-bold text-purple-700">
                    {selectedCommission.percentage}%
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-6 text-center border border-amber-200/30">
                <p className="text-sm text-gray-500">Commission Amount</p>
                <p className="text-3xl font-bold text-amber-600">
                  TSh {selectedCommission.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedCommission.pbv} BV ×{' '}
                  {selectedCommission.percentage}% ×{' '}
                  {BV_TO_TSH.toLocaleString()} TSh/BV
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
                      {selectedCommission.distributor}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Rank:</span>{' '}
                      {selectedCommission.rank}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Level:</span>{' '}
                      {selectedCommission.level}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Payment
                  </p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm flex items-center gap-2">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          statusColors[selectedCommission.status] ||
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {selectedCommission.status}
                      </span>
                    </p>
                    {selectedCommission.paymentDate && (
                      <p className="text-sm">
                        <span className="text-gray-500">
                          Payment Date:
                        </span>{' '}
                        {selectedCommission.paymentDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {selectedCommission.type === 'Differential' &&
                selectedCommission.source && (
                  <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-200/30">
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Store size={14} /> Source
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedCommission.source}
                    </p>
                  </div>
                )}

              <div className="border-t border-amber-100/30 pt-4">
                <button
                  onClick={() => setSelectedCommission(null)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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

export default Commissions;