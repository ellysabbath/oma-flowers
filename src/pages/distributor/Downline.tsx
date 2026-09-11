// src/pages/distributor/Downline.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  UserPlus,
  Mail,
  Phone,
  Eye,
  Trash2,
  Users,
  Award,
  TrendingUp,
  Loader2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';
import { distributorAPI } from '../../api/distributors';
import { userAPI } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import type { Distributor, User as UserType } from '../../types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface DownlineMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  rank: string;
  pbv: number;
  cgv: number;
  bonusPercentage: number;
  joinDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  level: number;
  distributor: Distributor;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const RANK_OPTIONS = [
  'Associate',
  'Builder',
  'Leader',
  'Senior Leader',
  'Executive',
  'Manager',
  'Senior Manager',
  'Director',
  'Crown Director',
  'Royal Crown Director',
] as const;

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

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Inactive: 'bg-red-100 text-red-700',
  Pending: 'bg-yellow-100 text-yellow-700',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

const capitalize = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

const formatDate = (iso?: string) => {
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

/** Extract a distributor's related user id from whatever shape the API returned. */
const getDistributorUserId = (d: any): number | null => {
  if (typeof d?.user === 'object' && d.user !== null) return d.user.id;
  if (typeof d?.user === 'number') return d.user;
  if (typeof d?.user_id === 'number') return d.user_id;
  return null;
};

/** Recursively flatten a nested hierarchy tree into a flat array. */
const flattenHierarchy = (
  nodes: any[],
  level: number,
  out: DownlineMember[] = []
): DownlineMember[] => {
  if (!Array.isArray(nodes)) return out;

  for (const node of nodes) {
    const user = node.user || {};
    out.push({
      id: node.id,
      name: user.full_name || user.username || node.full_name || 'Unknown',
      email: user.email || '',
      phone: user.phone || user.mobile_number || '',
      rank: node.rank || 'Associate',
      pbv: num(node.pbv),
      cgv: num(node.cgv),
      bonusPercentage: num(node.bonus_percentage),
      joinDate: node.join_date || node.created_at || '',
      status: capitalize(user.status) as DownlineMember['status'],
      level,
      distributor: node as Distributor,
    });

    if (Array.isArray(node.downline) && node.downline.length > 0) {
      flattenHierarchy(node.downline, level + 1, out);
    }
  }
  return out;
};

/** Normalize the hierarchy response into an array of children. */
const extractChildren = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.downline)) return response.downline;
  return [];
};

/** Normalize a list response (array OR paginated). */
const normalizeList = <T,>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

/* ------------------------------------------------------------------ */
/* Invite Members Modal                                                */
/* ------------------------------------------------------------------ */

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  myDistributorId: number;
  existingDownlineUserIds: number[];
  onDone: () => void;
}

const InviteMembersModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  myDistributorId,
  existingDownlineUserIds,
  onDone,
}) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [defaultRank, setDefaultRank] = useState<string>('Associate');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Load candidate users ---------- */
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingUsers(true);
        setError(null);

        const [usersRaw, distributorsRaw] = await Promise.all([
          typeof (userAPI as any).getNonDistributors === 'function'
            ? (userAPI as any).getNonDistributors()
            : userAPI.getCustomers(),
          distributorAPI.getAll(),
        ]);

        const candidatesList: UserType[] = normalizeList<UserType>(usersRaw);
        const distributorsList: any[] = normalizeList<any>(distributorsRaw);

        const alreadyDistributorUserIds = new Set<number>();
        for (const d of distributorsList) {
          const uid = getDistributorUserId(d);
          if (uid !== null) alreadyDistributorUserIds.add(uid);
        }

        const filtered = candidatesList.filter((u) => {
          if (alreadyDistributorUserIds.has(u.id)) return false;
          if (u.user_type === 'distributor') return false;
          if (u.user_type === 'admin') return false;
          return true;
        });

        if (!cancelled) setUsers(filtered);
      } catch (err: any) {
        console.error('Failed to load users:', err);
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              'Failed to load users.'
          );
        }
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  /* Reset form state on open */
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSearch('');
      setDefaultRank('Associate');
      setError(null);
    }
  }, [isOpen]);

  const candidates = useMemo(() => {
    const taken = new Set(existingDownlineUserIds);
    const q = search.trim().toLowerCase();

    return users
      .filter((u) => !taken.has(u.id))
      .filter((u) => {
        if (!q) return true;
        const name = (u.full_name || u.username || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
  }, [users, existingDownlineUserIds, search]);

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      for (const userId of selectedIds) {
        await distributorAPI.create({
          user_id: userId,
          upline_id: myDistributorId,
          rank: defaultRank,
        });
      }

      onDone();
      onClose();
    } catch (err: any) {
      console.error('Failed to add members:', err);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          (err?.response?.data &&
            Object.values(err.response.data).flat().join(', ')) ||
          'Failed to add members.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Invite Members</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Add registered users to your downline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Starting Rank
            </label>
            <select
              value={defaultRank}
              onChange={(e) => setDefaultRank(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {RANK_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              New members will join with this rank.
            </p>
          </div>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Users ({selectedIds.length} selected)
              </label>
              {candidates.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIds(
                      selectedIds.length === candidates.length
                        ? []
                        : candidates.map((c) => c.id)
                    )
                  }
                  className="text-xs text-amber-600 hover:text-amber-700"
                >
                  {selectedIds.length === candidates.length
                    ? 'Clear all'
                    : 'Select all'}
                </button>
              )}
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8 text-amber-600 gap-2">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading users…</span>
              </div>
            ) : candidates.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <Users className="mx-auto text-gray-300" size={32} />
                <p className="text-sm text-gray-500 mt-2">
                  {search
                    ? 'No users match your search.'
                    : 'No available users to invite.'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Users must register first, and can only join one downline.
                </p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {candidates.map((u) => {
                  const selected = selectedIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                        selected ? 'bg-amber-50/60' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggle(u.id)}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                        {(u.full_name || u.username || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {u.full_name || u.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {u.email}
                        </p>
                      </div>
                      {selected && (
                        <Check size={16} className="text-amber-600" />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-amber-100/50 flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || selectedIds.length === 0}
            className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Remove Downline Modal                                               */
/* ------------------------------------------------------------------ */

interface RemoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: DownlineMember | null;
  onConfirm: (action: 'detach' | 'delete') => Promise<void>;
  submitting: boolean;
  error: string | null;
}

const RemoveDownlineModal: React.FC<RemoveModalProps> = ({
  isOpen,
  onClose,
  member,
  onConfirm,
  submitting,
  error,
}) => {
  if (!isOpen || !member) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            Remove Downline Member
          </h3>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-red-50 rounded-full">
              <Trash2 size={32} className="text-red-500" />
            </div>
          </div>

          <p className="text-center text-gray-700">
            Remove <span className="font-semibold">{member.name}</span> from
            your downline?
          </p>

          <div className="space-y-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p>
              <strong className="text-gray-800">Detach</strong> — they stay a
              distributor but lose their sponsor (become a root).
            </p>
            <p>
              <strong className="text-gray-800">Delete</strong> — their
              distributor profile is deleted. Their user account remains, but
              is downgraded to a customer.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onConfirm('detach')}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Detach Only'
              )}
            </button>
            <button
              onClick={() => onConfirm('delete')}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Delete'
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Page                                                           */
/* ------------------------------------------------------------------ */

const DistributorDownline: React.FC = () => {
  const { user } = useAuth();

  const [members, setMembers] = useState<DownlineMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myDistributorId, setMyDistributorId] = useState<number | null>(null);
  const [distributorName, setDistributorName] = useState<string>('');

  /* 👇 NEW — the logged-in distributor's own PBV & CGV (the true "team" numbers) */
  const [myPBV, setMyPBV] = useState<number>(0);
  const [myCGV, setMyCGV] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRank, setFilterRank] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedMember, setSelectedMember] =
    useState<DownlineMember | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);

  /* Remove flow */
  const [removeTarget, setRemoveTarget] = useState<DownlineMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  /* ---------- Load distributor + downline ---------- */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const myUserId = (user as any)?.id;
      if (!myUserId) return;

      let hierarchyResponse: any = null;
      let myDistId: number | null = null;
      let myName = 'My';
      let meObj: any = null; // the raw distributor object (for pbv/cgv)

      const hasMeEndpoint =
        typeof (distributorAPI as any).getMyHierarchy === 'function';

      if (hasMeEndpoint) {
        try {
          const meResult = await (distributorAPI as any).getMyHierarchy();
          if (meResult?.distributor) {
            meObj = meResult.distributor;
            myDistId = meObj.id;
            myName =
              meObj.name || meObj.full_name || 'My';
            hierarchyResponse = meResult.downline || [];
          } else {
            // Some backends return the hierarchy directly
            hierarchyResponse = extractChildren(meResult);
          }
        } catch (err: any) {
          if (err?.response?.status === 404) {
            setDistributorName('');
            setMyDistributorId(null);
            setMembers([]);
            setMyPBV(0);
            setMyCGV(0);
            setError(
              'You are not registered as a distributor. Please contact support.'
            );
            return;
          }
          console.warn('me/hierarchy/ failed, falling back…', err);
        }
      }

      if (myDistId === null) {
        const all = await distributorAPI.getAll();

        if (!Array.isArray(all) || all.length === 0) {
          setError(
            'Couldn’t load distributors from the server. Please try again.'
          );
          return;
        }

        const mine =
          all.find(
            (d: any) =>
              Number(getDistributorUserId(d)) === Number(myUserId)
          ) || null;

        if (!mine) {
          setDistributorName('');
          setMyDistributorId(null);
          setMembers([]);
          setMyPBV(0);
          setMyCGV(0);
          setError(
            `You are logged in as ${
              (user as any)?.email || 'unknown'
            }, but no matching distributor was found. Please contact support.`
          );
          return;
        }

        meObj = mine;
        myDistId = mine.id;
        myName =
          (mine as any).full_name ||
          (mine as any).user?.full_name ||
          (mine as any).user?.username ||
          'My';

        hierarchyResponse = await distributorAPI.getHierarchy(mine.id);
      }

      const children = extractChildren(hierarchyResponse);
      const list = flattenHierarchy(children, 1);

      setMyDistributorId(myDistId);
      setDistributorName(myName);
      setMembers(list);

      /* 👇 The real "team" totals: my own distributor record */
      setMyPBV(num(meObj?.pbv));
      setMyCGV(num(meObj?.cgv));

      setError(null);
    } catch (err: any) {
      console.error('Failed to load downline:', err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load your downline.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
    setMembers([]);
    setMyDistributorId(null);
    setDistributorName('');
    setMyPBV(0);
    setMyCGV(0);

    if (!(user as any)?.id) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ---------- Remove handler ---------- */
  const handleRemove = async (action: 'detach' | 'delete') => {
    if (!removeTarget) return;
    setRemoving(true);
    setRemoveError(null);
    try {
      const api: any = distributorAPI;
      if (typeof api.removeDownline !== 'function') {
        throw new Error('removeDownline API method not implemented yet');
      }
      await api.removeDownline(removeTarget.distributor.id, action);
      setRemoveTarget(null);
      await loadData();
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      setRemoveError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          'Failed to remove member.'
      );
    } finally {
      setRemoving(false);
    }
  };

  /* ---------- Filters ---------- */
  const ranks = useMemo(
    () => ['All', ...Array.from(new Set(members.map((m) => m.rank)))],
    [members]
  );
  const statuses = useMemo(
    () => ['All', ...Array.from(new Set(members.map((m) => m.status)))],
    [members]
  );

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRank = filterRank === 'All' || m.rank === filterRank;
      const matchesStatus =
        filterStatus === 'All' || m.status === filterStatus;
      return matchesSearch && matchesRank && matchesStatus;
    });
  }, [members, searchTerm, filterRank, filterStatus]);

  /* ---------- Stats ---------- */
  /**
   * ⚠️  IMPORTANT — read this before touching these numbers:
   *
   *  PBV (Personal Bonus Volume) = volume *you personally* sold this month.
   *    → Summing PBV across the flattened downline is valid; each member
   *      reports their own personal sales, no overlap.
   *
   *  CGV (Cumulative Group Volume) = volume of *your entire network* since
   *    the business began. Because every distributor's CGV already includes
   *    their own downline's volume, summing CGVs would double/triple count.
   *    → To get "my team's CGV" we use MY OWN distributor.cgv (set above).
   */
  const directDownlineCount = useMemo(
    () => members.filter((m) => m.level === 1).length,
    [members]
  );
  const totalDownline = members.length;
  const activeDownline = members.filter((m) => m.status === 'Active').length;

  /* Team PBV = sum of every member's personal PBV (valid = MPGV-like metric) */
  const teamPBV = useMemo(
    () => members.reduce((sum, m) => sum + m.pbv, 0),
    [members]
  );

  const existingDownlineUserIds = useMemo(
    () =>
      members
        .map((m) => getDistributorUserId(m.distributor))
        .filter((x): x is number => x !== null),
    [members]
  );

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h2 className="text-xl font-bold text-gray-800">
            Couldn’t load your downline
          </h2>
          <p className="text-gray-500 mt-2 text-sm">{error}</p>
          <Link
            to="/distributor"
            className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Downline</h1>
            <p className="text-gray-500 mt-1">
              {distributorName
                ? `Manage and monitor ${distributorName}'s team`
                : 'Manage and monitor your team members'}
            </p>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            disabled={!myDistributorId}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} />
            Invite Members
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Downline</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {totalDownline}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {directDownlineCount} direct
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Users className="text-amber-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Members</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {activeDownline}
                </h3>
              </div>
              <div className="p-2.5 bg-green-50 rounded-lg">
                <TrendingUp className="text-green-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  My PBV
                  <span className="ml-1 text-xs text-gray-400">
                    (personal, monthly)
                  </span>
                </p>
                <h3 className="text-2xl font-bold text-blue-600">
                  {myPBV.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Team: {teamPBV.toLocaleString()} BV
                </p>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Award className="text-blue-500" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  My Team CGV
                  <span className="ml-1 text-xs text-gray-400">
                    (lifetime, network)
                  </span>
                </p>
                <h3 className="text-2xl font-bold text-amber-600">
                  {myCGV.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  BV across your whole network
                </p>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <Award className="text-amber-500" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[150px]"
          >
            {ranks.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[130px]"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
          {members.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto text-gray-300" size={48} />
              <h3 className="mt-4 text-lg font-medium text-gray-600">
                No downline members yet
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Click "Invite Members" to add registered users to your team.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-amber-50/50 border-b border-amber-200/30">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        PBV
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        CGV
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/30">
                    {filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedMember(member)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xs">
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                Level {member.level}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              rankColors[member.rank] ||
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {member.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
                          {member.pbv}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">
                          {member.cgv.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[member.status] ||
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {member.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMember(member);
                              }}
                              title="View"
                            >
                              <Eye
                                size={16}
                                className="text-gray-400 hover:text-amber-600"
                              />
                            </button>
                            <button
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRemoveError(null);
                                setRemoveTarget(member);
                              }}
                              title="Remove from downline"
                            >
                              <Trash2
                                size={16}
                                className="text-gray-400 hover:text-red-600"
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
                Showing {filteredMembers.length} of {members.length} members
              </div>
            </>
          )}
        </div>

        {/* Detail modal */}
        {selectedMember && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-lg">
                    {selectedMember.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedMember.name}
                    </h3>
                    <p className="text-sm text-amber-600">
                      {selectedMember.rank} • Level {selectedMember.level}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">PBV</p>
                    <p className="text-lg font-bold text-amber-700">
                      {selectedMember.pbv}
                    </p>
                  </div>
                  <div className="bg-blue-50/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">CGV</p>
                    <p className="text-lg font-bold text-blue-700">
                      {selectedMember.cgv.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Bonus %</p>
                    <p className="text-lg font-bold text-green-700">
                      {selectedMember.bonusPercentage}%
                    </p>
                  </div>
                  <div className="bg-purple-50/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-sm font-bold text-purple-700">
                      {formatDate(selectedMember.joinDate)}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">
                    Contact Information
                  </p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm flex items-center gap-2">
                      <Mail size={16} className="text-amber-500" />
                      {selectedMember.email || '—'}
                    </p>
                    <p className="text-sm flex items-center gap-2">
                      <Phone size={16} className="text-amber-500" />
                      {selectedMember.phone || '—'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-amber-100/30 pt-4 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`mailto:${selectedMember.email}`}
                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-center"
                  >
                    Send Email
                  </a>
                  <a
                    href={`tel:${selectedMember.phone.replace(/\s/g, '')}`}
                    className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-center"
                  >
                    Call
                  </a>
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      setRemoveError(null);
                      setRemoveTarget(selectedMember);
                    }}
                    className="flex-1 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Members Modal */}
        {myDistributorId && (
          <InviteMembersModal
            isOpen={inviteOpen}
            onClose={() => setInviteOpen(false)}
            myDistributorId={myDistributorId}
            existingDownlineUserIds={existingDownlineUserIds}
            onDone={loadData}
          />
        )}

        {/* Remove Downline Modal */}
        <RemoveDownlineModal
          isOpen={!!removeTarget}
          onClose={() => {
            if (!removing) {
              setRemoveTarget(null);
              setRemoveError(null);
            }
          }}
          member={removeTarget}
          onConfirm={handleRemove}
          submitting={removing}
          error={removeError}
        />
      </div>
    </div>
  );
};

export default DistributorDownline;