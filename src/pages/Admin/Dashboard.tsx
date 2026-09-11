// src/pages/admin/Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  DollarSign,
  Award,
  Store,
  Gift,
  ShoppingCart,
  Package,
  Crown,
  Wallet,
  PiggyBank,
  Receipt,
  Building2,
  UserCircle2,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  BarChart3,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react';

import { distributorAPI } from '../../api/distributors';
import { shopAPI } from '../../api/shops';
import { commissionAPI } from '../../api/commissions';
import { bonusAPI } from '../../api/bonuses';
import { awardAPI } from '../../api/awards';
import { cartAPI } from '../../api/cart';
import { useAuth } from '../../hooks/useAuth';

import type {
  Distributor,
  Shop,
  Commission,
  Bonus,
  Award as AwardType,
} from '../../types';

/* ================================================================== */
/* ROBUST LIST EXTRACTOR                                              */
/* ================================================================== */
const extractList = <T,>(input: any): T[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.results)) return input.results;
  if (Array.isArray(input.data)) return input.data;
  if (input.data && Array.isArray(input.data.results))
    return input.data.results;
  return [];
};

/* ================================================================== */
/* HELPERS                                                            */
/* ================================================================== */
const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtTSh = (n: number): string =>
  `TSh ${Math.round(n).toLocaleString('en-US')}`;

const fmtTShPrecise = (n: number): string =>
  `TSh ${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtBV = (n: number): string =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

/* 👇 SAME as Orders.tsx — PBV calc */
const calcPBV = (
  bv: number,
  bonusPercentage: number | null | undefined
): number => {
  const pct = num(bonusPercentage);
  if (!pct || pct <= 0) return bv;
  return Math.round(bv * (pct / 100));
};

const performanceLevelColors: Record<string, string> = {
  'Gold Crown': 'bg-amber-100 text-amber-700',
  Crown: 'bg-purple-100 text-purple-700',
  Diamond: 'bg-blue-100 text-blue-700',
  Emerald: 'bg-emerald-100 text-emerald-700',
  Garden: 'bg-green-100 text-green-700',
  Bloom: 'bg-rose-100 text-rose-700',
  Seed: 'bg-gray-100 text-gray-600',
};

const rankColors: Record<string, string> = {
  'Royal Crown Director': 'bg-amber-100 text-amber-700',
  'Crown Director': 'bg-purple-100 text-purple-700',
  Director: 'bg-blue-100 text-blue-700',
  'Senior Manager': 'bg-green-100 text-green-700',
  Manager: 'bg-emerald-100 text-emerald-700',
  Executive: 'bg-indigo-100 text-indigo-700',
  'Senior Leader': 'bg-cyan-100 text-cyan-700',
  Leader: 'bg-sky-100 text-sky-700',
  Builder: 'bg-orange-100 text-orange-700',
  Associate: 'bg-gray-100 text-gray-600',
};

/* ================================================================== */
/* COMPONENT                                                          */
/* ================================================================== */
const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [carts, setCarts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Load everything in parallel ---------- */
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, s, c, cm, b, a] = await Promise.all([
        distributorAPI.getAll().catch((e) => {
          console.error('distributors failed:', e);
          return [];
        }),
        shopAPI.getAll().catch((e) => {
          console.error('shops failed:', e);
          return [];
        }),
        cartAPI.getAll().catch((e) => {
          console.error('carts failed:', e);
          return [];
        }),
        commissionAPI.getAll().catch((e) => {
          console.error('commissions failed:', e);
          return [];
        }),
        bonusAPI.getAll().catch((e) => {
          console.error('bonuses failed:', e);
          return [];
        }),
        awardAPI.getAll().catch((e) => {
          console.error('awards failed:', e);
          return [];
        }),
      ]);

      setDistributors(extractList<Distributor>(d));
      setShops(extractList<Shop>(s));
      setCarts(extractList<any>(c));
      setCommissions(extractList<Commission>(cm));
      setBonuses(extractList<Bonus>(b));
      setAwards(extractList<AwardType>(a));
    } catch (e: any) {
      console.error('Dashboard load failed:', e);
      setError(e?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  /* PER-SELLER REVENUE — built EXACTLY like Orders.tsx seller map    */
  /*                                                                  */
  /* A "seller" comes from item.seller_id / seller_name / seller_rank */
  /* PBV = calcPBV(bv × qty, cart.distributor_bonus_percentage)        */
  /* ================================================================ */
  const sellerRevenue = useMemo(() => {
    // sellerMap key: "id-<sellerId>" or "unassigned"
    type SellerAgg = {
      sellerId: number | null;
      sellerName: string;
      sellerRank: string | null;
      sellerBonusPercentage: number | null;
      totalBV: number;
      totalPBV: number;
      totalAmount: number;
      itemsCount: number;
      cartsSet: Set<number>;
    };

    const sellerMap = new Map<string, SellerAgg>();

    for (const cart of convertedCarts) {
      const items = cart.items || [];
      const sellerBonus =
        (cart as any)?.distributor_bonus_percentage ?? null;

      for (const item of items) {
        const sid = (item as any).seller_id ?? null;
        const sname = (item as any).seller_name ?? null;
        const srank = (item as any).seller_rank ?? null;

        const key = sid != null ? `id-${sid}` : 'unassigned';

        if (!sellerMap.has(key)) {
          sellerMap.set(key, {
            sellerId: sid,
            sellerName: sname || 'Unassigned Seller',
            sellerRank: srank,
            sellerBonusPercentage: sellerBonus,
            totalBV: 0,
            totalPBV: 0,
            totalAmount: 0,
            itemsCount: 0,
            cartsSet: new Set<number>(),
          });
        }

        const entry = sellerMap.get(key)!;
        const qty = num(item.quantity);
        const bv = num(item.bv);
        const amount = num(item.subtotal ?? num(item.price) * qty);

        const itemBV = bv * qty;
        const itemPBV = calcPBV(itemBV, sellerBonus);

        entry.totalBV += itemBV;
        entry.totalPBV += itemPBV;
        entry.totalAmount += amount;
        entry.itemsCount += qty;
        entry.cartsSet.add(cart.id);
      }
    }

    // Build rows for every known distributor + any seller not in distributors list
    const distributorById = new Map<number, Distributor>();
    distributors.forEach((d) => distributorById.set(d.id, d));

    const rows = Array.from(sellerMap.entries()).map(([key, agg]) => {
      const dist =
        agg.sellerId != null ? distributorById.get(agg.sellerId) : undefined;

      // Prefer distributor record fields; fall back to what item told us
      const name =
        dist?.full_name ||
        dist?.user?.full_name ||
        agg.sellerName ||
        'Unassigned Seller';

      const rank = dist?.rank || agg.sellerRank || 'Associate';
      const level = dist?.level ?? 1;
      const pbv = num((dist as any)?.pbv);
      const cgv = num((dist as any)?.cgv);
      const bonusPct = num((dist as any)?.bonus_percentage);

      return {
        id: agg.sellerId ?? key,
        sellerKey: key,
        name,
        rank,
        level,
        pbv,
        cgv,
        bonusPct,
        revenue: agg.totalAmount,
        carts: agg.cartsSet.size,
        bvSold: agg.totalBV,
        pbvSold: agg.totalPBV,
        itemsSold: agg.itemsCount,
      };
    });

    // Also include distributors with zero sales (so nothing is hidden)
    for (const d of distributors) {
      const key = `id-${d.id}`;
      if (!sellerMap.has(key)) {
        rows.push({
          id: d.id,
          sellerKey: key,
          name: d.full_name || d.user?.full_name || `#${d.id}`,
          rank: d.rank || 'Associate',
          level: d.level ?? 1,
          pbv: num((d as any).pbv),
          cgv: num((d as any).cgv),
          bonusPct: num((d as any).bonus_percentage),
          revenue: 0,
          carts: 0,
          bvSold: 0,
          pbvSold: 0,
          itemsSold: 0,
        });
      }
    }

    rows.sort((a, b) => b.revenue - a.revenue);

    const total = rows.reduce((sum, r) => sum + r.revenue, 0);
    const totalBV = rows.reduce((sum, r) => sum + r.bvSold, 0);
    const totalPBV = rows.reduce((sum, r) => sum + r.pbvSold, 0);
    const max = rows[0]?.revenue || 1;
    const withSales = rows.filter((r) => r.revenue > 0);

    const enriched = rows.map((r) => ({
      ...r,
      share: total > 0 ? (r.revenue / total) * 100 : 0,
    }));

    return {
      all: enriched,
      withSales,
      total,
      totalBV,
      totalPBV,
      max,
      activeCount: withSales.length,
    };
  }, [convertedCarts, distributors]);

  /* ================================================================ */
  /* PER-SHOP REVENUE — only converted carts                          */
  /* ================================================================ */
  const shopRevenue = useMemo(() => {
    const cartCountByShop = new Map<number, number>();
    const cartRevenueByShop = new Map<number, number>();

    for (const c of convertedCarts) {
      const id = c.shop?.id ?? c.shop_id;
      if (!id) continue;
      cartCountByShop.set(id, (cartCountByShop.get(id) || 0) + 1);
      cartRevenueByShop.set(
        id,
        (cartRevenueByShop.get(id) || 0) + num(c.subtotal)
      );
    }

    const rows = shops
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        owner: s.distributor_name || 'Unassigned',
        ownerBv: num(s.owner_bv),
        revenue: cartRevenueByShop.get(s.id) || 0,
        monthlyRevenue: num(s.monthly_revenue),
        carts: cartCountByShop.get(s.id) || 0,
        performanceLevel: s.performance_level,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    const total = rows.reduce((sum, r) => sum + r.revenue, 0);
    const max = rows[0]?.revenue || 1;

    return { rows, total, max };
  }, [convertedCarts, shops]);

  /* ================================================================ */
  /* KPIs                                                             */
  /* ================================================================ */
  const stats = useMemo(() => {
    const cartRevenue = convertedCarts.reduce(
      (sum, c) => sum + num(c.subtotal),
      0
    );

    const shopMonthlyRevenueTotal = shops.reduce(
      (sum, s: any) => sum + num(s.monthly_revenue),
      0
    );

    const grossRevenue =
      cartRevenue > 0 ? cartRevenue : shopMonthlyRevenueTotal;

    const totalCommissions = commissions.reduce(
      (sum, c) => sum + num(c.amount),
      0
    );

    const totalBonuses = bonuses.reduce(
      (sum, b) => sum + num(b.amount),
      0
    );

    const parsePrize = (s: string): number => {
      if (!s) return 0;
      const cleaned = s.replace(/,/g, '');
      const m = cleaned.match(/([\d]+)/);
      return m ? Number(m[1]) : 0;
    };
    const totalAwards = awards.reduce(
      (sum, a: any) => sum + parsePrize(a.prize || ''),
      0
    );

    const totalExpenses = totalCommissions + totalBonuses + totalAwards;
    const netProfit = grossRevenue - totalExpenses;
    const profitMargin =
      grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    const activeDistributors = distributors.filter(
      (d: any) => d.user?.status === 'active'
    ).length;
    const activeShops = shops.filter(
      (s: any) => s.status === 'active'
    ).length;

    const totalBV = convertedCarts.reduce(
      (sum, c) => sum + num(c.total_bv),
      0
    );
    const totalOwnerBV = shops.reduce(
      (sum, s: any) => sum + num(s.owner_bv),
      0
    );

    const customerSet = new Set<string>();
    for (const c of carts) {
      if (c.user?.id) customerSet.add(`u-${c.user.id}`);
      else if (c.session_key) customerSet.add(`g-${c.session_key}`);
    }

    return {
      grossRevenue,
      cartRevenue,
      shopMonthlyRevenueTotal,
      totalCommissions,
      totalBonuses,
      totalAwards,
      totalExpenses,
      netProfit,
      profitMargin,
      totalDistributors: distributors.length,
      activeDistributors,
      sellersWithSales: sellerRevenue.activeCount,
      totalSellerRevenue: sellerRevenue.total,
      totalShops: shops.length,
      activeShops,
      totalBV,
      totalOwnerBV,
      totalCustomers: customerSet.size,
      convertedCartCount: convertedCarts.length,
      totalCarts: carts.length,
    };
  }, [
    carts,
    convertedCarts,
    commissions,
    bonuses,
    awards,
    distributors,
    shops,
    sellerRevenue,
  ]);

  /* ================================================================ */
  /* LOADING                                                          */
  /* ================================================================ */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  /* ================================================================ */
  /* RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.full_name || 'Admin'} — OMA Flowers overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/30">
            {new Date().toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* ---------- ERROR ---------- */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* ---------- TOP KPI ROW ---------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<DollarSign size={22} />}
          label="Total Revenue"
          value={fmtTSh(stats.grossRevenue)}
          sub={`${stats.convertedCartCount} sales • ${stats.sellersWithSales} sellers`}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          valueColor="text-amber-600"
        />
        <KpiCard
          icon={<Users size={22} />}
          label="Sellers"
          value={String(stats.totalDistributors)}
          sub={`${stats.sellersWithSales} with sales`}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          valueColor="text-blue-600"
        />
        <KpiCard
          icon={<Store size={22} />}
          label="Shops"
          value={String(stats.totalShops)}
          sub={`${stats.activeShops} active`}
          iconBg="bg-green-50"
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
        <KpiCard
          icon={<UserCircle2 size={22} />}
          label="Customers"
          value={String(stats.totalCustomers)}
          sub="buyers + guests"
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          valueColor="text-purple-600"
        />
      </div>

      {/* ---------- PROFIT CARD ---------- */}
      <div
        className={`rounded-xl p-6 border-2 ${
          stats.netProfit >= 0
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                stats.netProfit >= 0
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              <Wallet size={32} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Net Profit (after all payouts)
              </p>
              <h2
                className={`text-3xl md:text-4xl font-bold ${
                  stats.netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {fmtTShPrecise(stats.netProfit)}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Profit margin: {stats.profitMargin.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <PayoutPill
              label="Commissions"
              amount={stats.totalCommissions}
              icon={<Receipt size={14} />}
              color="indigo"
            />
            <PayoutPill
              label="Bonuses"
              amount={stats.totalBonuses}
              icon={<Gift size={14} />}
              color="purple"
            />
            <PayoutPill
              label="Awards"
              amount={stats.totalAwards}
              icon={<Award size={14} />}
              color="rose"
            />
            <PayoutPill
              label="Total Expenses"
              amount={stats.totalExpenses}
              icon={<PiggyBank size={14} />}
              color="gray"
            />
          </div>
        </div>
      </div>

      {/* ---------- PROFIT BREAKDOWN ---------- */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          Revenue vs Expenses Breakdown
        </h3>
        <ProfitBar
          grossRevenue={stats.grossRevenue}
          commissions={stats.totalCommissions}
          bonuses={stats.totalBonuses}
          awards={stats.totalAwards}
          profit={stats.netProfit}
        />
      </div>

      {/* ============================================================ */}
      {/* SELLER SALES — built like Orders.tsx (converted carts only)  */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
              <ShoppingBag size={20} className="text-amber-500" />
              Seller Sales (Mauzo)
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <CheckCircle size={12} className="text-green-500" />
              Only converted carts — grouped by item seller_id, with PBV
            </p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Total Sales
              </p>
              <p className="text-lg font-bold text-green-600">
                {fmtTSh(sellerRevenue.total)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Total PBV
              </p>
              <p className="text-lg font-bold text-amber-600">
                {fmtBV(sellerRevenue.totalPBV)}
              </p>
            </div>
          </div>
        </div>

        {sellerRevenue.all.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={24} />}
            text="No sellers yet"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-amber-200/30">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Seller
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Rank
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                    Items Sold
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                    BV Sold
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                    PBV
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Sales
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/30">
                {sellerRevenue.all.map((s, i) => {
                  const hasSales = s.revenue > 0;
                  return (
                    <tr
                      key={s.sellerKey}
                      className={`transition-colors ${
                        hasSales ? 'hover:bg-amber-50/40' : 'opacity-60'
                      }`}
                    >
                      <td className="px-3 py-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            i === 0 && hasSales
                              ? 'bg-amber-500'
                              : i === 1 && hasSales
                              ? 'bg-gray-400'
                              : i === 2 && hasSales
                              ? 'bg-amber-700'
                              : hasSales
                              ? 'bg-amber-300'
                              : 'bg-gray-300'
                          }`}
                        >
                          {i + 1}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <p className="text-sm font-semibold text-gray-800">
                          {s.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-gray-400">
                            Level {s.level}
                          </span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400">
                            {s.bonusPct.toFixed(2)}% bonus
                          </span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[10px] text-gray-400">
                            {s.carts} sale{s.carts === 1 ? '' : 's'}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3 hidden md:table-cell">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            rankColors[s.rank] ||
                            'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {s.rank}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-sm font-medium text-blue-700">
                          {s.itemsSold}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-sm font-medium text-purple-700">
                          {fmtBV(s.bvSold)}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-sm font-bold text-amber-700">
                          {fmtBV(s.pbvSold)}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <p
                          className={`text-sm font-bold ${
                            hasSales ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          {fmtTSh(s.revenue)}
                        </p>
                        {hasSales && (
                          <div className="w-24 bg-amber-100 rounded-full h-1 overflow-hidden mt-1 ml-auto">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                              style={{
                                width: `${
                                  (s.revenue / sellerRevenue.max) * 100
                                }%`,
                              }}
                            />
                          </div>
                        )}
                      </td>

                      <td className="px-3 py-3 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            hasSales ? 'text-gray-700' : 'text-gray-400'
                          }`}
                        >
                          {s.share.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------- SHOP CONTRIBUTIONS ---------- */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Building2 size={18} className="text-amber-500" />
              Shop Contributions to Sales
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Revenue from converted carts, per shop
            </p>
          </div>
          <span className="text-xs font-medium text-gray-500">
            Total: {fmtTSh(shopRevenue.total)}
          </span>
        </div>

        {shopRevenue.rows.length === 0 ? (
          <EmptyState icon={<Store size={24} />} text="No shops yet" />
        ) : (
          <div className="space-y-3">
            {shopRevenue.rows.map((shop) => {
              const hasRevenue = shop.revenue > 0;
              return (
                <div
                  key={shop.id}
                  className={`flex flex-col md:flex-row md:items-center gap-3 p-3 rounded-lg transition-colors ${
                    hasRevenue ? 'hover:bg-amber-50/40' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 md:w-64 shrink-0">
                    <div
                      className={`p-2 rounded-lg ${
                        performanceLevelColors[shop.performanceLevel] ||
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Store size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {shop.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {shop.owner} • {shop.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          hasRevenue
                            ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                            : 'bg-gray-200'
                        }`}
                        style={{
                          width: hasRevenue
                            ? `${(shop.revenue / shopRevenue.max) * 100}%`
                            : 0,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:w-72 shrink-0 justify-between md:justify-end">
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          hasRevenue ? 'text-amber-600' : 'text-gray-400'
                        }`}
                      >
                        {fmtTSh(shop.revenue)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {shop.carts} sale{shop.carts === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-700">
                        {fmtBV(shop.ownerBv)}
                      </p>
                      <p className="text-[10px] text-gray-400">Owner BV</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------- QUICK STATS ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat
          label="Total Owner BV"
          value={fmtBV(stats.totalOwnerBV)}
          color="amber"
          icon={<TrendingUp size={16} />}
        />
        <QuickStat
          label="Total BV (Sold)"
          value={fmtBV(stats.totalBV)}
          color="blue"
          icon={<Package size={16} />}
        />
        <QuickStat
          label="Total Sales"
          value={String(stats.convertedCartCount)}
          color="indigo"
          icon={<ShoppingCart size={16} />}
        />
        <QuickStat
          label="Awards"
          value={String(awards.length)}
          color="rose"
          icon={<Award size={16} />}
        />
      </div>

      {/* ---------- FOOTER SUMMARY ---------- */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl border border-amber-200/30 p-5">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <BarChart3 size={18} className="text-amber-500" />
          Business Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total Revenue Collected</p>
            <p className="text-lg font-bold text-amber-700">
              {fmtTShPrecise(stats.grossRevenue)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              From {stats.convertedCartCount} sale
              {stats.convertedCartCount === 1 ? '' : 's'}
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total Payouts</p>
            <p className="text-lg font-bold text-red-600">
              {fmtTShPrecise(stats.totalExpenses)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Commissions + bonuses + awards
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs text-gray-500">Net Profit</p>
            <p
              className={`text-lg font-bold ${
                stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {fmtTShPrecise(stats.netProfit)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.profitMargin.toFixed(2)}% margin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* SUB-COMPONENTS                                                     */
/* ================================================================== */

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

interface PayoutPillProps {
  label: string;
  amount: number;
  icon: React.ReactNode;
  color: 'indigo' | 'purple' | 'rose' | 'gray';
}

const PayoutPill: React.FC<PayoutPillProps> = ({
  label,
  amount,
  icon,
  color,
}) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
  }[color];

  return (
    <div className={`rounded-lg border px-3 py-2 ${colors}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-80">
        {icon}
        {label}
      </div>
      <p className="text-sm font-bold mt-0.5">{fmtTSh(amount)}</p>
    </div>
  );
};

interface ProfitBarProps {
  grossRevenue: number;
  commissions: number;
  bonuses: number;
  awards: number;
  profit: number;
}

const ProfitBar: React.FC<ProfitBarProps> = ({
  grossRevenue,
  commissions,
  bonuses,
  awards,
  profit,
}) => {
  if (grossRevenue <= 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        No revenue recorded yet.
      </p>
    );
  }

  const pct = (n: number) => (n / grossRevenue) * 100;

  return (
    <div className="space-y-4">
      <div className="w-full h-8 rounded-lg overflow-hidden flex bg-gray-100">
        {commissions > 0 && (
          <div
            className="bg-indigo-500 h-full"
            style={{ width: `${Math.max(pct(commissions), 3)}%` }}
            title={`Commissions: ${fmtTSh(commissions)}`}
          />
        )}
        {bonuses > 0 && (
          <div
            className="bg-purple-500 h-full"
            style={{ width: `${Math.max(pct(bonuses), 3)}%` }}
            title={`Bonuses: ${fmtTSh(bonuses)}`}
          />
        )}
        {awards > 0 && (
          <div
            className="bg-rose-500 h-full"
            style={{ width: `${Math.max(pct(awards), 3)}%` }}
            title={`Awards: ${fmtTSh(awards)}`}
          />
        )}
        {profit > 0 && (
          <div
            className="bg-green-500 h-full"
            style={{ width: `${pct(profit)}%` }}
            title={`Profit: ${fmtTSh(profit)}`}
          />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <LegendItem
          color="bg-indigo-500"
          label="Commissions"
          pct={pct(commissions)}
        />
        <LegendItem
          color="bg-purple-500"
          label="Bonuses"
          pct={pct(bonuses)}
        />
        <LegendItem color="bg-rose-500" label="Awards" pct={pct(awards)} />
        <LegendItem color="bg-green-500" label="Profit" pct={pct(profit)} />
      </div>
    </div>
  );
};

const LegendItem: React.FC<{ color: string; label: string; pct: number }> = ({
  color,
  label,
  pct,
}) => (
  <div className="flex items-center gap-2">
    <span className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-gray-600">{label}</span>
    <span className="font-bold text-gray-800 ml-auto">
      {pct.toFixed(2)}%
    </span>
  </div>
);

interface QuickStatProps {
  label: string;
  value: string;
  color: 'amber' | 'blue' | 'indigo' | 'rose';
  icon: React.ReactNode;
}

const QuickStat: React.FC<QuickStatProps> = ({
  label,
  value,
  color,
  icon,
}) => {
  const colors = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  }[color];

  return (
    <div className={`rounded-xl border p-4 ${colors}`}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-80">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

const EmptyState: React.FC<{ icon: React.ReactNode; text: string }> = ({
  icon,
  text,
}) => (
  <div className="flex flex-col items-center justify-center py-8 text-gray-300">
    {icon}
    <p className="text-sm text-gray-400 mt-2">{text}</p>
  </div>
);

export default Dashboard;