// src/pages/admin/Commissions.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
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
  Check,
  Clock,
  X,
} from 'lucide-react';

import { commissionAPI } from '../../api/commissions';
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
  orderNumber?: string;
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
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
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
  /* ---------- Data ---------- */
  const [allCommissions, setAllCommissions] = useState<Commission[]>([]);
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
  const [filterMonth, setFilterMonth] = useState('All');

  /* ---------- Modal ---------- */
  const [selectedCommission, setSelectedCommission] =
    useState<Commission | null>(null);

  /* ================================================================ */
  /* Fetch from /api/v1/commissions/                                   */
  /* ================================================================ */

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: any = await commissionAPI.getAll();
      const raw: ApiCommission[] = normalizeList<ApiCommission>(data);

      const transformed: Commission[] = raw.map((c: any) => ({
        id: c.id,
        distributorId: c.distributor,
        distributor: c.distributor_name || `#${c.distributor}`,
        rank: c.distributor_rank || 'Associate',
        level: c.distributor_level ?? 1,
        pbv: num(c.pbv),
        percentage: num(c.percentage),
        amount: num(c.amount),
        type: capitalize(c.type) as 'Personal' | 'Differential',
        month: monthName(c.created_at),
        year: yearOf(c.created_at),
        source: c.source_distributor_name
          ? `${c.source_distributor_name}${
              c.order_number ? ` — via order ${c.order_number}` : ''
            }`
          : c.order_number
          ? `Order ${c.order_number}`
          : undefined,
        orderNumber: c.order_number || undefined,
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
    fetchCommissions();
  }, []);

  /* ================================================================ */
  /* Update status — PATCH to backend                                  */
  /* ================================================================ */

  const handleStatusChange = async (
    commissionId: number,
    newStatus: 'paid' | 'pending' | 'processing'
  ) => {
    const paymentDate = newStatus === 'paid' ? todayISO() : null;

    // Optimistic UI
    setAllCommissions((prev) =>
      prev.map((c) =>
        c.id === commissionId
          ? {
              ...c,
              rawStatus: newStatus,
              status: capitalize(newStatus) as Commission['status'],
              isUpdating: true,
              paymentDate: paymentDate ?? c.paymentDate,
            }
          : c
      )
    );
    if (selectedCommission && selectedCommission.id === commissionId) {
      setSelectedCommission((prev) =>
        prev
          ? {
              ...prev,
              rawStatus: newStatus,
              status: capitalize(newStatus) as Commission['status'],
              paymentDate: paymentDate ?? prev.paymentDate,
            }
          : null
      );
    }

    try {
      await commissionAPI.updateStatus(commissionId, {
        status: newStatus,
        payment_date: paymentDate,
      });
      setBanner({
        type: 'success',
        text: `Commission #${commissionId} marked as ${newStatus}.`,
      });
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setBanner({
        type: 'error',
        text:
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          'Failed to update status.',
      });
      setTimeout(() => setBanner(null), 4000);
      await fetchCommissions(); // revert by refetch
    } finally {
      setAllCommissions((prev) =>
        prev.map((c) =>
          c.id === commissionId ? { ...c, isUpdating: false } : c
        )
      );
    }
  };

  /* ================================================================ */
  /* Derived                                                           */
  /* ================================================================ */

  const months = useMemo(
    () => ['All', ...Array.from(new Set(allCommissions.map((c) => c.month)))],
    [allCommissions]
  );

  const filteredCommissions = useMemo(() => {
    return allCommissions.filter((c) => {
      const matchesSearch =
        c.distributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rank.toLowerCase().includes(searchTerm.toLowerCase());
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
      'Order',
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
      c.orderNumber || '',
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
    a.download = `commissions-${todayISO()}.csv`;
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
          <h1 className="text-2xl font-bold text-gray-800">Commissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track distributor commissions and bonuses
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
              Commissions appear here automatically once distributors have
              sales in carts.
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
                      Actions
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

                      {/* Status — inline editable */}
                      <td className="px-4 py-3">
                        <div className="relative inline-block">
                          <select
                            value={commission.rawStatus}
                            disabled={commission.isUpdating}
                            onChange={(e) =>
                              handleStatusChange(
                                commission.id,
                                e.target.value as
                                  | 'paid'
                                  | 'pending'
                                  | 'processing'
                              )
                            }
                            className={`appearance-none pr-7 pl-3 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60 ${
                              statusColors[commission.status] ||
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="paid">Paid</option>
                          </select>
                          {commission.isUpdating ? (
                            <Loader2
                              size={12}
                              className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin pointer-events-none"
                            />
                          ) : (
                            <Clock
                              size={12}
                              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"
                            />
                          )}
                        </div>
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
                        <div className="flex items-center justify-end gap-1">
                          {commission.rawStatus !== 'paid' && (
                            <button
                              onClick={() =>
                                handleStatusChange(commission.id, 'paid')
                              }
                              disabled={commission.isUpdating}
                              className="p-1.5 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                              title="Mark as Paid"
                            >
                              <Check
                                size={16}
                                className="text-green-600"
                              />
                            </button>
                          )}
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
                        </div>
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

      {/* Detail Modal */}
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
                ✕
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
                    <p className="text-sm">
                      <span className="text-gray-500">Status:</span>{' '}
                      {selectedCommission.status}
                    </p>
                    {selectedCommission.paymentDate && (
                      <p className="text-sm">
                        <span className="text-gray-500">
                          Payment Date:
                        </span>{' '}
                        {selectedCommission.paymentDate}
                      </p>
                    )}
                    {selectedCommission.orderNumber && (
                      <p className="text-sm">
                        <span className="text-gray-500">Order:</span>{' '}
                        {selectedCommission.orderNumber}
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

              {/* Status buttons */}
              <div className="border-t border-amber-100/30 pt-4">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Change Status
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() =>
                      handleStatusChange(selectedCommission.id, 'pending')
                    }
                    disabled={selectedCommission.rawStatus === 'pending'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                      statusColors['Pending']
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        selectedCommission.id,
                        'processing'
                      )
                    }
                    disabled={selectedCommission.rawStatus === 'processing'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
                      statusColors['Processing']
                    }`}
                  >
                    Processing
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(selectedCommission.id, 'paid')
                    }
                    disabled={selectedCommission.rawStatus === 'paid'}
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
                  onClick={() => setSelectedCommission(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
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