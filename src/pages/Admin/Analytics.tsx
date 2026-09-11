// src/pages/admin/Analytics.tsx — Mauzo (Sales) focused
import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Award,
  Store,
  Package,
  Download,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  ShoppingCart,
  Gift,
  Loader2,
  RefreshCw,
  AlertCircle,
  Crown,
  CheckCircle2,
  Clock,
  Receipt,
  CheckCircle,
} from 'lucide-react';

import { distributorAPI } from '../../api/distributors';
import { shopAPI } from '../../api/shops';
import { commissionAPI } from '../../api/commissions';
import { bonusAPI } from '../../api/bonuses';
import { cartAPI } from '../../api/cart';
import { productAPI } from '../../api/products';

import type {
  Distributor,
  Shop,
  Commission,
  Bonus,
  Product,
} from '../../types';

/* ------------------------------------------------------------------ */
/* Local types                                                         */
/* ------------------------------------------------------------------ */

interface Kpis {
  totalRevenue: number;
  totalCommissions: number;
  totalBonuses: number;
  totalDistributors: number;
  activeDistributors: number;
  totalShops: number;
  totalCarts: number;
  convertedCarts: number;
  totalProducts: number;
  totalBV: number;
  totalOwnerBv: number;
  totalPBV: number;
  totalItemsSold: number;
}

interface MonthlyPoint {
  month: string;
  revenue: number;
  commissions: number;
  bonuses: number;
  sales: number; // 👈 was "carts" — now shows converted sales only
}

interface RankBucket {
  rank: string;
  count: number;
  percentage: number;
  color: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

const formatTSh = (n: number) => {
  if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `TSh ${(n / 1_000).toFixed(1)}K`;
  return `TSh ${n.toLocaleString()}`;
};

const monthKey = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short' });
  } catch {
    return '';
  }
};

/* 👇 SAME as Orders.tsx — PBV calc */
const calcPBV = (
  bv: number,
  bonusPercentage: number | null | undefined
): number => {
  const pct = num(bonusPercentage);
  if (!pct || pct <= 0) return bv;
  return Math.round(bv * (pct / 100));
};

const RANK_COLORS: Record<string, string> = {
  'Royal Crown Director': '#f59e0b',
  'Crown Director': '#a855f7',
  Director: '#3b82f6',
  'Senior Manager': '#22c55e',
  Manager: '#10b981',
  Executive: '#6366f1',
  'Senior Leader': '#06b6d4',
  Leader: '#0ea5e9',
  Builder: '#f97316',
  Associate: '#6b7280',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Analytics: React.FC = () => {
  /* ---------- State ---------- */
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [carts, setCarts] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeRange, setTimeRange] = useState('7M');
  const [selectedMetric, setSelectedMetric] = useState<
    'revenue' | 'commissions' | 'bonuses' | 'sales'
  >('revenue');

  /* ---------- Load everything in parallel ---------- */
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, s, c, b, ca, p] = await Promise.all([
        distributorAPI.getAll().catch(() => []),
        shopAPI.getAll().catch(() => []),
        commissionAPI.getAll().catch(() => []),
        bonusAPI.getAll().catch(() => []),
        cartAPI.getAll().catch(() => []),
        productAPI.getAll().catch(() => []),
      ]);

      setDistributors(normalizeList<Distributor>(d));
      setShops(normalizeList<Shop>(s));
      setCommissions(normalizeList<Commission>(c));
      setBonuses(normalizeList<Bonus>(b));
      setCarts(normalizeList<any>(ca));
      setProducts(normalizeList<Product>(p));
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load analytics.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* ================================================================ */
  /* ✅ CONVERTED CARTS ONLY (MAUZO) — same as Orders.tsx             */
  /* ================================================================ */
  const convertedCarts = useMemo(
    () =>
      carts.filter(
        (c) => String(c.status).toLowerCase() === 'converted'
      ),
    [carts]
  );

  /* ================================================================ */
  /* Per-seller aggregation — built like Orders.tsx                   */
  /* Groups by item.seller_id, computes BV / PBV / amount / items     */
  /* ================================================================ */
  const sellerAggregates = useMemo(() => {
    type Agg = {
      sellerId: number | null;
      sellerName: string;
      sellerRank: string | null;
      sellerBonusPercentage: number | null;
      totalBV: number;
      totalPBV: number;
      totalAmount: number;
      itemsCount: number;
      salesSet: Set<number>;
    };

    const map = new Map<string, Agg>();

    for (const cart of convertedCarts) {
      const items = cart.items || [];
      const sellerBonus =
        (cart as any)?.distributor_bonus_percentage ?? null;

      for (const item of items) {
        const sid = (item as any).seller_id ?? null;
        const sname = (item as any).seller_name ?? null;
        const srank = (item as any).seller_rank ?? null;

        const key = sid != null ? `id-${sid}` : 'unassigned';

        if (!map.has(key)) {
          map.set(key, {
            sellerId: sid,
            sellerName: sname || 'Unassigned Seller',
            sellerRank: srank,
            sellerBonusPercentage: sellerBonus,
            totalBV: 0,
            totalPBV: 0,
            totalAmount: 0,
            itemsCount: 0,
            salesSet: new Set<number>(),
          });
        }

        const agg = map.get(key)!;
        const qty = num(item.quantity);
        const bv = num(item.bv);
        const amount = num(item.subtotal ?? num(item.price) * qty);

        const itemBV = bv * qty;
        const itemPBV = calcPBV(itemBV, sellerBonus);

        agg.totalBV += itemBV;
        agg.totalPBV += itemPBV;
        agg.totalAmount += amount;
        agg.itemsCount += qty;
        agg.salesSet.add(cart.id);
      }
    }

    // Merge with distributor records (prefer distributor name/rank)
    const distributorById = new Map<number, Distributor>();
    distributors.forEach((d) => distributorById.set(d.id, d));

    return Array.from(map.values()).map((agg) => {
      const dist =
        agg.sellerId != null
          ? distributorById.get(agg.sellerId)
          : undefined;

      return {
        sellerId: agg.sellerId,
        name:
          dist?.full_name ||
          dist?.user?.full_name ||
          agg.sellerName ||
          'Unassigned Seller',
        rank: dist?.rank || agg.sellerRank || 'Associate',
        salesCount: agg.salesSet.size,
        bvSold: agg.totalBV,
        pbvSold: agg.totalPBV,
        amount: agg.totalAmount,
        itemsSold: agg.itemsCount,
      };
    });
  }, [convertedCarts, distributors]);

  /* ================================================================ */
  /* Derived KPIs                                                      */
  /* ================================================================ */

  const kpis: Kpis = useMemo(() => {
    const totalRevenue = convertedCarts.reduce(
      (s, c) => s + num(c.subtotal),
      0
    );

    const totalCommissions = commissions.reduce(
      (s, c) => s + num(c.amount),
      0
    );
    const totalBonuses = bonuses.reduce((s, b) => s + num(b.amount), 0);

    const activeDistributors = distributors.filter(
      (d) => d.user?.status === 'active'
    ).length;

    const totalOwnerBv = shops.reduce(
      (s, sh: any) => s + num(sh.owner_bv),
      0
    );

    const totalBV = convertedCarts.reduce(
      (s, c) => s + num(c.total_bv),
      0
    );

    const totalPBV = sellerAggregates.reduce(
      (s, x) => s + x.pbvSold,
      0
    );
    const totalItemsSold = sellerAggregates.reduce(
      (s, x) => s + x.itemsSold,
      0
    );

    return {
      totalRevenue,
      totalCommissions,
      totalBonuses,
      totalDistributors: distributors.length,
      activeDistributors,
      totalShops: shops.length,
      totalCarts: carts.length,
      convertedCarts: convertedCarts.length,
      totalProducts: products.length,
      totalBV,
      totalOwnerBv,
      totalPBV,
      totalItemsSold,
    };
  }, [
    distributors,
    shops,
    commissions,
    bonuses,
    carts,
    convertedCarts,
    products,
    sellerAggregates,
  ]);

  /* ================================================================ */
  /* Monthly series — SALES (converted carts only)                    */
  /* ================================================================ */

  const monthlyData: MonthlyPoint[] = useMemo(() => {
    const buckets = new Map<
      string,
      {
        revenue: number;
        commissions: number;
        bonuses: number;
        sales: number;
        order: number;
      }
    >();

    // ✅ Bucket converted carts as SALES
    for (const c of convertedCarts) {
      const key = monthKey(c.created_at);
      if (!key) continue;
      const monthIdx = new Date(c.created_at).getMonth();
      if (!buckets.has(key)) {
        buckets.set(key, {
          revenue: 0,
          commissions: 0,
          bonuses: 0,
          sales: 0,
          order: monthIdx,
        });
      }
      const bucket = buckets.get(key)!;
      bucket.revenue += num(c.subtotal);
      bucket.sales += 1;
    }

    // Bucket commissions by month
    for (const cm of commissions) {
      const key = monthKey(cm.created_at);
      if (!key) continue;
      const monthIdx = new Date(cm.created_at).getMonth();
      if (!buckets.has(key)) {
        buckets.set(key, {
          revenue: 0,
          commissions: 0,
          bonuses: 0,
          sales: 0,
          order: monthIdx,
        });
      }
      buckets.get(key)!.commissions += num(cm.amount);
    }

    // Bucket bonuses by month
    for (const b of bonuses) {
      const key = monthKey(b.created_at);
      if (!key) continue;
      const monthIdx = new Date(b.created_at).getMonth();
      if (!buckets.has(key)) {
        buckets.set(key, {
          revenue: 0,
          commissions: 0,
          bonuses: 0,
          sales: 0,
          order: monthIdx,
        });
      }
      buckets.get(key)!.bonuses += num(b.amount);
    }

    const arr = Array.from(buckets.entries())
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.order - b.order);

    return arr;
  }, [convertedCarts, commissions, bonuses]);

  /* ================================================================ */
  /* Top Performers — from item-level seller_id (like Orders.tsx)     */
  /* ================================================================ */

  const topPerformers = useMemo(() => {
    return sellerAggregates
      .filter((s) => s.sellerId != null && s.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
      .map((s) => ({
        name: s.name,
        rank: s.rank,
        value: s.amount,
        pbv: s.pbvSold,
        sales: s.salesCount,
      }));
  }, [sellerAggregates]);

  /* ================================================================ */
  /* Rank distribution                                                 */
  /* ================================================================ */

  const rankDistribution: RankBucket[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of distributors) {
      const r = d.rank || 'Associate';
      counts.set(r, (counts.get(r) || 0) + 1);
    }
    const total = distributors.length || 1;
    return Array.from(counts.entries())
      .map(([rank, count]) => ({
        rank,
        count,
        percentage: Math.round((count / total) * 100),
        color: RANK_COLORS[rank] || '#6b7280',
      }))
      .sort((a, b) => b.count - a.count);
  }, [distributors]);

  /* ================================================================ */
  /* Status breakdown                                                  */
  /* ================================================================ */

  const statusBreakdown = useMemo(() => {
    const paid = commissions.filter((c) => c.status === 'paid').length;
    const pending = commissions.filter((c) => c.status === 'pending').length;
    const processing = commissions.filter(
      (c) => c.status === 'processing'
    ).length;
    return { paid, pending, processing, total: commissions.length || 1 };
  }, [commissions]);

  /* ================================================================ */
  /* Chart data for selected metric                                    */
  /* ================================================================ */

  const chartValues = monthlyData.map((m) => ({
    label: m.month,
    value: m[selectedMetric] as number,
  }));

  const maxChartValue = Math.max(1, ...chartValues.map((v) => v.value));

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
            <p className="font-medium">Failed to load analytics</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadAll}
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
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-amber-500" size={26} />
            Analytics — Mauzo (Sales)
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <CheckCircle size={14} className="text-green-500" />
            All figures based on <strong>converted carts</strong> (actual sales)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-sm"
          >
            <option value="7M">Last 7 Months</option>
            <option value="12M">Last 12 Months</option>
            <option value="YTD">Year to Date</option>
          </select>
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* HERO STRIP — headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<DollarSign size={22} />}
          label="Total Sales Revenue"
          value={formatTSh(kpis.totalRevenue)}
          sub={`${kpis.convertedCarts} sale${kpis.convertedCarts === 1 ? '' : 's'}`}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          valueColor="text-amber-600"
        />
        <KpiCard
          icon={<Users size={22} />}
          label="Distributors"
          value={String(kpis.totalDistributors)}
          sub={`${kpis.activeDistributors} active`}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          valueColor="text-blue-600"
        />
        <KpiCard
          icon={<Package size={22} />}
          label="Total BV Sold"
          value={kpis.totalBV.toLocaleString()}
          sub={`${kpis.totalItemsSold} items sold`}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          valueColor="text-purple-600"
        />
        <KpiCard
          icon={<Award size={22} />}
          label="Total PBV"
          value={kpis.totalPBV.toLocaleString()}
          sub={`${kpis.totalOwnerBv.toLocaleString()} owner BV`}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          valueColor="text-rose-600"
        />
      </div>

      {/* MONEY STRIP — commissions & bonuses */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<BarChart3 size={22} />}
          label="Total Commissions"
          value={formatTSh(kpis.totalCommissions)}
          sub={`${commissions.length} records`}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-500"
          valueColor="text-indigo-600"
        />
        <KpiCard
          icon={<Gift size={22} />}
          label="Total Bonuses"
          value={formatTSh(kpis.totalBonuses)}
          sub={`${bonuses.length} records`}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          valueColor="text-rose-600"
        />
        <KpiCard
          icon={<Receipt size={22} />}
          label="Sales Recorded"
          value={String(kpis.convertedCarts)}
          sub={`of ${kpis.totalCarts} total carts`}
          iconBg="bg-sky-50"
          iconColor="text-sky-500"
          valueColor="text-sky-600"
        />
        <KpiCard
          icon={<Activity size={22} />}
          label="Active Rate"
          value={`${
            kpis.totalDistributors > 0
              ? Math.round(
                  (kpis.activeDistributors / kpis.totalDistributors) * 100
                )
              : 0
          }%`}
          sub="of distributors"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          valueColor="text-emerald-600"
        />
      </div>

      {/* MAIN CHART — monthly performance */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="font-semibold text-gray-800">
              Monthly Sales Performance
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {monthlyData.length} month
              {monthlyData.length === 1 ? '' : 's'} of sales activity
            </p>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(
              [
                ['revenue', 'Revenue'],
                ['commissions', 'Commissions'],
                ['bonuses', 'Bonuses'],
                ['sales', 'Sales'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedMetric === key
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        {chartValues.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            <BarChart3 size={32} className="mr-2 text-gray-300" />
            No sales data yet
          </div>
        ) : (
          <div className="h-64 flex items-end gap-3 overflow-x-auto pb-2">
            {chartValues.map((point, i) => {
              const pct = (point.value / maxChartValue) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 min-w-[40px] group"
                >
                  <div className="relative w-full flex justify-center">
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-gray-700 whitespace-nowrap bg-white px-2 py-1 rounded shadow">
                      {selectedMetric === 'sales'
                        ? `${point.value} sale${point.value === 1 ? '' : 's'}`
                        : formatTSh(point.value)}
                    </div>
                    <div
                      className="w-full max-w-[46px] rounded-t-lg bg-gradient-to-t from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all duration-300"
                      style={{ height: `${Math.max(pct, 4) * 2}px` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-amber-100/30">
          <MiniStat
            label="Peak Month"
            value={
              chartValues.length > 0
                ? chartValues.reduce((a, b) =>
                    a.value >= b.value ? a : b
                  ).label
                : '—'
            }
          />
          <MiniStat
            label="Avg / Month"
            value={formatTSh(
              chartValues.length > 0
                ? chartValues.reduce((s, v) => s + v.value, 0) /
                    chartValues.length
                : 0
            )}
          />
          <MiniStat
            label="Total Months"
            value={String(chartValues.length)}
          />
          <MiniStat
            label="All Commissions"
            value={String(commissions.length)}
          />
        </div>
      </div>

      {/* TWO COLUMN — top performers + rank donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top performers — by item-level seller */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">
                Top Sellers (Mauzo)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                By item-level seller_id from converted carts
              </p>
            </div>
            <Award className="text-amber-500" size={18} />
          </div>

          {topPerformers.length === 0 ? (
            <EmptyState
              icon={<Award size={24} />}
              text="No sales recorded yet"
            />
          ) : (
            <div className="space-y-3">
              {topPerformers.map((p, i) => {
                const maxValue = topPerformers[0].value || 1;
                const pct = (p.value / maxValue) * 100;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                        i === 0
                          ? 'bg-amber-500'
                          : i === 1
                          ? 'bg-gray-400'
                          : i === 2
                          ? 'bg-amber-700'
                          : 'bg-amber-300'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-700 truncate">
                          {p.name}
                        </p>
                        <p className="text-sm font-bold text-amber-600 shrink-0">
                          {formatTSh(p.value)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                          {p.rank}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                          {p.sales} sale{p.sales === 1 ? '' : 's'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                          PBV: {p.pbv.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-amber-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rank distribution (donut) */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Rank Distribution</h3>
            <PieIcon className="text-amber-500" size={18} />
          </div>

          {rankDistribution.length === 0 ? (
            <EmptyState
              icon={<Crown size={24} />}
              text="No distributors yet"
            />
          ) : (
            <div className="flex items-center gap-6 flex-wrap">
              {/* Donut */}
              <div className="relative w-40 h-40 shrink-0 mx-auto">
                <DonutChart buckets={rankDistribution} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">
                    {distributors.length}
                  </span>
                  <span className="text-xs text-gray-400">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 min-w-[180px] space-y-2">
                {rankDistribution.map((r) => (
                  <div
                    key={r.rank}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="flex-1 text-gray-600 truncate">
                      {r.rank}
                    </span>
                    <span className="font-bold text-gray-800">{r.count}</span>
                    <span className="text-gray-400 w-10 text-right">
                      {r.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATUS BREAKDOWN */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          Commission Status Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            label="Paid"
            count={statusBreakdown.paid}
            total={statusBreakdown.total}
            icon={<CheckCircle2 size={18} />}
            color="green"
          />
          <StatusCard
            label="Pending"
            count={statusBreakdown.pending}
            total={statusBreakdown.total}
            icon={<Clock size={18} />}
            color="yellow"
          />
          <StatusCard
            label="Processing"
            count={statusBreakdown.processing}
            total={statusBreakdown.total}
            icon={<Loader2 size={18} />}
            color="blue"
          />
        </div>
      </div>

      {/* BUSINESS INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard
          icon={<TrendingUp size={18} />}
          iconColor="text-amber-600"
          title="Mauzo (Sales)"
          text={
            kpis.convertedCarts > 0
              ? `${kpis.convertedCarts} sale${
                  kpis.convertedCarts === 1 ? '' : 's'
                } worth ${formatTSh(kpis.totalRevenue)} — ${kpis.totalItemsSold} items sold, ${kpis.totalPBV.toLocaleString()} PBV.`
              : 'No sales recorded yet. Convert carts to start tracking revenue.'
          }
          bg="from-amber-50 to-amber-100/30"
          border="border-amber-200/30"
        />
        <InsightCard
          icon={<Users size={18} />}
          iconColor="text-blue-600"
          title="Network"
          text={`${kpis.activeDistributors} of ${kpis.totalDistributors} distributors are active. ${
            distributors.length > 0
              ? Math.round(
                  (kpis.activeDistributors / kpis.totalDistributors) * 100
                )
              : 0
          }% active rate.`}
          bg="from-blue-50 to-blue-100/30"
          border="border-blue-200/30"
        />
        <InsightCard
          icon={<Store size={18} />}
          iconColor="text-green-600"
          title="Shops"
          text={`${kpis.totalShops} shops across the network with ${kpis.totalOwnerBv.toLocaleString()} total owner BV.`}
          bg="from-green-50 to-green-100/30"
          border="border-green-200/30"
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  iconBg: string;
  iconColor: string;
  valueColor: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
  valueColor,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
          {label}
        </p>
        <h3 className={`text-2xl font-bold ${valueColor} mt-1 truncate`}>
          {value}
        </h3>
        <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>
      </div>
      <div className={`p-2.5 ${iconBg} rounded-lg shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
    </div>
  </div>
);

const MiniStat: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
  </div>
);

const EmptyState: React.FC<{ icon: React.ReactNode; text: string }> = ({
  icon,
  text,
}) => (
  <div className="flex flex-col items-center justify-center py-8 text-gray-300">
    {icon}
    <p className="text-sm text-gray-400 mt-2">{text}</p>
  </div>
);

const DonutChart: React.FC<{ buckets: RankBucket[] }> = ({ buckets }) => {
  const total = buckets.reduce((s, b) => s + b.count, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg viewBox="0 0 160 160" className="w-40 h-40 -rotate-90">
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth="20"
      />
      {buckets.map((b, i) => {
        const fraction = b.count / total;
        const dash = fraction * circumference;
        const el = (
          <circle
            key={i}
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={b.color}
            strokeWidth="20"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
};

interface StatusCardProps {
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  color: 'green' | 'yellow' | 'blue';
}

const StatusCard: React.FC<StatusCardProps> = ({
  label,
  count,
  total,
  icon,
  color,
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors = {
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      bar: 'bg-green-500',
      border: 'border-green-200',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      bar: 'bg-yellow-500',
      border: 'border-yellow-200',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      bar: 'bg-blue-500',
      border: 'border-blue-200',
    },
  }[color];

  return (
    <div
      className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-white/60 ${colors.text}`}>
          {icon}
        </div>
        <span className={`text-2xl font-bold ${colors.text}`}>{count}</span>
      </div>
      <p className="text-sm font-medium text-gray-700 mt-3">{label}</p>
      <div className="mt-2 w-full bg-white/60 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{pct}% of total</p>
    </div>
  );
};

interface InsightCardProps {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  text: string;
  bg: string;
  border: string;
}

const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  iconColor,
  title,
  text,
  bg,
  border,
}) => (
  <div className={`bg-gradient-to-br ${bg} rounded-xl p-4 border ${border}`}>
    <div className="flex items-center gap-2">
      <span className={iconColor}>{icon}</span>
      <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
    </div>
    <p className="text-sm text-gray-600 mt-2">{text}</p>
  </div>
);

export default Analytics;