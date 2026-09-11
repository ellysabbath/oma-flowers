// src/pages/admin/Orders.tsx — full file with empty-cart filtering

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  MapPin,
  Loader2,
  X,
  User2Icon,
  RefreshCw,
  ShoppingCart,
  Store,
  Award,
  Copy,
  Check,
  EyeOff,       // 👈 NEW
} from 'lucide-react';

import { cartAPI } from '../../api/cart';
import { productAPI } from '../../api/products';
import { userAPI } from '../../api/users';
import { distributorAPI } from '../../api/distributors';

import type {
  Cart as ApiCart,
  CartItem as ApiCartItem,
  Product,
  User as UserType,
  Distributor,
} from '../../types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface SellerPBV {
  sellerId: number | null;
  sellerName: string;
  sellerRank: string | null;
  sellerBonusPercentage: number | null;
  totalBV: number;
  totalPBV: number;
  totalAmount: number;
  itemsCount: number;
  items: {
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    price: number;
    bv: number;
    subtotal: number;
    pbv: number;
  }[];
}

interface DisplayCart {
  id: number;
  code: string;
  sessionKey: string | null;
  customerId: number | null;
  distributorId: number | null;
  shopId: number | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
  };
  items: {
    productId: number;
    productName: string;
    productCode: string;
    productImage: string | null;
    quantity: number;
    price: number;
    bv: number;
    subtotal: number;
    sellerId: number | null;
    sellerName: string | null;
    sellerRank: string | null;
  }[];
  sellers: SellerPBV[];
  subtotal: number;
  totalBV: number;
  totalPBV: number;
  totalItems: number;
  status: 'Active' | 'Converted' | 'Abandoned' | 'Expired';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  distributor?: string;
  shopName?: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  Active: 'bg-blue-100 text-blue-700 border-blue-300',
  Converted: 'bg-green-100 text-green-700 border-green-300',
  Abandoned: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  Expired: 'bg-red-100 text-red-700 border-red-300',
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return iso;
  }
};

/* ------------------------------------------------------------------ */
/* PBV Helper                                                          */
/* ------------------------------------------------------------------ */

const calcPBV = (
  bv: number,
  bonusPercentage: number | null | undefined
): number => {
  const pct = num(bonusPercentage);
  if (!pct || pct <= 0) return bv;
  return Math.round(bv * (pct / 100));
};

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
      // ignore
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

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Orders: React.FC = () => {
  const [carts, setCarts] = useState<DisplayCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // 👈 NEW — toggle to show/hide empty carts
  const [hideEmpty, setHideEmpty] = useState(true);

  const [selectedCart, setSelectedCart] = useState<DisplayCart | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [customers, setCustomers] = useState<UserType[]>([]);
  const [distributorsList, setDistributorsList] = useState<Distributor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingDistributors, setLoadingDistributors] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  interface CartFormData {
    user_id: number | null;
    distributor_id: number | null;
    session_key: string;
    notes: string;
    items: {
      product: number;
      quantity: number;
      price: number;
      bv: number;
    }[];
  }

  const emptyForm: CartFormData = {
    user_id: null,
    distributor_id: null,
    session_key: '',
    notes: '',
    items: [],
  };
  const [formData, setFormData] = useState<CartFormData>(emptyForm);

  /* ================================================================== */
  /* Loaders                                                             */
  /* ================================================================== */

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response: any = await userAPI.getCustomers();
      const data: UserType[] = Array.isArray(response)
        ? response
        : response?.results || [];
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadDistributors = async () => {
    setLoadingDistributors(true);
    try {
      const data = await distributorAPI.getAll();
      setDistributorsList(
        Array.isArray(data) ? data : (data as any)?.results || []
      );
    } catch (err) {
      console.error('Failed to load distributors:', err);
      setDistributorsList([]);
    } finally {
      setLoadingDistributors(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response: any = await productAPI.getAll();
      const data: Product[] = Array.isArray(response)
        ? response
        : response?.results || [];
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadAllDropdowns = async () => {
    await Promise.all([loadCustomers(), loadDistributors(), loadProducts()]);
  };

  /* ================================================================== */
  /* Fetch carts                                                         */
  /* ================================================================== */

  const fetchCarts = async () => {
    try {
      setLoading(true);
      setError(null);

      const list = await cartAPI.getAll();
      const rawCarts: ApiCart[] = Array.isArray(list) ? list : [];

      const transformed: DisplayCart[] = rawCarts.map((cart) => {
        const user = cart.user as any;
        const customerId = user?.id ?? null;
        const customerName =
          user?.full_name || user?.username || 'Guest';
        const customerEmail = user?.email || '';
        const customerPhone = user?.mobile_number || user?.phone || '';

        const distributor = cart.distributor as any;
        const distributorId = distributor?.id ?? null;
        const distributorName = distributor?.full_name || undefined;

        const shop = cart.shop as any;
        const shopId = shop?.id ?? null;
        const shopName = shop?.name || undefined;

        const items = (cart.items || []).map((item: ApiCartItem) => {
          const price = num(item.price);
          const subtotal = num(item.subtotal ?? price * item.quantity);
          return {
            productId: item.product,
            productName: item.product_name || 'Unknown Product',
            productCode: item.product_sku || '',
            productImage: item.product_picture || null,
            quantity: item.quantity,
            price,
            bv: item.bv || 0,
            subtotal,
            sellerId: (item as any).seller_id ?? null,
            sellerName: (item as any).seller_name ?? null,
            sellerRank: (item as any).seller_rank ?? null,
          };
        });

        const sellerMap = new Map<string, SellerPBV>();

        items.forEach((item) => {
          const key =
            item.sellerId != null ? `id-${item.sellerId}` : 'unassigned';
          const sellerBonus =
            (cart as any)?.distributor_bonus_percentage ?? null;

          if (!sellerMap.has(key)) {
            sellerMap.set(key, {
              sellerId: item.sellerId,
              sellerName: item.sellerName || 'Unassigned Seller',
              sellerRank: item.sellerRank || null,
              sellerBonusPercentage: sellerBonus,
              totalBV: 0,
              totalPBV: 0,
              totalAmount: 0,
              itemsCount: 0,
              items: [],
            });
          }

          const entry = sellerMap.get(key)!;
          const pbv = calcPBV(item.bv * item.quantity, sellerBonus);

          entry.totalBV += item.bv * item.quantity;
          entry.totalPBV += pbv;
          entry.totalAmount += item.subtotal;
          entry.itemsCount += item.quantity;
          entry.items.push({
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode,
            quantity: item.quantity,
            price: item.price,
            bv: item.bv,
            subtotal: item.subtotal,
            pbv,
          });
        });

        const sellers = Array.from(sellerMap.values());

        const subtotal = num(cart.subtotal);
        const totalBV = num(cart.total_bv);
        const totalPBV = sellers.reduce((s, x) => s + x.totalPBV, 0);
        const totalItems =
          cart.total_items ?? items.reduce((s, i) => s + i.quantity, 0);

        return {
          id: cart.id,
          code: (cart as any).code || `#${cart.id}`,
          sessionKey: cart.session_key,
          customerId,
          distributorId,
          shopId,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              customerName
            )}&background=amber&color=fff`,
          },
          items,
          sellers,
          subtotal,
          totalBV,
          totalPBV,
          totalItems,
          status: capitalize(cart.status) as DisplayCart['status'],
          createdAt: formatDate(cart.created_at),
          updatedAt: formatDate(cart.updated_at),
          notes: cart.notes || undefined,
          distributor: distributorName,
          shopName,
        };
      });

      setCarts(transformed);
    } catch (err) {
      console.error('Failed to fetch carts:', err);
      setError('Failed to load carts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Effects                                                             */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchCarts();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      loadAllDropdowns();
    }
  }, [showCreateModal]);

  /* ------------------------------------------------------------------ */
  /* Handlers                                                            */
  /* ------------------------------------------------------------------ */

  const handleStatusUpdate = async (cartId: number, newStatus: string) => {
    try {
      await cartAPI.patch(cartId, { status: newStatus.toLowerCase() as any });
      setCarts((prev) =>
        prev.map((c) =>
          c.id === cartId
            ? { ...c, status: newStatus as DisplayCart['status'] }
            : c
        )
      );
      if (selectedCart && selectedCart.id === cartId) {
        setSelectedCart((prev) =>
          prev ? { ...prev, status: newStatus as DisplayCart['status'] } : null
        );
      }
    } catch (err) {
      console.error('Failed to update cart status:', err);
      alert('Failed to update cart status. Please try again.');
    }
  };

  const handleDeleteCart = async (cartId: number) => {
    if (!window.confirm('Are you sure you want to delete this cart?')) return;
    try {
      await cartAPI.delete(cartId);
      setCarts((prev) => prev.filter((c) => c.id !== cartId));
      if (selectedCart && selectedCart.id === cartId) {
        setSelectedCart(null);
      }
    } catch (err) {
      console.error('Failed to delete cart:', err);
      alert('Failed to delete cart. Please try again.');
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product: 0, quantity: 1, price: 0, bv: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      if (field === 'product') {
        const selected = products.find((p) => p.id === Number(value));
        if (selected) {
          updated[index] = {
            ...updated[index],
            product: selected.id,
            price: Number(selected.effective_price ?? 0),
            bv: Number(selected.effective_bv ?? 0),
          };
        } else {
          updated[index] = { ...updated[index], product: 0 };
        }
      } else {
        updated[index] = { ...updated[index], [field]: Number(value) };
      }
      return { ...prev, items: updated };
    });
  };

  const handleSubmitCart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id && !formData.session_key) {
      alert('Please select a customer or provide a guest session key');
      return;
    }
    if (formData.items.length === 0) {
      alert('Please add at least one product');
      return;
    }
    if (formData.items.some((i) => i.product === 0 || i.quantity < 1)) {
      alert('Please fill in all product fields correctly');
      return;
    }

    try {
      setSubmitting(true);

      const createdCart = await cartAPI.create({
        user_id: formData.user_id,
        distributor_id: formData.distributor_id,
        session_key: formData.session_key || null,
        status: 'active',
        notes: formData.notes,
      } as any);

      for (const item of formData.items) {
        await cartAPI.addItem(createdCart.id, {
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          bv: item.bv,
        });
      }

      setFormData(emptyForm);
      setShowCreateModal(false);
      await fetchCarts();
    } catch (err: any) {
      console.error('Failed to create cart:', err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        (err?.response?.data &&
          Object.values(err.response.data).flat().join(', ')) ||
        'Failed to create cart. Please try again.';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Derived                                                             */
  /* ------------------------------------------------------------------ */

  // Carts that actually have items
  const nonEmptyCarts = useMemo(
    () => carts.filter((c) => c.items.length > 0),
    [carts]
  );

  // Apply hideEmpty + search + status filters
  const filteredCarts = useMemo(() => {
    const base = hideEmpty ? nonEmptyCarts : carts;
    return base.filter((c) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.customer.name.toLowerCase().includes(q) ||
        c.customer.email.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.sessionKey?.toLowerCase().includes(q) ?? false);
      const matchesStatus =
        filterStatus === 'All' || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [carts, nonEmptyCarts, hideEmpty, searchTerm, filterStatus]);

  const totalCarts = carts.length;
  const nonEmptyCount = nonEmptyCarts.length;
  const emptyCount = totalCarts - nonEmptyCount;

  const activeCarts = carts.filter((c) => c.status === 'Active').length;
  const convertedCarts = carts.filter((c) => c.status === 'Converted').length;
  const abandonedCarts = carts.filter((c) => c.status === 'Abandoned').length;

  // 👈 Stat totals only count carts with items (avoids empty-cart noise)
  const statsBase = hideEmpty ? nonEmptyCarts : carts;
  const totalValue = statsBase.reduce((s, c) => s + c.subtotal, 0);
  const totalBV = statsBase.reduce((s, c) => s + c.totalBV, 0);
  const totalPBV = statsBase.reduce((s, c) => s + c.totalPBV, 0);

  /* ------------------------------------------------------------------ */
  /* Loading / error                                                     */
  /* ------------------------------------------------------------------ */

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
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchCarts()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Carts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage shopping carts and track seller PBV
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
        >
          <ShoppingCart size={16} />
          Create Cart
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={hideEmpty ? 'Active Carts' : 'Total Carts'}
          value={hideEmpty ? nonEmptyCount : totalCarts}
          icon={<ShoppingCart className="text-amber-500" size={20} />}
          bg="bg-amber-50"
        />
        <StatCard
          label="Active"
          value={activeCarts}
          valueClass="text-blue-600"
          icon={<Clock className="text-blue-500" size={20} />}
          bg="bg-blue-50"
        />
        <StatCard
          label="Converted"
          value={convertedCarts}
          valueClass="text-green-600"
          icon={<CheckCircle className="text-green-500" size={20} />}
          bg="bg-green-50"
        />
        <StatCard
          label="Abandoned"
          value={abandonedCarts}
          valueClass="text-yellow-600"
          icon={<AlertCircle className="text-yellow-500" size={20} />}
          bg="bg-yellow-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Total Cart Value"
          value={`TSh ${totalValue.toLocaleString()}`}
          valueClass="text-green-600"
          icon={<DollarSign className="text-green-500" size={20} />}
          bg="bg-green-50"
        />
        <StatCard
          label="Total BV"
          value={totalBV}
          valueClass="text-purple-600"
          icon={<Package className="text-purple-500" size={20} />}
          bg="bg-purple-50"
        />
        <StatCard
          label="Total PBV"
          value={totalPBV}
          valueClass="text-amber-600"
          icon={<Award className="text-amber-500" size={20} />}
          bg="bg-amber-50"
        />
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
            placeholder="Search by cart code, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>

        {/* 👈 NEW — toggle: hide empty carts */}
        <button
          type="button"
          onClick={() => setHideEmpty((v) => !v)}
          className={`px-4 py-2.5 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            hideEmpty
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
          title={
            hideEmpty
              ? `Showing only carts with items (${nonEmptyCount})`
              : `Showing all carts, including empty (${emptyCount} empty)`
          }
        >
          <EyeOff size={16} />
          {hideEmpty ? `Active Only (${nonEmptyCount})` : `All (${totalCarts})`}
        </button>

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
          onClick={() => fetchCarts()}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        {filteredCarts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">
              {hideEmpty && emptyCount > 0
                ? 'No carts with items yet'
                : 'No carts found'}
            </p>
            <p className="text-sm">
              {hideEmpty && emptyCount > 0 ? (
                <>
                  {emptyCount} empty cart
                  {emptyCount === 1 ? '' : 's'} hidden.{' '}
                  <button
                    onClick={() => setHideEmpty(false)}
                    className="text-amber-600 underline hover:text-amber-700"
                  >
                    Show all
                  </button>
                </>
              ) : (
                'Carts will appear here once customers start shopping.'
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50/50 border-b border-amber-200/30">
                    <Th>Cart</Th>
                    <Th>Customer</Th>
                    <Th className="hidden md:table-cell">Items</Th>
                    <Th className="hidden lg:table-cell">Sellers / PBV</Th>
                    <Th>Status</Th>
                    <Th className="hidden sm:table-cell">Updated</Th>
                    <Th className="text-right">Value</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/30">
                  {filteredCarts.map((cart) => (
                    <tr
                      key={cart.id}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedCart(cart)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="font-mono text-sm font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {cart.code}
                          </span>
                          <CopyCodeButton code={cart.code} />
                        </div>
                        {cart.sessionKey && (
                          <p className="text-xs text-gray-400 truncate max-w-[140px] mt-1">
                            {cart.sessionKey}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={cart.customer.avatar}
                            alt={cart.customer.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {cart.customer.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {cart.customer.phone || cart.customer.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        {cart.totalItems} item{cart.totalItems === 1 ? '' : 's'}
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell">
                        {cart.sellers.length === 0 ? (
                          <span className="text-xs text-gray-400">
                            No seller
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {cart.sellers.map((s, idx) => (
                              <div
                                key={`${s.sellerId ?? 'none'}-${idx}`}
                                className="flex items-center gap-1.5 text-xs"
                              >
                                <Store
                                  size={12}
                                  className="text-amber-500"
                                />
                                <span className="font-medium text-gray-700 truncate max-w-[110px]">
                                  {s.sellerName}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                  PBV: {s.totalPBV}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={cart.status}
                          onChange={(e) =>
                            handleStatusUpdate(cart.id, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[cart.status]}`}
                        >
                          {Object.keys(statusColors).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                        {cart.updatedAt}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-bold text-amber-600">
                          TSh {cart.subtotal.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          PBV: {cart.totalPBV}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCart(cart);
                            }}
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
                              handleDeleteCart(cart.id);
                            }}
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
            <div className="px-4 py-3 border-t border-amber-100/30 text-sm text-gray-500 flex items-center justify-between">
              <span>
                Showing {filteredCarts.length} of{' '}
                {hideEmpty ? nonEmptyCount : totalCarts} carts
              </span>
              {hideEmpty && emptyCount > 0 && (
                <span className="text-xs text-gray-400">
                  {emptyCount} empty cart{emptyCount === 1 ? '' : 's'} hidden
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ================= Cart Details Modal (unchanged) ================= */}
      {selectedCart && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCart(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Cart Details
                </h3>
                <p className="text-sm flex items-center gap-2">
                  <span className="font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {selectedCart.code}
                  </span>
                  <CopyCodeButton code={selectedCart.code} />
                </p>
              </div>
              <button
                onClick={() => setSelectedCart(null)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-3 bg-amber-50/50 rounded-lg flex-wrap">
                <select
                  value={selectedCart.status}
                  onChange={(e) =>
                    handleStatusUpdate(selectedCart.id, e.target.value)
                  }
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors[selectedCart.status]}`}
                >
                  {Object.keys(statusColors).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-500">
                  Created: {selectedCart.createdAt}
                </span>
                <span className="text-sm text-gray-500">
                  Updated: {selectedCart.updatedAt}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <User2Icon size={16} /> Customer
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={selectedCart.customer.avatar}
                      alt={selectedCart.customer.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-800">
                        {selectedCart.customer.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedCart.customer.email || 'Guest'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedCart.customer.phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                  {selectedCart.distributor && (
                    <p className="text-sm text-gray-500 mt-2">
                      Distributor: {selectedCart.distributor}
                    </p>
                  )}
                  {selectedCart.shopName && (
                    <p className="text-sm text-gray-500 mt-1">
                      Shop: {selectedCart.shopName}
                    </p>
                  )}
                  {selectedCart.sessionKey && (
                    <p className="text-xs text-gray-400 mt-2 break-all">
                      Session: {selectedCart.sessionKey}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin size={16} /> Summary
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      Total items: {selectedCart.totalItems}
                    </p>
                    <p className="text-sm text-gray-700">
                      Total BV: {selectedCart.totalBV}
                    </p>
                    <p className="text-sm text-amber-700 font-semibold">
                      Total PBV: {selectedCart.totalPBV}
                    </p>
                    <p className="text-sm font-semibold text-amber-600">
                      Subtotal: TSh {selectedCart.subtotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-amber-500" />
                  PBV per Seller
                </p>
                {selectedCart.sellers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400 bg-gray-50 rounded-lg">
                    No sellers associated with this cart.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCart.sellers.map((s, idx) => (
                      <div
                        key={`${s.sellerId ?? 'none'}-${idx}`}
                        className="p-4 bg-amber-50/50 rounded-lg border border-amber-200/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Store size={16} className="text-amber-600" />
                            <p className="font-semibold text-gray-800 text-sm">
                              {s.sellerName}
                            </p>
                          </div>
                          {s.sellerRank && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 font-medium">
                              {s.sellerRank}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500">BV</p>
                            <p className="font-bold text-gray-800">
                              {s.totalBV}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">PBV</p>
                            <p className="font-bold text-amber-700">
                              {s.totalPBV}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Items</p>
                            <p className="font-bold text-gray-800">
                              {s.itemsCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Amount</p>
                            <p className="font-bold text-gray-800">
                              TSh {s.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {s.sellerBonusPercentage != null && (
                          <p className="text-[10px] text-gray-400 mt-2">
                            Bonus %: {s.sellerBonusPercentage}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">
                  Cart Items
                </p>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                          Seller
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                          BV
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                          PBV
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedCart.items.map((item, idx) => {
                        const seller = selectedCart.sellers.find(
                          (s) => s.sellerId === item.sellerId
                        );
                        const itemPBV = seller
                          ? calcPBV(
                              item.bv * item.quantity,
                              seller.sellerBonusPercentage
                            )
                          : item.bv * item.quantity;
                        return (
                          <tr key={idx}>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                {item.productImage ? (
                                  <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center">
                                    <ShoppingBag
                                      size={14}
                                      className="text-amber-300"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    {item.productName}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {item.productCode}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {item.sellerName ? (
                                <span className="inline-flex items-center gap-1">
                                  <Store
                                    size={12}
                                    className="text-amber-500"
                                  />
                                  {item.sellerName}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-600">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-center text-sm text-gray-600">
                              {item.bv}
                            </td>
                            <td className="px-4 py-2 text-center text-sm font-semibold text-amber-700">
                              {itemPBV}
                            </td>
                            <td className="px-4 py-2 text-right text-sm text-gray-600">
                              TSh {item.price.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-sm font-medium text-amber-600">
                              TSh {item.subtotal.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-right font-medium text-gray-700"
                        >
                          Total BV: {selectedCart.totalBV} | Total PBV:{' '}
                          {selectedCart.totalPBV}
                        </td>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-right font-bold text-amber-600"
                        >
                          TSh {selectedCart.subtotal.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {selectedCart.notes && (
                <div className="p-4 bg-yellow-50/50 rounded-lg border border-yellow-200/30">
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {selectedCart.notes}
                  </p>
                </div>
              )}

              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  onClick={() => window.print()}
                >
                  Print
                </button>
                <button
                  className="flex-1 px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  onClick={() => handleDeleteCart(selectedCart.id)}
                >
                  Delete Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= Create Cart Modal (unchanged) ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Create New Cart
                </h3>
                <p className="text-sm text-gray-500">
                  Build a cart for a customer or guest session
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadAllDropdowns}
                  disabled={loadingCustomers || loadingDistributors}
                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Refresh dropdown data"
                >
                  <RefreshCw
                    size={18}
                    className={`text-gray-500 ${
                      loadingCustomers || loadingDistributors
                        ? 'animate-spin'
                        : ''
                    }`}
                  />
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitCart} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <select
                  value={formData.user_id ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      user_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  disabled={loadingCustomers}
                >
                  <option value="">
                    {loadingCustomers
                      ? 'Loading customers...'
                      : 'Select a customer (or leave blank for guest)'}
                  </option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name || c.username} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guest Session Key (optional)
                </label>
                <input
                  type="text"
                  value={formData.session_key}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      session_key: e.target.value,
                    }))
                  }
                  placeholder="guest-xxxxx — leave blank for user cart"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distributor (Optional)
                </label>
                <select
                  value={formData.distributor_id ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      distributor_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  disabled={loadingDistributors}
                >
                  <option value="">
                    {loadingDistributors ? 'Loading distributors...' : 'None'}
                  </option>
                  {distributorsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name} ({d.rank})
                      {(d as any).user?.email
                        ? ` — ${(d as any).user.email}`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cart Items <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    Add Item
                  </button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <ShoppingCart className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">
                      No items added yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item, index) => {
                      const selProd = products.find(
                        (p) => p.id === item.product
                      );
                      return (
                        <div
                          key={index}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="md:col-span-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                  Product
                                </label>
                                <select
                                  value={item.product || ''}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      'product',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                  required
                                  disabled={loadingProducts}
                                >
                                  <option value="">
                                    {loadingProducts
                                      ? 'Loading...'
                                      : 'Select...'}
                                  </option>
                                  {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} - TSh{' '}
                                      {Number(
                                        p.effective_price ?? 0
                                      ).toLocaleString()}
                                    </option>
                                  ))}
                                </select>
                                {selProd?.seller_name && (
                                  <p className="mt-1 text-[10px] text-amber-600 flex items-center gap-1">
                                    <Store size={10} />
                                    Seller: {selProd.seller_name}
                                    {selProd.seller_rank
                                      ? ` (${selProd.seller_rank})`
                                      : ''}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      'quantity',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  Price (TSh)
                                </label>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      'price',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                  BV
                                </label>
                                <input
                                  type="number"
                                  value={item.bv}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      'bv',
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                                  required
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="mt-5 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Add any notes about this cart..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                />
              </div>

              {formData.items.length > 0 && (
                <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200/30">
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-600">
                        Total Items:{' '}
                        <span className="font-medium">
                          {formData.items.length}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Quantity:{' '}
                        <span className="font-medium">
                          {formData.items.reduce((s, i) => s + i.quantity, 0)}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Total Amount:{' '}
                        <span className="font-bold text-amber-600 text-lg">
                          TSh{' '}
                          {formData.items
                            .reduce((s, i) => s + i.price * i.quantity, 0)
                            .toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Total BV:{' '}
                        <span className="font-medium">
                          {formData.items.reduce(
                            (s, i) => s + i.bv * i.quantity,
                            0
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-amber-100/30 pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || formData.items.length === 0}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Create Cart
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

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
  icon: React.ReactNode;
  bg: string;
  valueClass?: string;
}> = ({ label, value, icon, bg, valueClass = 'text-gray-800' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className={`text-2xl font-bold ${valueClass}`}>{value}</h3>
      </div>
      <div className={`p-2.5 ${bg} rounded-lg`}>{icon}</div>
    </div>
  </div>
);

export default Orders;