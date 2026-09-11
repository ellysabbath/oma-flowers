// src/pages/distributor/Dashboard.tsx
// Everything shown here belongs ONLY to the logged-in distributor.
// Identity comes from /distributors/me/hierarchy/ — no useAuth(), no roles.

import React, { useEffect, useState } from 'react';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Eye,
  Gift,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import { distributorAPI } from '../../api/distributors';
import { cartAPI } from '../../api/cart';
import { commissionAPI } from '../../api/commissions';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface DistributorStats {
  totalOrders: number;
  totalCommission: number;
  totalBonuses: number;
  downlineCount: number;
  activeDownline: number;
  rank: string;
  pbv: number;
  cgv: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

interface DownlineMember {
  id: number;
  name: string;
  rank: string;
  pbv: number;
  orders: number;
  commission: number;
  status: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: any): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeList = <T,>(data: any): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.results)) return data.data.results;
  return [];
};

const orderStatusColors: Record<string, string> = {
  delivered: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  converted: 'bg-green-100 text-green-700',
  shipped: 'bg-purple-100 text-purple-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
};

const getStatusColor = (status: string) =>
  orderStatusColors[String(status).toLowerCase()] ||
  'bg-gray-100 text-gray-700';

/**
 * Best-effort "my name" from a distributor object.
 * Falls back to the email's local part if no full name is available.
 */
const pickDisplayName = (profile: any): string => {
  if (!profile) return 'Distributor';

  const candidates = [
    profile?.user?.full_name,
    profile?.user?.fullName,
    profile?.user?.name,
    profile?.full_name,
    profile?.fullName,
    profile?.name,
    profile?.user?.username,
    profile?.username,
    profile?.user?.first_name && profile?.user?.last_name
      ? `${profile.user.first_name} ${profile.user.last_name}`
      : null,
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : null,
    profile?.user?.first_name,
    profile?.first_name,
  ];

  for (const c of candidates) {
    if (c && String(c).trim()) return String(c).trim();
  }

  const email = profile?.user?.email || profile?.email;
  if (email && typeof email === 'string' && email.includes('@')) {
    const local = email.split('@')[0].replace(/[._-]+/g, ' ');
    return local
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return 'Distributor';
};

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

const DistributorDashboard: React.FC = () => {
  const [stats, setStats] = useState<DistributorStats | null>(null);
  const [myProfile, setMyProfile] = useState<any | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [downline, setDownline] = useState<DownlineMember[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noProfile, setNoProfile] = useState(false);

  /* ================================================================ */
  /* Load — everything for ME                                          */
  /* ================================================================ */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoProfile(false);

      /* ---- 1. Resolve MY distributor profile + downline ---- */
      let profile: any = null;
      let downlineRaw: any[] = [];

      try {
        const hierarchy: any = await distributorAPI.getMyHierarchy();
        profile =
          hierarchy?.distributor ??
          hierarchy?.data?.distributor ??
          hierarchy?.data ??
          hierarchy;
        downlineRaw = Array.isArray(hierarchy?.downline)
          ? hierarchy.downline
          : Array.isArray(hierarchy?.data?.downline)
          ? hierarchy.data.downline
          : [];
      } catch (e: any) {
        if (e?.response?.status === 404) {
          setNoProfile(true);
          setLoading(false);
          return;
        }
        throw e;
      }

      const myId = num(profile?.id);
      if (!myId) {
        setNoProfile(true);
        setLoading(false);
        return;
      }

      setMyProfile(profile);

      /* ---- 2. MY commissions (backend-filtered) ---- */
      let commissionList: any[] = [];
      try {
        const cmRaw: any = await commissionAPI.getAll({
          distributor: myId,
        });
        commissionList = normalizeList<any>(cmRaw);
      } catch {
        commissionList = [];
      }

      commissionList = commissionList.filter((c) => {
        const cid =
          c?.distributor?.id ??
          c?.distributor_id ??
          (typeof c?.distributor === 'number' ? c.distributor : null);
        return cid == null ? true : num(cid) === myId;
      });

      const totalCommission = commissionList
        .filter((c) => String(c.type).toLowerCase() === 'personal')
        .reduce((s, c) => s + num(c.amount), 0);

      const totalDifferential = commissionList
        .filter((c) => String(c.type).toLowerCase() === 'differential')
        .reduce((s, c) => s + num(c.amount), 0);

      /* ---- 3. MY carts only ---- */
      let cartsList: any[] = [];
      try {
        const cartsRaw: any = await cartAPI.getAll();
        cartsList = normalizeList<any>(cartsRaw);
      } catch {
        cartsList = [];
      }

      const myCarts = cartsList.filter((c) => {
        const sid =
          c?.seller_id ??
          c?.sellerId ??
          (typeof c?.seller === 'number' ? c.seller : null) ??
          c?.seller?.id;
        return sid == null ? false : num(sid) === myId;
      });

      const convertedCarts = myCarts.filter(
        (c) => String(c.status).toLowerCase() === 'converted'
      );

      /* ---- 4. MY recent carts ---- */
      const recent: RecentOrder[] = myCarts
        .slice()
        .sort((a, b) => {
          const ta = new Date(a.updated_at || a.created_at || 0).getTime();
          const tb = new Date(b.updated_at || b.created_at || 0).getTime();
          return tb - ta;
        })
        .slice(0, 4)
        .map((c) => ({
          id: c.code || c.order_number || `#${c.id}`,
          customer:
            c.customer_name ||
            c.customer?.full_name ||
            c.shop?.name ||
            '—',
          amount: num(c.total ?? c.total_amount ?? c.amount),
          status: c.status || 'pending',
          date: String(c.updated_at || c.created_at || '').split('T')[0],
        }));

      setRecentOrders(recent);

      /* ---- 5. MY downline (from my hierarchy) ---- */
      const dl: DownlineMember[] = downlineRaw.map((d: any) => {
        const dId = num(d.id);
        const dCommission = commissionList
          .filter(
            (c) =>
              String(c.type).toLowerCase() === 'differential' &&
              num(c.source_distributor?.id ?? c.source_distributor) === dId
          )
          .reduce((s, c) => s + num(c.amount), 0);

        return {
          id: dId,
          name:
            pickDisplayName(d) !== 'Distributor'
              ? pickDisplayName(d)
              : `#${dId}`,
          rank: d.rank || 'Associate',
          pbv: num(d.pbv),
          orders: num(d.total_orders ?? d.orders_count ?? 0),
          commission: dCommission,
          status: d.is_active === false ? 'Inactive' : 'Active',
        };
      });

      setDownline(dl);

      /* ---- 6. Compose MY stats ---- */
      setStats({
        totalOrders: convertedCarts.length,
        totalCommission,
        totalBonuses: totalDifferential,
        downlineCount: downlineRaw.length,
        activeDownline: dl.filter((m) => m.status === 'Active').length,
        rank: profile?.rank || 'Associate',
        pbv: num(profile?.pbv),
        cgv: num(profile?.cgv),
      });
    } catch (err: any) {
      console.error('Failed to load distributor dashboard:', err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================ */
  /* Loading / errors                                                  */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <p className="font-medium">No distributor profile linked</p>
          </div>
          <p className="text-sm mt-1">
            Your account is not linked to a distributor record, so your
            dashboard can't be shown.
          </p>
          <button
            onClick={loadDashboard}
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
            <p className="font-medium">Failed to load dashboard</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const s: DistributorStats = stats ?? {
    totalOrders: 0,
    totalCommission: 0,
    totalBonuses: 0,
    downlineCount: 0,
    activeDownline: 0,
    rank: 'Associate',
    pbv: 0,
    cgv: 0,
  };

  const displayName = pickDisplayName(myProfile);

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-white-600 to-white-700 rounded-2xl p-6 text-dark mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {displayName}!
              </h1>
              <p className="text-dark-100 mt-1">
                Here's your distributor performance overview
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <span className="bg-white/20 px-4 py-2 rounded-lg text-sm">
                Rank: <span className="font-bold">{s.rank}</span>
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-lg text-sm">
                PBV: <span className="font-bold">{s.pbv}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">My Orders</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {s.totalOrders}
                </h3>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <ShoppingBag className="text-amber-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">My Commission</p>
                <h3 className="text-2xl font-bold text-amber-600">
                  TSh {(s.totalCommission / 1000).toFixed(1)}K
                </h3>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg">
                <DollarSign className="text-green-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Differential Bonus</p>
                <h3 className="text-2xl font-bold text-purple-600">
                  TSh {(s.totalBonuses / 1000).toFixed(1)}K
                </h3>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg">
                <Gift className="text-purple-500" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">My Downline</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {s.downlineCount}
                </h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} /> {s.activeDownline} Active
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Users className="text-blue-500" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders & Downline Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentOrders orders={recentOrders} />
          <DownlineActivity members={downline} />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Recent Orders (MY carts)                                            */
/* ------------------------------------------------------------------ */

const RecentOrders: React.FC<{ orders: RecentOrder[] }> = ({ orders }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">My recent carts</h3>
        <button className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          View All <Eye size={14} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">
          You have no carts yet
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50/50 transition-colors border-b border-amber-100/30 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {order.id}
                </p>
                <p className="text-xs text-gray-400">{order.customer}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-amber-600">
                  TSh {order.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">{order.date}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Downline (MY direct downline)                                       */
/* ------------------------------------------------------------------ */

const DownlineActivity: React.FC<{ members: DownlineMember[] }> = ({
  members,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">My downline</h3>
        <button className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          View All <Eye size={14} />
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">
          You have no downline members yet
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => {
            const initials = member.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-amber-50/50 transition-colors border-b border-amber-100/30 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {member.name}
                    </p>
                    <p className="text-xs text-amber-600">{member.rank}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-amber-600">
                    TSh {member.commission.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {member.orders} orders
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {member.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DistributorDashboard;