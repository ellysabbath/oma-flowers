// src/pages/admin/Awards.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Trophy,
  Crown,
  Star,
  Award as AwardIcon,
  Sparkles,
  Calendar,
  Gem,
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';

import { awardAPI } from '../../api/awards';
import type { Award as ApiAward } from '../../types';

/* ------------------------------------------------------------------ */
/* UI view-model                                                       */
/* ------------------------------------------------------------------ */

interface Award {
  id: number;
  name: string;
  category: 'Legacy Circle' | 'Legacy' | 'Annual' | 'Special';
  winner: string;
  rank: string;
  date: string | null;
  prize: string;
  description: string;
  year: number;
  status: 'Active' | 'Past' | 'Upcoming';
  rawStatus: 'active' | 'past' | 'upcoming';
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const CATEGORY_MAP: Record<string, Award['category']> = {
  legacy_circle: 'Legacy Circle',
  legacy: 'Legacy',
  annual: 'Annual',
  special: 'Special',
};

/* ------------------------------------------------------------------ */
/* Configs                                                             */
/* ------------------------------------------------------------------ */

const categoryConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bgColor: string; borderColor: string }
> = {
  'Legacy Circle': {
    color: 'text-amber-600',
    icon: <Crown size={18} />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
  },
  Legacy: {
    color: 'text-amber-600',
    icon: <Crown size={18} />,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
  },
  Annual: {
    color: 'text-blue-600',
    icon: <Trophy size={18} />,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  Special: {
    color: 'text-purple-600',
    icon: <Star size={18} />,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
  },
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Past: 'bg-gray-100 text-gray-600',
  Upcoming: 'bg-yellow-100 text-yellow-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  Active: <Sparkles size={14} className="text-green-500" />,
  Past: <Calendar size={14} className="text-gray-500" />,
  Upcoming: <Calendar size={14} className="text-yellow-500" />,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Awards: React.FC = () => {
  /* ---------- Data ---------- */
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Filters ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  /* ---------- Modal ---------- */
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);

  /* ================================================================ */
  /* Fetch from /api/v1/awards/                                        */
  /* ================================================================ */

  const fetchAwards = async () => {
    try {
      setLoading(true);
      setError(null);

      const data: any = await awardAPI.getAll();
      const raw: ApiAward[] = normalizeList<ApiAward>(data);

      const transformed: Award[] = raw.map((a: any) => ({
        id: a.id,
        name: a.name,
        category:
          CATEGORY_MAP[a.category] || ('Annual' as Award['category']),
        winner: a.distributor_name || `#${a.distributor}`,
        rank: a.distributor_rank || 'Associate',
        date: a.given_date || null,
        prize: a.prize || '',
        description: a.description || '',
        year: a.year || new Date().getFullYear(),
        status: capitalize(a.status) as Award['status'],
        rawStatus: a.status,
      }));

      setAwards(transformed);
    } catch (err: any) {
      console.error('Failed to load awards:', err);
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to load awards.';
      setError(message);
      setAwards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  /* ================================================================ */
  /* Derived                                                           */
  /* ================================================================ */

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(awards.map((a) => a.category)))],
    [awards]
  );

  const statuses = useMemo(
    () => ['All', ...Array.from(new Set(awards.map((a) => a.status)))],
    [awards]
  );

  const filteredAwards = useMemo(() => {
    return awards.filter((a) => {
      const matchesSearch =
        a.winner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'All' || a.category === filterCategory;
      const matchesStatus =
        filterStatus === 'All' || a.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [awards, searchTerm, filterCategory, filterStatus]);

  const totalAwards = awards.length;
  const activeAwards = awards.filter((a) => a.status === 'Active').length;
  const pastAwards = awards.filter((a) => a.status === 'Past').length;
  const upcomingAwards = awards.filter((a) => a.status === 'Upcoming').length;
  const legacyAwards = awards.filter(
    (a) => a.category === 'Legacy Circle'
  ).length;

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
            <p className="font-medium">Failed to load awards</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchAwards}
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
          <h1 className="text-2xl font-bold text-gray-800">
            Awards & Recognition
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Celebrating excellence in the OMA Flowers community
          </p>
        </div>
        <button
          onClick={fetchAwards}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Awards</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {totalAwards}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <AwardIcon className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <h3 className="text-2xl font-bold text-green-600">
                {activeAwards}
              </h3>
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
              <h3 className="text-2xl font-bold text-gray-600">
                {pastAwards}
              </h3>
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
              <h3 className="text-2xl font-bold text-yellow-600">
                {upcomingAwards}
              </h3>
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
            <p className="text-amber-100 text-sm">
              "Success is celebrated, legacy is honored."
            </p>
            <p className="text-amber-200 text-xs mt-1">
              ★ {legacyAwards} Member{legacyAwards === 1 ? '' : 's'} in OMA
              Hall of Legends ★
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
            placeholder="Search by winner or award name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[150px]"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[130px]"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          onClick={fetchAwards}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Awards Grid */}
      {awards.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-12 text-center">
          <AwardIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium text-gray-600">No awards yet</p>
          <p className="text-sm text-gray-400">
            Awards appear here when the backend generates them for qualifying
            distributors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAwards.map((award) => {
            const config =
              categoryConfig[award.category] || categoryConfig['Annual'];
            return (
              <div
                key={award.id}
                className={`bg-white rounded-xl shadow-sm border ${config.borderColor} p-5 hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setSelectedAward(award)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${config.color} ${config.bgColor}`}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {award.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {award.category}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[award.status]
                    }`}
                  >
                    {award.status}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {award.winner}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      {award.rank}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-amber-600">
                      {award.prize}
                    </span>
                    <span className="text-xs text-gray-400">
                      {award.date || `${award.year}`}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-100/30">
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {award.description}
                  </p>
                </div>

                {award.category === 'Legacy Circle' && (
                  <div className="mt-2 flex items-center gap-1">
                    <Gem size={12} className="text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">
                      ★ Legacy Circle Member
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedAward && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAward(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    categoryConfig[selectedAward.category]?.color ||
                    'text-amber-600'
                  } bg-amber-50`}
                >
                  {categoryConfig[selectedAward.category]?.icon || (
                    <AwardIcon size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedAward.name}
                  </h3>
                  <p className="text-sm text-amber-600">
                    {selectedAward.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAward(null)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  selectedAward.status === 'Active'
                    ? 'bg-green-50'
                    : selectedAward.status === 'Past'
                    ? 'bg-gray-50'
                    : 'bg-yellow-50'
                }`}
              >
                {statusIcons[selectedAward.status]}
                <span className="text-sm font-medium">
                  {selectedAward.status === 'Active'
                    ? 'Award Active'
                    : selectedAward.status === 'Past'
                    ? 'Past Award'
                    : 'Upcoming Award'}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {selectedAward.date || selectedAward.year}
                </span>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-6 text-center border border-amber-200/30">
                <p className="text-sm text-gray-500">Prize</p>
                <p className="text-3xl font-bold text-amber-600">
                  {selectedAward.prize}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Winner</p>
                  <div className="mt-2">
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedAward.winner}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedAward.rank}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Award Information
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      Year: {selectedAward.year}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {selectedAward.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">
                  Description
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  {selectedAward.description}
                </p>
              </div>

              {selectedAward.category === 'Legacy Circle' && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200/50">
                  <div className="flex items-center gap-2">
                    <Gem size={20} className="text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-amber-700">
                        Legacy Circle Member
                      </p>
                      <p className="text-xs text-amber-600">
                        ★ Inducted into OMA Hall of Legends
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button
                  onClick={() => setSelectedAward(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
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