// src/pages/admin/Shops.tsx
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Store,
  MapPin,
  TrendingUp,
  DollarSign,
  Star,
  Crown,
  Award,
  Eye,
  Edit,
  Trash2,
  Plus,
  Loader2,
  X,
  Save,
  AlertCircle,
  RefreshCw,
  Info,
} from 'lucide-react';

import { shopAPI } from '../../api/shops';
import { distributorAPI } from '../../api/distributors';
import type { Shop as ApiShop, Distributor } from '../../types';

/* ------------------------------------------------------------------ */
/* Local types                                                         */
/* ------------------------------------------------------------------ */

type PerformanceLevel =
  | 'Seed'
  | 'Bloom'
  | 'Garden'
  | 'Emerald'
  | 'Diamond'
  | 'Crown'
  | 'Gold Crown';

type ShopStatus = 'active' | 'inactive' | 'pending';

interface DisplayShop {
  id: number;
  distributorId: number | null;
  name: string;
  owner: string;
  ownerAvatar: string;
  location: string;
  region: string;
  country: string;

  // Read-only, auto-computed by the backend
  performanceLevel: PerformanceLevel;
  bonusPercentage: number;
  ownerBv: number;

  // Editable business fields
  monthlyRevenue: number;
  rating: number;
  status: ShopStatus;
  established: string;
  phone: string;
  email: string;
}

interface ShopFormData {
  name: string;
  location: string;
  region: string;
  country: string;
  phone: string;
  email: string;
  monthly_revenue: string;
  rating: string;
  status: ShopStatus;
  established_date: string;
  distributor: number | null;
}

const emptyForm: ShopFormData = {
  name: '',
  location: '',
  region: '',
  country: 'Tanzania',
  phone: '',
  email: '',
  monthly_revenue: '0',
  rating: '0',
  status: 'pending',
  established_date: new Date().toISOString().split('T')[0],
  distributor: null,
};

/* ------------------------------------------------------------------ */
/* Performance config + status colors                                  */
/* ------------------------------------------------------------------ */

const performanceConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bgColor: string }
> = {
  'Gold Crown': {
    color: 'text-amber-600',
    icon: <Crown size={16} />,
    bgColor: 'bg-amber-50 border-amber-200',
  },
  Crown: {
    color: 'text-purple-600',
    icon: <Crown size={16} />,
    bgColor: 'bg-purple-50 border-purple-200',
  },
  Diamond: {
    color: 'text-blue-600',
    icon: <Star size={16} />,
    bgColor: 'bg-blue-50 border-blue-200',
  },
  Emerald: {
    color: 'text-emerald-600',
    icon: <Award size={16} />,
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  Garden: {
    color: 'text-green-600',
    icon: <Store size={16} />,
    bgColor: 'bg-green-50 border-green-200',
  },
  Bloom: {
    color: 'text-rose-600',
    icon: <Store size={16} />,
    bgColor: 'bg-rose-50 border-rose-200',
  },
  Seed: {
    color: 'text-gray-600',
    icon: <Store size={16} />,
    bgColor: 'bg-gray-50 border-gray-200',
  },
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const formatTSh = (n: number) =>
  `TSh ${Number(n || 0).toLocaleString()}`;

/* ------------------------------------------------------------------ */
/* Transform API -> Display                                            */
/* ------------------------------------------------------------------ */

const toDisplayShop = (s: ApiShop): DisplayShop => {
  const ownerName = s.distributor_name || 'Unassigned';
  return {
    id: s.id,
    distributorId: s.distributor ?? null,
    name: s.name,
    owner: ownerName,
    ownerAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      ownerName
    )}&background=amber&color=fff`,
    location: s.location,
    region: s.region,
    country: s.country,
    performanceLevel: s.performance_level as PerformanceLevel,
    bonusPercentage: Number(s.bonus_percentage ?? 0),
    ownerBv: Number((s as any).owner_bv ?? 0),
    monthlyRevenue: Number(s.monthly_revenue ?? 0),
    rating: Number(s.rating ?? 0),
    status: s.status,
    established: s.established_date,
    phone: s.phone || '',
    email: s.email || '',
  };
};

/* ------------------------------------------------------------------ */
/* Shop Form Modal                                                     */
/* ------------------------------------------------------------------ */

interface ShopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShopFormData) => Promise<void>;
  initialData?: ShopFormData | null;
  distributors: Distributor[];
  isLoading?: boolean;
  mode: 'add' | 'edit';
  currentLevel?: PerformanceLevel;
  currentBonus?: number;
  currentOwnerBv?: number;
}

const ShopFormModal: React.FC<ShopFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  distributors,
  isLoading = false,
  mode,
  currentLevel,
  currentBonus,
  currentOwnerBv,
}) => {
  const [form, setForm] = useState<ShopFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ?? emptyForm);
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDistributorChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      distributor: e.target.value ? Number(e.target.value) : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.location) newErrors.location = 'Location is required';
    if (!form.region) newErrors.region = 'Region is required';
    if (!form.country) newErrors.country = 'Country is required';
    if (!form.phone) newErrors.phone = 'Phone is required';
    if (!form.established_date) newErrors.established_date = 'Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error('Save shop failed:', err);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
      errors[field] ? 'border-red-500' : 'border-gray-300'
    }`;

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
          <h3 className="text-xl font-bold text-gray-800">
            {mode === 'add' ? 'Add New Shop' : 'Edit Shop'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Shop Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass('name')}
              placeholder="OMA Flowers - Dar es Salaam"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Distributor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distributor (Owner)
            </label>
            <select
              value={form.distributor ?? ''}
              onChange={handleDistributorChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            >
              <option value="">None</option>
              {distributors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} ({d.rank})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Performance, owner BV, and level are auto-computed from this
              owner's activity.
            </p>
          </div>

          {/* Location + Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (City) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className={inputClass('location')}
                placeholder="Dar es Salaam"
              />
              {errors.location && (
                <p className="text-sm text-red-500 mt-1">{errors.location}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="region"
                value={form.region}
                onChange={handleChange}
                className={inputClass('region')}
                placeholder="Kinondoni"
              />
              {errors.region && (
                <p className="text-sm text-red-500 mt-1">{errors.region}</p>
              )}
            </div>
          </div>

          {/* Country + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className={inputClass('country')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass('phone')}
                placeholder="+255 712 345 678"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="shop@omaflowers.com"
            />
          </div>

          {/* Status + Established */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Established Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="established_date"
                value={form.established_date}
                onChange={handleChange}
                className={inputClass('established_date')}
              />
              {errors.established_date && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.established_date}
                </p>
              )}
            </div>
          </div>

          {/* Auto-computed info */}
          {mode === 'edit' && currentLevel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-blue-600" />
                <p className="text-sm font-medium text-blue-800">
                  Auto-computed from owner's activity
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-500">Owner BV</p>
                  <p className="font-bold text-blue-700">
                    {currentOwnerBv ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Level</p>
                  <p className="font-bold text-blue-700">{currentLevel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bonus</p>
                  <p className="font-bold text-blue-700">
                    {currentBonus ?? 0}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-blue-600">
                Changing the owner triggers a recompute on save.
              </p>
            </div>
          )}

          {/* Editable metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Revenue
              </label>
              <input
                type="number"
                name="monthly_revenue"
                value={form.monthly_revenue}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <input
                type="number"
                step="0.01"
                max="5"
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-amber-100/30">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  {mode === 'add' ? 'Add Shop' : 'Save Changes'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Delete Shop Modal                                                   */
/* ------------------------------------------------------------------ */

interface DeleteShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  shopName: string;
  isLoading?: boolean;
}

const DeleteShopModal: React.FC<DeleteShopModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  shopName,
  isLoading = false,
}) => {
  if (!isOpen) return null;
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
          <h3 className="text-xl font-bold text-gray-800">Delete Shop</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-red-50 rounded-full">
              <Trash2 size={32} className="text-red-500" />
            </div>
          </div>
          <p className="text-center text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{shopName}</span>?
          </p>
          <p className="text-center text-sm text-gray-500 mt-1">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  Delete
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
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

const Shops: React.FC = () => {
  /* ---------- Data ---------- */
  const [shops, setShops] = useState<DisplayShop[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Filters ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  /* ---------- Modals ---------- */
  const [selectedShop, setSelectedShop] = useState<DisplayShop | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  /* ---------- Load shops ---------- */
  const loadShops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await shopAPI.getAll();
      const data = Array.isArray(response)
        ? response
        : (response as any).results || [];
      setShops(data.map(toDisplayShop));
    } catch (err: any) {
      console.error('Failed to load shops:', err);
      let msg = 'Failed to load shops.';
      if (err?.response?.data?.detail) msg = err.response.data.detail;
      else if (err?.message) msg = err.message;
      setError(msg);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Load distributors ---------- */
  const loadDistributors = async () => {
    try {
      const data = await distributorAPI.getAll();
      setDistributors(
        Array.isArray(data) ? data : (data as any)?.results || []
      );
    } catch (err) {
      console.error('Failed to load distributors:', err);
      setDistributors([]);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    if (addModalOpen || editModalOpen) {
      loadDistributors();
    }
  }, [addModalOpen, editModalOpen]);

  /* ---------- CRUD ---------- */

  const handleAddShop = async (form: ShopFormData) => {
    setIsSubmitting(true);
    try {
      await shopAPI.create({
        name: form.name,
        location: form.location,
        region: form.region,
        country: form.country,
        phone: form.phone,
        email: form.email || null,
        monthly_revenue: Number(form.monthly_revenue) || 0,
        rating: Number(form.rating) || 0,
        status: form.status,
        established_date: form.established_date,
        distributor: form.distributor,
      } as any);
      await loadShops();
      setAddModalOpen(false);
    } catch (err: any) {
      console.error('Add shop failed:', err);
      const message =
        err?.response?.data?.error ||
        (err?.response?.data &&
          Object.values(err.response.data).flat().join(', ')) ||
        'Failed to create shop.';
      alert(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditShop = async (form: ShopFormData) => {
    if (!selectedShop) return;
    setIsSubmitting(true);
    try {
      await shopAPI.update(selectedShop.id, {
        name: form.name,
        location: form.location,
        region: form.region,
        country: form.country,
        phone: form.phone,
        email: form.email || null,
        monthly_revenue: Number(form.monthly_revenue) || 0,
        rating: Number(form.rating) || 0,
        status: form.status,
        established_date: form.established_date,
        distributor: form.distributor,
      } as any);
      await loadShops();
      setEditModalOpen(false);
      setSelectedShop(null);
    } catch (err: any) {
      console.error('Edit shop failed:', err);
      const message =
        err?.response?.data?.error ||
        (err?.response?.data &&
          Object.values(err.response.data).flat().join(', ')) ||
        'Failed to update shop.';
      alert(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShop = async () => {
    if (!selectedShop) return;
    setIsSubmitting(true);
    try {
      await shopAPI.delete(selectedShop.id);
      await loadShops();
      setDeleteModalOpen(false);
      setSelectedShop(null);
    } catch (err) {
      console.error('Delete shop failed:', err);
      alert('Failed to delete shop.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecalculateAll = async () => {
    if (
      !window.confirm(
        'Recalculate owner BV and performance for every shop? This may take a moment.'
      )
    ) {
      return;
    }
    setIsRecalculating(true);
    try {
      await shopAPI.recomputePerformance();
      await loadShops();
    } catch (err) {
      console.error('Recalculate failed:', err);
      alert('Failed to recalculate performance.');
    } finally {
      setIsRecalculating(false);
    }
  };

  /* ---------- Derived ---------- */

  const levels = [
    'All',
    ...Array.from(new Set(shops.map((s) => s.performanceLevel))),
  ];
  const statuses = [
    'All',
    ...Array.from(new Set(shops.map((s) => s.status))),
  ];

  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel =
      filterLevel === 'All' || s.performanceLevel === filterLevel;
    const matchesStatus =
      filterStatus === 'All' || s.status === filterStatus;
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const totalShops = shops.length;
  const activeShops = shops.filter((s) => s.status === 'active').length;
  const totalOwnerBv = shops.reduce((sum, s) => sum + s.ownerBv, 0);
  const totalRevenue = shops.reduce((sum, s) => sum + s.monthlyRevenue, 0);

  const editInitialData: ShopFormData | null = selectedShop
    ? {
        name: selectedShop.name,
        location: selectedShop.location,
        region: selectedShop.region,
        country: selectedShop.country,
        phone: selectedShop.phone,
        email: selectedShop.email,
        monthly_revenue: selectedShop.monthlyRevenue.toString(),
        rating: selectedShop.rating.toString(),
        status: selectedShop.status,
        established_date: selectedShop.established,
        distributor: selectedShop.distributorId,
      }
    : null;

  /* ---------- Loading screen ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">OMA Shops</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all OMA Flowers shop locations
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleRecalculateAll}
            disabled={isRecalculating}
            className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium disabled:opacity-50"
            title="Recompute every shop's owner BV and level"
          >
            {isRecalculating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Recalc Performance
          </button>
          <button
            onClick={loadShops}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
          >
            <Plus size={16} />
            Add Shop
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 text-sm flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Shops</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {totalShops}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Store className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Shops</p>
              <h3 className="text-2xl font-bold text-green-600">
                {activeShops}
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
              <p className="text-sm text-gray-500">Total Owner BV</p>
              <h3 className="text-2xl font-bold text-blue-600">
                {totalOwnerBv.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Award className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-purple-600">
                {formatTSh(totalRevenue)}
              </h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <DollarSign className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            Performance Levels:
          </span>
          {Object.entries(performanceConfig).map(([level, config]) => (
            <div
              key={level}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${config.bgColor}`}
            >
              {config.icon}
              <span className={`text-xs font-medium ${config.color}`}>
                {level}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Levels are auto-computed from the owner's product BV.
        </p>
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
            placeholder="Search by shop name, owner, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[150px]"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
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
              {capitalize(status)}
            </option>
          ))}
        </select>
        <button
          onClick={loadShops}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Grid */}
      {filteredShops.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-12 text-center">
          <Store className="mx-auto text-gray-300" size={48} />
          <h3 className="mt-4 text-lg font-medium text-gray-600">
            No shops found
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            {searchTerm || filterLevel !== 'All' || filterStatus !== 'All'
              ? 'Try adjusting your filters'
              : 'Add your first shop to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShops.map((shop) => {
            const config =
              performanceConfig[shop.performanceLevel] ||
              performanceConfig.Seed;
            return (
              <div
                key={shop.id}
                className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedShop(shop);
                  setViewModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-lg border ${config.bgColor}`}
                    >
                      <span className={config.color}>{config.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm truncate">
                        {shop.name}
                      </h3>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin size={12} /> {shop.location}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[shop.status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {capitalize(shop.status)}
                  </span>
                </div>

                {/* Owner BV · Revenue · Bonus */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-amber-50/50 rounded-lg">
                    <p className="text-xs text-gray-500">Owner BV</p>
                    <p className="text-sm font-bold text-amber-600">
                      {shop.ownerBv.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-blue-50/50 rounded-lg">
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatTSh(shop.monthlyRevenue)}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-green-50/50 rounded-lg">
                    <p className="text-xs text-gray-500">Bonus</p>
                    <p className="text-sm font-bold text-green-600">
                      {shop.bonusPercentage}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-100/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={shop.ownerAvatar}
                      alt={shop.owner}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-gray-600 truncate">
                      {shop.owner}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star
                      size={14}
                      className="text-yellow-400 fill-yellow-400"
                    />
                    <span className="text-xs font-medium text-gray-600">
                      {shop.rating}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-100/30 flex items-center justify-end gap-1">
                  <button
                    className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShop(shop);
                      setViewModalOpen(true);
                    }}
                    title="View"
                  >
                    <Eye
                      size={16}
                      className="text-gray-400 hover:text-amber-600"
                    />
                  </button>
                  <button
                    className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShop(shop);
                      setEditModalOpen(true);
                    }}
                    title="Edit"
                  >
                    <Edit
                      size={16}
                      className="text-gray-400 hover:text-amber-600"
                    />
                  </button>
                  <button
                    className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShop(shop);
                      setDeleteModalOpen(true);
                    }}
                    title="Delete"
                  >
                    <Trash2
                      size={16}
                      className="text-gray-400 hover:text-red-600"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details Modal */}
      {viewModalOpen && selectedShop && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setViewModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedShop.name}
                </h3>
                <p className="text-sm text-amber-600 flex items-center gap-1">
                  <MapPin size={16} /> {selectedShop.location},{' '}
                  {selectedShop.region}
                </p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  performanceConfig[selectedShop.performanceLevel]?.bgColor
                }`}
              >
                {performanceConfig[selectedShop.performanceLevel]?.icon}
                <div>
                  <p className="text-sm font-medium">
                    {selectedShop.performanceLevel}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedShop.bonusPercentage}% Bonus Rate
                  </p>
                </div>
                <span
                  className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[selectedShop.status]
                  }`}
                >
                  {capitalize(selectedShop.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Owner BV</p>
                  <p className="text-lg font-bold text-amber-600">
                    {selectedShop.ownerBv.toLocaleString()}
                  </p>
                </div>
                <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Monthly Revenue</p>
                  <p className="text-lg font-bold text-amber-600">
                    {formatTSh(selectedShop.monthlyRevenue)}
                  </p>
                </div>
                <div className="bg-green-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Bonus</p>
                  <p className="text-lg font-bold text-green-600">
                    {selectedShop.bonusPercentage}%
                  </p>
                </div>
                <div className="bg-yellow-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {selectedShop.rating} ★
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Shop Owner</p>
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={selectedShop.ownerAvatar}
                    alt={selectedShop.owner}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selectedShop.owner}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedShop.phone}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedShop.email || 'No email'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-500">City:</span>{' '}
                      {selectedShop.location}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Region:</span>{' '}
                      {selectedShop.region}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Country:</span>{' '}
                      {selectedShop.country}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Shop Information
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-500">Established:</span>{' '}
                      {selectedShop.established}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Status:</span>{' '}
                      {capitalize(selectedShop.status)}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Performance:</span>{' '}
                      {selectedShop.performanceLevel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setEditModalOpen(true);
                  }}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Edit Shop
                </button>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <ShopFormModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddShop}
        distributors={distributors}
        isLoading={isSubmitting}
        mode="add"
      />

      {/* Edit Modal */}
      <ShopFormModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedShop(null);
        }}
        onSave={handleEditShop}
        initialData={editInitialData}
        distributors={distributors}
        isLoading={isSubmitting}
        mode="edit"
        currentLevel={selectedShop?.performanceLevel}
        currentBonus={selectedShop?.bonusPercentage}
        currentOwnerBv={selectedShop?.ownerBv}
      />

      {/* Delete Modal */}
      <DeleteShopModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedShop(null);
        }}
        onConfirm={handleDeleteShop}
        shopName={selectedShop?.name || ''}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Shops;