// src/pages/admin/Bonuses.tsx
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
  Loader2,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';

import { bonusAPI } from '../../api/bonuses';
import { distributorAPI } from '../../api/distributors';
import { SkeletonListPage } from '../../components/common/Skeleton';
import { useAuth } from '../../context/AuthContext';
import type {
  Bonus as ApiBonus,
  BonusType,
  BonusStatus,
  Distributor,
} from '../../types';

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const BONUS_TYPES: { value: BonusType; label: string }[] = [
  { value: 'consistency', label: 'Consistency' },
  { value: 'referral', label: 'Referral' },
  { value: 'dynamic', label: 'Dynamic' },
  { value: 'training', label: 'Training' },
  { value: 'event', label: 'Event' },
  { value: 'booking', label: 'Booking' },
  { value: 'design', label: 'Design' },
  { value: 'festival', label: 'Festival' },
  { value: 'loyalty', label: 'Loyalty' },
];

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

const todayISO = () => new Date().toISOString().split('T')[0];

/* ------------------------------------------------------------------ */
/* Bonus Form Modal (create + edit)                                    */
/* ------------------------------------------------------------------ */

interface BonusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  bonus?: ApiBonus | null;
  distributors: Distributor[];
  isLoading?: boolean;
}

const BonusFormModal: React.FC<BonusFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bonus,
  distributors,
  isLoading = false,
}) => {
  const isEdit = !!bonus;

  const [formData, setFormData] = useState({
    name: '',
    type: 'consistency' as BonusType,
    amount: 0,
    distributor_id: '' as string | number,
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    year: new Date().getFullYear(),
    description: '',
    status: 'pending' as BonusStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (bonus) {
      setFormData({
        name: bonus.name,
        type: bonus.type,
        amount: num(bonus.amount),
        distributor_id: bonus.distributor,
        month: bonus.month,
        year: bonus.year,
        description: bonus.description,
        status: bonus.status,
      });
    } else {
      setFormData({
        name: '',
        type: 'consistency',
        amount: 0,
        distributor_id: '',
        month: new Date().toLocaleString('en-US', { month: 'long' }),
        year: new Date().getFullYear(),
        description: '',
        status: 'pending',
      });
    }
    setErrors({});
  }, [isOpen, bonus]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.distributor_id)
      newErrors.distributor_id = 'Select a distributor';
    if (num(formData.amount) <= 0)
      newErrors.amount = 'Amount must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: any = {
      name: formData.name.trim(),
      type: formData.type,
      amount: num(formData.amount),
      distributor: num(formData.distributor_id),
      month: formData.month,
      year: num(formData.year),
      description: formData.description.trim(),
      status: formData.status,
    };

    if (formData.status === 'paid') {
      payload.payment_date = todayISO();
    }

    await onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Edit Bonus' : 'Create Bonus'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bonus Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. January Consistency Bonus"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {BONUS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (TSh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min={0}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distributor <span className="text-red-500">*</span>
            </label>
            <select
              name="distributor_id"
              value={formData.distributor_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                errors.distributor_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select distributor</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.rank})
                </option>
              ))}
            </select>
            {errors.distributor_id && (
              <p className="text-sm text-red-500 mt-1">
                {errors.distributor_id}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <input
                type="text"
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Describe this bonus..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-amber-100/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Bonus'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bonus: ApiBonus | null;
  isLoading?: boolean;
}

const DeleteBonusModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bonus,
  isLoading = false,
}) => {
  if (!isOpen || !bonus) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Delete Bonus</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
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
            Are you sure you want to delete{' '}
            <span className="font-semibold">{bonus.name}</span>? This action
            cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Trash2 size={16} /> Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

const Bonuses: React.FC = () => {
  const { user: authUser, isLoading: authLoading } = useAuth();

  /* ---------- Data ---------- */
  const [bonuses, setBonuses] = useState<ApiBonus[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
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

  /* ---------- Selection (bulk) ---------- */
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkPaying, setBulkPaying] = useState(false);

  /* ---------- Modals ---------- */
  const [selectedBonus, setSelectedBonus] = useState<ApiBonus | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<ApiBonus | null>(null);
  const [deleteBonus, setDeleteBonus] = useState<ApiBonus | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  /* ================================================================ */
  /* Fetch                                                             */
  /* ================================================================ */

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bonusList, distList] = await Promise.all([
        bonusAPI.getAll(),
        distributorAPI.getAll(),
      ]);

      setBonuses(bonusList);
      setDistributors(distList);
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
  /* Helpers                                                           */
  /* ================================================================ */

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 3000);
  };

  const updateLocalBonus = (updated: ApiBonus) => {
    setBonuses((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    );
    if (selectedBonus?.id === updated.id) setSelectedBonus(updated);
  };

  /* ================================================================ */
  /* Status change — API call                                         */
  /* ================================================================ */

  const handleStatusChange = async (
    bonus: ApiBonus,
    newStatus: BonusStatus
  ) => {
    setStatusUpdatingId(bonus.id);
    try {
      const paymentDate =
        newStatus === 'paid' ? todayISO() : null;
      const updated = await bonusAPI.updateStatus(
        bonus.id,
        newStatus,
        paymentDate
      );
      updateLocalBonus(updated);
      showBanner(
        'success',
        `Bonus #${bonus.id} marked as ${newStatus}.`
      );
    } catch (err: any) {
      console.error('Failed to update status:', err);
      showBanner(
        'error',
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to update status.'
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  /* ================================================================ */
  /* Create / Update                                                   */
  /* ================================================================ */

  const handleSaveBonus = async (payload: any) => {
    setSaving(true);
    try {
      if (editingBonus) {
        const updated = await bonusAPI.update(editingBonus.id, payload);
        updateLocalBonus(updated);
        showBanner('success', `Bonus #${updated.id} updated.`);
      } else {
        const created = await bonusAPI.create(payload);
        setBonuses((prev) => [created, ...prev]);
        showBanner('success', `Bonus #${created.id} created.`);
      }
      setFormOpen(false);
      setEditingBonus(null);
    } catch (err: any) {
      console.error('Failed to save bonus:', err);
      showBanner(
        'error',
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          (err?.response?.data &&
            Object.values(err.response.data).flat().join(', ')) ||
          err?.message ||
          'Failed to save bonus.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================================================ */
  /* Delete                                                            */
  /* ================================================================ */

  const handleDeleteBonus = async () => {
    if (!deleteBonus) return;
    setDeleting(true);
    try {
      await bonusAPI.delete(deleteBonus.id);
      setBonuses((prev) => prev.filter((b) => b.id !== deleteBonus.id));
      if (selectedBonus?.id === deleteBonus.id) setSelectedBonus(null);
      showBanner('success', `Bonus #${deleteBonus.id} deleted.`);
      setDeleteBonus(null);
    } catch (err: any) {
      console.error('Failed to delete bonus:', err);
      showBanner(
        'error',
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to delete bonus.'
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ================================================================ */
  /* Bulk pay                                                          */
  /* ================================================================ */

  const handleBulkPay = async () => {
    if (selectedIds.length === 0) return;
    setBulkPaying(true);
    try {
      const updated = await bonusAPI.bulkMarkPaid(selectedIds);
      setBonuses((prev) =>
        prev.map((b) => updated.find((u) => u.id === b.id) || b)
      );
      showBanner(
        'success',
        `${updated.length} bonus(es) marked as paid.`
      );
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to bulk pay:', err);
      showBanner(
        'error',
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to mark bonuses as paid.'
      );
    } finally {
      setBulkPaying(false);
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
        filterStatus === 'All' ||
        capitalize(b.status) === filterStatus;
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
  /* Selection helpers                                                 */
  /* ================================================================ */

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBonuses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBonuses.map((b) => b.id));
    }
  };

  const allSelected =
    filteredBonuses.length > 0 &&
    selectedIds.length === filteredBonuses.length;

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
          <h1 className="text-2xl font-bold text-gray-800">Bonuses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track all distributor bonuses, mark payments, and manage CRUD
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
          <button
            onClick={() => {
              setEditingBonus(null);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
          >
            <Plus size={16} />
            New Bonus
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

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-amber-800 font-medium">
            {selectedIds.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkPay}
              disabled={bulkPaying}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 text-sm font-medium"
            >
              {bulkPaying ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              Mark as Paid
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear
            </button>
          </div>
        </div>
      )}

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
              ? 'Click "New Bonus" to create the first one.'
              : 'Try adjusting search or filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-amber-500"
            />
            <span>Select all ({filteredBonuses.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBonuses.map((b) => {
              const cfg = typeConfig[b.type];
              const isSelected = selectedIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow cursor-pointer group ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-200'
                      : 'border-amber-200/30'
                  }`}
                  onClick={() => setSelectedBonus(b)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleSelect(b.id)}
                        className="w-4 h-4 accent-amber-500"
                      />
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

                  <div className="mt-3 pt-3 border-t border-amber-100/30 flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        statusStyles[b.status]
                      }`}
                    >
                      {capitalize(b.status)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBonus(b);
                          setFormOpen(true);
                        }}
                        className="p-1.5 hover:bg-amber-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit size={14} className="text-gray-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteBonus(b);
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

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
                <p className="text-xs text-gray-400 mt-1 capitalize">
                  {selectedBonus.status}
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
                      <span className="capitalize">
                        {selectedBonus.type}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Period:</span>{' '}
                      {selectedBonus.month} {selectedBonus.year}
                    </p>
                    {selectedBonus.payment_date && (
                      <p className="text-sm">
                        <span className="text-gray-500">
                          Payment Date:
                        </span>{' '}
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

              <div className="border-t border-amber-100/30 pt-4">
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Change Status
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedBonus, s)}
                      disabled={
                        selectedBonus.status === s ||
                        statusUpdatingId === selectedBonus.id
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 capitalize border ${statusStyles[s]}`}
                    >
                      {statusUpdatingId === selectedBonus.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin mx-auto"
                        />
                      ) : (
                        s
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button
                  onClick={() => {
                    setEditingBonus(selectedBonus);
                    setFormOpen(true);
                    setSelectedBonus(null);
                  }}
                  className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteBonus(selectedBonus);
                    setSelectedBonus(null);
                  }}
                  className="flex-1 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <BonusFormModal
        isOpen={formOpen}
        onClose={() => {
          if (!saving) {
            setFormOpen(false);
            setEditingBonus(null);
          }
        }}
        onSave={handleSaveBonus}
        bonus={editingBonus}
        distributors={distributors}
        isLoading={saving}
      />

      {/* Delete Modal */}
      <DeleteBonusModal
        isOpen={!!deleteBonus}
        onClose={() => {
          if (!deleting) setDeleteBonus(null);
        }}
        onConfirm={handleDeleteBonus}
        bonus={deleteBonus}
        isLoading={deleting}
      />
    </div>
  );
};

export default Bonuses;