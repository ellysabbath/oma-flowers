// src/pages/distributor/Orders.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Download,
  Printer,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Copy,
  Check,
  ShoppingCart,
  Store,
  User2Icon,
  Award,
  DollarSign,
  Calculator,
  Info,
  TrendingUp,
  Package,
  Users,
  Wallet,
} from 'lucide-react';

import { cartAPI } from '../../api/cart';
import { distributorAPI } from '../../api/distributors';
import { useAuth } from '../../context/AuthContext';
import type { Cart as ApiCart, Distributor } from '../../types';

/* ------------------------------------------------------------------ */
/* View model                                                          */
/* ------------------------------------------------------------------ */

interface SoldItem {
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  bv: number;
  subtotal: number;      // TSh for this line (only my portion)
  itemPBV: number;       // PBV earned on this line
  itemCommission: number; // TSh earned on this line
  isMine: boolean;       // true if I'm the seller of this line
}

interface DisplaySale {
  id: number;
  code: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  itemCount: number;
  myItemCount: number;    // lines where I'm the seller
  myBV: number;           // total BV I sold on this cart
  myPBV: number;          // PBV I earned on this cart
  myRevenue: number;      // TSh revenue I generated
  myCommission: number;   // commission in TSh
  bonusPct: number;
  status: 'Active' | 'Converted' | 'Abandoned' | 'Expired';
  date: string;
  notes?: string;
  shopName?: string;
  sellers: string[];
  items: SoldItem[];
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const BV_TO_TSH = 2500;

const statusColors: Record<string, string> = {
  Active: 'bg-blue-100 text-blue-700',
  Converted: 'bg-green-100 text-green-700',
  Abandoned: 'bg-yellow-100 text-yellow-700',
  Expired: 'bg-red-100 text-red-700',
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const extractList = <T,>(input: any): T[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.results)) return input.results;
  if (Array.isArray(input.data)) return input.data;
  if (input.data && Array.isArray(input.data.results))
    return input.data.results;
  return [];
};

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return iso;
  }
};

/* ---- Full numbers — no K/M abbreviations ---- */
const fmtTSh = (n: number) =>
  `TSh ${Math.round(n).toLocaleString('en-US')}`;

const fmtTShPrecise = (n: number) =>
  `TSh ${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtBV = (n: number) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

/* ------------------------------------------------------------------ */
/* Copy button                                                         */
/* ------------------------------------------------------------------ */

const CopyCodeButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      onClick={copy}
      title={copied ? 'Copied!' : 'Copy code'}
      className="ml-1 p-0.5 rounded hover:bg-amber-100 transition-colors"
    >
      {copied ? (
        <Check size={11} className="text-green-600" />
      ) : (
        <Copy size={11} className="text-gray-400" />
      )}
    </button>
  );
};

/* ================================================================== */
/* Component                                                           */
/* ================================================================== */

const DistributorOrders: React.FC = () => {
  const { user } = useAuth();

  const [me, setMe] = useState<Distributor | null>(null);
  const [sales, setSales] = useState<DisplaySale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [selectedSale, setSelectedSale] = useState<DisplaySale | null>(null);

  /* ================================================================ */
  /* Load my sales                                                    */
  /* ================================================================ */
  const loadSales = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Find my distributor profile
      const rawDists = await distributorAPI.getAll();
      const dists = extractList<Distributor>(rawDists);
      const myProfile =
        dists.find(
          (d) => Number(d.user?.id) === Number((user as any)?.id)
        ) || null;
      setMe(myProfile);

      if (!myProfile) {
        setSales([]);
        setLoading(false);
        return;
      }

      // 2) Fetch every cart, filter locally to those where I'm the seller
      const rawCarts = await cartAPI.getAll();
      const allCarts = extractList<ApiCart>(rawCarts);

      const myBonusPct = num(myProfile.bonus_percentage);

      /* ---- Build display rows for carts I sold in ---- */
      const transformed: DisplaySale[] = [];

      for (const cart of allCarts as any[]) {
        const cartItems = cart.items || [];
        if (cartItems.length === 0) continue;

        const cartDistId = cart.distributor?.id ?? cart.distributor_id;

        /* ---- Compute my slice of this cart ---- */
        let myBV = 0;
        let myPBV = 0;
        let myRevenue = 0;
        let myCommission = 0;
        let myItemCount = 0;

        const items: SoldItem[] = cartItems.map((it: any) => {
          const lineBV = num(it.bv) * num(it.quantity || 1);
          const lineRevenue = num(it.subtotal);

          const isMine =
            cartDistId === myProfile.id ||
            it.seller_id === myProfile.id;

          const pbv =
            isMine && myBonusPct > 0
              ? lineBV * (myBonusPct / 100)
              : isMine
              ? lineBV
              : 0;

          const commission = isMine
            ? Math.round(pbv * BV_TO_TSH)
            : 0;

          if (isMine) {
            myBV += lineBV;
            myPBV += pbv;
            myRevenue += lineRevenue;
            myCommission += commission;
            myItemCount += num(it.quantity) || 1;
          }

          return {
            productId: it.product,
            productName: it.product_name || 'Unknown Product',
            productSku: it.product_sku || '',
            quantity: num(it.quantity),
            price: num(it.price),
            bv: num(it.bv),
            subtotal: isMine ? lineRevenue : 0,
            itemPBV: pbv,
            itemCommission: commission,
            isMine,
          };
        });

        // Skip carts where I'm not the seller at all
        if (myItemCount === 0) continue;

        const buyer = cart.user || {};
        const sellers = Array.from(
          new Set(
            cartItems
              .map((it: any) => it.seller_name || '')
              .filter((n: string) => n && n.length > 0)
          )
        ) as string[];

        transformed.push({
          id: cart.id,
          code: cart.code || `#${cart.id}`,
          buyerName:
            buyer.full_name || buyer.username || 'Guest',
          buyerEmail: buyer.email || '',
          buyerPhone:
            buyer.mobile_number || buyer.phone || '',
          itemCount: cartItems.length,
          myItemCount,
          myBV,
          myPBV: Math.round(myPBV * 100) / 100,
          myRevenue,
          myCommission,
          bonusPct: myBonusPct,
          status: capitalize(cart.status) as DisplaySale['status'],
          date: formatDate(cart.created_at),
          notes: cart.notes || undefined,
          shopName: cart.shop?.name || undefined,
          sellers,
          items,
        });
      }

      transformed.sort((a, b) => (a.date < b.date ? 1 : -1));
      setSales(transformed);
    } catch (e: any) {
      console.error('Failed to load sales:', e);
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.error ||
          e?.message ||
          'Failed to load your sales.'
      );
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ================================================================ */
  /* Filters                                                          */
  /* ================================================================ */
  const filteredSales = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return sales.filter((s) => {
      const matchesSearch =
        !q ||
        s.code.toLowerCase().includes(q) ||
        s.buyerName.toLowerCase().includes(q) ||
        s.buyerEmail.toLowerCase().includes(q);
      const matchesStatus =
        filterStatus === 'All' || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [sales, searchTerm, filterStatus]);

  /* ================================================================ */
  /* Stats                                                            */
  /* ================================================================ */
  const converted = sales.filter((s) => s.status === 'Converted');

  const totalSales = sales.length;
  const totalConverted = converted.length;
  const totalRevenue = converted.reduce((s, x) => s + x.myRevenue, 0);
  const totalCommission = converted.reduce(
    (s, x) => s + x.myCommission,
    0
  );
  const totalPBV = converted.reduce((s, x) => s + x.myPBV, 0);
  const totalBV = converted.reduce((s, x) => s + x.myBV, 0);

  /* ================================================================ */
  /* CSV Export                                                       */
  /* ================================================================ */
  const handleExportCSV = () => {
    const headers = [
      'Cart Code',
      'Buyer',
      'Buyer Email',
      'My Items',
      'My BV',
      'My PBV',
      'My Revenue (TSh)',
      'My Commission (TSh)',
      'Status',
      'Date',
      'Shop',
    ];
    const rows = filteredSales.map((s) => [
      s.code,
      s.buyerName,
      s.buyerEmail,
      s.myItemCount,
      s.myBV,
      s.myPBV,
      s.myRevenue,
      s.myCommission,
      s.status,
      s.date,
      s.shopName || '',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================================================================ */
  /* Loading / error                                                  */
  /* ================================================================ */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Failed to load your sales</p>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={loadSales}
                className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /* Render                                                           */
  /* ================================================================ */
  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* ---------- Header ---------- */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Sales</h1>
            <p className="text-gray-500 mt-1">
              {me
                ? `Sales credited to you — ${me.full_name || ''} (${me.rank})`
                : 'Track sales credited to you'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSales}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium"
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={filteredSales.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium disabled:opacity-50"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        {/* ---------- My Performance strip ---------- */}
        {me && (
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/40 rounded-xl border border-amber-200/50 p-5 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 rounded-lg">
                  <TrendingUp className="text-amber-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    My Performance
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your current OMA metrics
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700 font-medium">
                  Rank: {me.rank}
                </span>
                <span className="px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700 font-medium">
                  Bonus: {num(me.bonus_percentage).toFixed(2)}%
                </span>
                <span className="px-2 py-1 rounded-full bg-white border border-amber-200 text-amber-700 font-medium">
                  1 BV = {BV_TO_TSH.toLocaleString()} TSh
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniStat
                label="My PBV"
                value={fmtBV(num(me.pbv))}
                sub="BV this month"
                color="blue"
              />
              <MiniStat
                label="My CGV"
                value={fmtBV(num(me.cgv))}
                sub="Lifetime network BV"
                color="purple"
              />
              <MiniStat
                label="Total BV Sold"
                value={fmtBV(totalBV)}
                sub={`From ${totalConverted} sales`}
                color="amber"
              />
              <MiniStat
                label="Total PBV Earned"
                value={fmtBV(totalPBV)}
                sub="From these sales"
                color="green"
              />
            </div>
          </div>
        )}

        {/* ---------- Commission Formula ---------- */}
        {me && (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Calculator className="text-amber-600" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">
                  How your commission is calculated
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Following the OMA Flowers business plan, Section 4.2
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormulaStep
                step="1"
                title="Personal Bonus Volume"
                formula="PBV = BV × (Bonus% ÷ 100)"
                example={`e.g. 50 BV × (${num(
                  me.bonus_percentage
                ).toFixed(2)}% ÷ 100) = ${(
                  (50 * num(me.bonus_percentage)) /
                  100
                ).toFixed(2)} PBV`}
                color="blue"
              />
              <FormulaStep
                step="2"
                title="Commission in TSh"
                formula="Commission = PBV × 2,500"
                example={`e.g. ${(
                  (50 * num(me.bonus_percentage)) /
                  100
                ).toFixed(2)} PBV × 2,500 = ${fmtTSh(
                  (50 * num(me.bonus_percentage) * BV_TO_TSH) / 100
                )}`}
                color="green"
              />
              <FormulaStep
                step="3"
                title="Order Total"
                formula="Σ (item PBV) × 2,500"
                example="Accumulated across every line item you sold"
                color="amber"
              />
            </div>
          </div>
        )}

        {/* ---------- Stats ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total Sales"
            value={totalSales}
            icon={<ShoppingCart size={20} className="text-amber-500" />}
            bg="bg-amber-50"
          />
          <StatCard
            label="Converted"
            value={totalConverted}
            valueClass="text-green-600"
            icon={<Check size={20} className="text-green-500" />}
            bg="bg-green-50"
          />
          <StatCard
            label="My Revenue"
            value={fmtTSh(totalRevenue)}
            valueClass="text-amber-600"
            icon={<DollarSign size={20} className="text-amber-500" />}
            bg="bg-amber-50"
          />
          <StatCard
            label="My PBV"
            value={fmtBV(totalPBV)}
            valueClass="text-blue-600"
            icon={<TrendingUp size={20} className="text-blue-500" />}
            bg="bg-blue-50"
          />
          <StatCard
            label="My Commission"
            value={fmtTSh(totalCommission)}
            valueClass="text-green-600"
            icon={<Wallet size={20} className="text-green-500" />}
            bg="bg-green-50"
          />
        </div>

        {/* ---------- Filters ---------- */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by cart code, buyer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Converted">Converted</option>
            <option value="Abandoned">Abandoned</option>
            <option value="Expired">Expired</option>
          </select>
          <button
            onClick={loadSales}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <Filter size={18} className="text-gray-500" />
          </button>
        </div>

        {/* ---------- Sales table ---------- */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
          {sales.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="font-medium">No sales yet</p>
              <p className="text-sm mt-1">
                Sales you make (or products you sell) will appear here once a
                buyer checks out.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-amber-50/50 border-b border-amber-200/30">
                      <Th>Cart Code</Th>
                      <Th>Buyer</Th>
                      <Th className="hidden md:table-cell">My Items</Th>
                      <Th className="hidden lg:table-cell">My BV</Th>
                      <Th className="hidden lg:table-cell">My PBV</Th>
                      <Th>Status</Th>
                      <Th className="hidden sm:table-cell">Date</Th>
                      <Th className="text-right">My Revenue</Th>
                      <Th className="text-right">My Commission</Th>
                      <Th className="text-right">Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/30">
                    {filteredSales.map((sale) => (
                      <tr
                        key={sale.id}
                        className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedSale(sale)}
                      >
                        {/* Cart code */}
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {sale.code}
                            </span>
                            <CopyCodeButton code={sale.code} />
                          </div>
                        </td>

                        {/* Buyer */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-700">
                            {sale.buyerName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {sale.buyerPhone || sale.buyerEmail}
                          </p>
                        </td>

                        {/* My items */}
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                          {sale.myItemCount} of {sale.itemCount}
                        </td>

                        {/* My BV */}
                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-purple-700 font-medium">
                          {fmtBV(sale.myBV)}
                        </td>

                        {/* My PBV */}
                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-blue-700 font-medium">
                          {fmtBV(sale.myPBV)}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[sale.status] ||
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {sale.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500">
                          {sale.date}
                        </td>

                        {/* My Revenue */}
                        <td className="px-4 py-3 text-right text-sm font-medium text-amber-600">
                          {fmtTSh(sale.myRevenue)}
                        </td>

                        {/* My Commission */}
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm font-bold text-green-600">
                            {fmtTSh(sale.myCommission)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {fmtBV(sale.myPBV)} PBV × 2,500
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSale(sale);
                            }}
                            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
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
                Showing {filteredSales.length} of {sales.length} sale
                {sales.length === 1 ? '' : 's'}
              </div>
            </>
          )}
        </div>

        {/* ============================================================ */}
        {/* Detail modal                                                  */}
        {/* ============================================================ */}
        {selectedSale && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSale(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Sale Details
                  </h3>
                  <p className="flex items-center gap-1 mt-1">
                    <span className="font-mono text-sm font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {selectedSale.code}
                    </span>
                    <CopyCodeButton code={selectedSale.code} />
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Buyer */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User2Icon size={16} /> Buyer
                  </p>
                  <p className="mt-1 font-medium text-gray-800">
                    {selectedSale.buyerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedSale.buyerEmail || '—'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedSale.buyerPhone || '—'}
                  </p>
                  {selectedSale.shopName && (
                    <p className="text-sm text-gray-500 mt-2">
                      Shop: {selectedSale.shopName}
                    </p>
                  )}
                </div>

                {/* Commission formula for this sale */}
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/40 rounded-lg border border-amber-200/50">
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
                    <Calculator size={16} className="text-amber-600" />
                    How this commission was calculated
                  </p>

                  <div className="space-y-2 text-xs">
                    <CalcRow
                      label="My BV on this cart"
                      value={`${fmtBV(selectedSale.myBV)} BV`}
                      color="purple"
                    />
                    <CalcRow
                      label="My bonus percentage"
                      value={`${selectedSale.bonusPct.toFixed(2)}%`}
                      color="blue"
                    />
                    <CalcRow
                      label="Personal Bonus Volume (PBV)"
                      value={`${fmtBV(selectedSale.myBV)} × ${(
                        selectedSale.bonusPct / 100
                      ).toFixed(4)} = ${fmtBV(selectedSale.myPBV)} PBV`}
                      color="blue"
                    />
                    <CalcRow
                      label="Convert to TSh (1 BV = 2,500 TSh)"
                      value={`${fmtBV(
                        selectedSale.myPBV
                      )} × 2,500 = ${fmtTShPrecise(
                        selectedSale.myCommission
                      )}`}
                      color="green"
                    />
                  </div>
                </div>

                {/* Numbers grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatBox
                    label="My Items"
                    value={`${selectedSale.myItemCount} of ${selectedSale.itemCount}`}
                    color="amber"
                  />
                  <StatBox
                    label="My BV"
                    value={fmtBV(selectedSale.myBV)}
                    color="purple"
                  />
                  <StatBox
                    label="My PBV"
                    value={fmtBV(selectedSale.myPBV)}
                    color="blue"
                  />
                  <StatBox
                    label="My Commission"
                    value={fmtTSh(selectedSale.myCommission)}
                    color="green"
                  />
                </div>

                {/* Items breakdown */}
                {selectedSale.items.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Package size={16} /> Item-by-item breakdown
                    </p>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-500 font-medium">
                              Product
                            </th>
                            <th className="px-3 py-2 text-center text-gray-500 font-medium">
                              Qty
                            </th>
                            <th className="px-3 py-2 text-center text-gray-500 font-medium">
                              BV/unit
                            </th>
                            <th className="px-3 py-2 text-center text-gray-500 font-medium">
                              Total BV
                            </th>
                            <th className="px-3 py-2 text-center text-gray-500 font-medium">
                              PBV
                            </th>
                            <th className="px-3 py-2 text-right text-gray-500 font-medium">
                              Commission
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedSale.items.map((it, idx) => (
                            <tr
                              key={idx}
                              className={it.isMine ? '' : 'opacity-50'}
                            >
                              <td className="px-3 py-2">
                                <p className="font-medium text-gray-700">
                                  {it.productName}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {it.productSku}
                                  {!it.isMine && (
                                    <span className="ml-1 text-gray-500 italic">
                                      (not your item)
                                    </span>
                                  )}
                                </p>
                              </td>
                              <td className="px-3 py-2 text-center text-gray-600">
                                {it.quantity}
                              </td>
                              <td className="px-3 py-2 text-center text-gray-600">
                                {fmtBV(it.bv)}
                              </td>
                              <td className="px-3 py-2 text-center text-purple-700 font-medium">
                                {fmtBV(it.bv * it.quantity)}
                              </td>
                              <td className="px-3 py-2 text-center text-blue-700 font-medium">
                                {fmtBV(it.itemPBV)}
                              </td>
                              <td className="px-3 py-2 text-right text-green-700 font-medium">
                                {fmtTSh(it.itemCommission)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-amber-50/60">
                          <tr>
                            <td
                              colSpan={3}
                              className="px-3 py-2 text-right font-medium text-gray-600"
                            >
                              My totals
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-purple-700">
                              {fmtBV(selectedSale.myBV)}
                            </td>
                            <td className="px-3 py-2 text-center font-bold text-blue-700">
                              {fmtBV(selectedSale.myPBV)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-green-700">
                              {fmtTSh(selectedSale.myCommission)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sellers on cart */}
                {selectedSale.sellers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Users size={16} /> Sellers on this cart
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSale.sellers.map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      My Revenue from this sale
                    </span>
                    <span className="font-bold text-amber-700 text-lg">
                      {fmtTShPrecise(selectedSale.myRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">
                      My Commission
                    </span>
                    <span className="font-bold text-green-700 text-lg">
                      {fmtTShPrecise(selectedSale.myCommission)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {selectedSale.notes && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200/30">
                    <p className="text-sm font-medium text-gray-500">Notes</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedSale.notes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                  <button
                    onClick={() => setSelectedSale(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================================================================== */
/* Small pieces                                                        */
/* ================================================================== */

const Th: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <th
    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const StatCard: React.FC<{
  label: string;
  value: string | number;
  valueClass?: string;
  icon: React.ReactNode;
  bg: string;
}> = ({ label, value, valueClass = 'text-gray-800', icon, bg }) => (
  <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <h3 className={`text-xl font-bold ${valueClass} mt-0.5 truncate`}>
          {value}
        </h3>
      </div>
      <div className={`p-2.5 ${bg} rounded-lg shrink-0`}>{icon}</div>
    </div>
  </div>
);

const MiniStat: React.FC<{
  label: string;
  value: string;
  sub: string;
  color: 'amber' | 'blue' | 'purple' | 'green';
}> = ({ label, value, sub, color }) => {
  const colors = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  }[color];
  return (
    <div className={`rounded-lg border p-3 ${colors}`}>
      <p className="text-[10px] uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="text-lg font-bold mt-1 truncate">{value}</p>
      <p className="text-[10px] opacity-60 mt-0.5">{sub}</p>
    </div>
  );
};

const StatBox: React.FC<{
  label: string;
  value: string;
  color: 'amber' | 'blue' | 'purple' | 'green';
}> = ({ label, value, color }) => {
  const colors = {
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
  }[color];
  return (
    <div className={`rounded-lg p-3 text-center ${colors}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-base font-bold mt-1 truncate">{value}</p>
    </div>
  );
};

const CalcRow: React.FC<{
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple';
}> = ({ label, value, color }) => {
  const textColors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  }[color];

  return (
    <div className="flex items-center justify-between gap-3 bg-white/70 rounded px-3 py-2">
      <span className="text-gray-500">{label}</span>
      <span className={`font-mono font-medium ${textColors}`}>{value}</span>
    </div>
  );
};

interface FormulaStepProps {
  step: string;
  title: string;
  formula: string;
  example: string;
  color: 'blue' | 'green' | 'amber';
}

const FormulaStep: React.FC<FormulaStepProps> = ({
  step,
  title,
  formula,
  example,
  color,
}) => {
  const colors = {
    blue: 'border-blue-200 bg-blue-50/50',
    green: 'border-green-200 bg-green-50/50',
    amber: 'border-amber-200 bg-amber-50/50',
  }[color];
  const badgeColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  }[color];

  return (
    <div className={`rounded-lg border p-3 ${colors}`}>
      <div className="flex items-center gap-2">
        <span
          className={`w-5 h-5 rounded-full ${badgeColors} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}
        >
          {step}
        </span>
        <p className="text-xs font-semibold text-gray-800">{title}</p>
      </div>
      <p className="mt-2 text-xs font-mono text-gray-700 bg-white/60 rounded px-2 py-1">
        {formula}
      </p>
      <p className="mt-1 text-[10px] text-gray-500 italic">{example}</p>
    </div>
  );
};

export default DistributorOrders;