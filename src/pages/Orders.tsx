// src/pages/Orders.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  AlertCircle,
  X,
  MapPin,
  User2Icon,
  RefreshCw,
} from 'lucide-react';
import { cartAPI } from '../api/cart';
import { useAuth } from '../context/AuthContext';
import type { Cart as ApiCart, CartItem as ApiCartItem } from '../types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface DisplayCart {
  id: number;
  status: 'Active' | 'Converted' | 'Abandoned' | 'Expired';
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  subtotal: number;
  totalBV: number;
  items: {
    productId: number;
    productName: string;
    productCode: string;
    productPicture?: string | null;
    quantity: number;
    price: number;
    bv: number;
    subtotal: number;
  }[];
  notes?: string;
  distributorName?: string;
  shopName?: string;
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  Active: 'bg-blue-100 text-blue-700',
  Converted: 'bg-green-100 text-green-700',
  Abandoned: 'bg-yellow-100 text-yellow-700',
  Expired: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, React.ReactNode> = {
  Active: <Clock className="text-blue-500" size={18} />,
  Converted: <CheckCircle className="text-green-500" size={18} />,
  Abandoned: <Package className="text-yellow-500" size={18} />,
  Expired: <X className="text-red-500" size={18} />,
};

const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

const formatDate = (iso: string) => {
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

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Orders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [carts, setCarts] = useState<DisplayCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCart, setSelectedCart] = useState<DisplayCart | null>(null);

  /* ---------- Determine the current user's ID ---------- */
  const currentUserId: number | null = (() => {
    if (user && (user as any).id) return (user as any).id;

    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id ?? null;
    } catch {
      return null;
    }
  })();

  /* ---------- Fetch only the current user's carts ---------- */
  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      setCarts([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Only fetch carts that belong to this user
        const raw = await cartAPI.getAll({ user: currentUserId });

        const transformed: DisplayCart[] = raw.map((cart: ApiCart) => {
          const nestedDistributor: any = cart.distributor;
          const distributorName = nestedDistributor?.full_name || undefined;

          const nestedShop: any = cart.shop;
          const shopName = nestedShop?.name || undefined;

          const items = (cart.items || []).map((item: ApiCartItem) => {
            const price = num(item.price);
            const subtotal = num(item.subtotal ?? price * item.quantity);
            return {
              productId: item.product,
              productName: item.product_name || 'Unknown Product',
              productCode: item.product_sku || '',
              productPicture: item.product_picture || null,
              quantity: item.quantity,
              price,
              bv: item.bv || 0,
              subtotal,
            };
          });

          const subtotal = num(cart.subtotal);
          const totalBV = num(cart.total_bv);
          const itemCount =
            cart.total_items ??
            items.reduce((s, i) => s + i.quantity, 0);

          return {
            id: cart.id,
            status: capitalize(cart.status) as DisplayCart['status'],
            createdAt: formatDate(cart.created_at),
            updatedAt: formatDate(cart.updated_at),
            itemCount,
            subtotal,
            totalBV,
            items,
            notes: cart.notes || undefined,
            distributorName,
            shopName,
          };
        });

        if (!cancelled) setCarts(transformed);
      } catch (err: any) {
        console.error('Failed to load carts:', err);
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              'Failed to load your carts.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  /* ---------- Not logged in ---------- */
  if (!isAuthenticated && !currentUserId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <ShoppingCart size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Please Sign In
          </h2>
          <p className="text-gray-500 mt-2">
            You need to be logged in to view your shopping history.
          </p>
          <Link
            to="/login"
            className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

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
            Couldn’t load your carts
          </h2>
          <p className="text-gray-500 mt-2 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (carts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingCart size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            No Carts Yet
          </h2>
          <p className="text-gray-500 mt-2">
            Start shopping to see your carts here
          </p>
          <Link
            to="/shop"
            className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Populated ---------- */
  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          My Carts
        </h1>

        <div className="space-y-4">
          {carts.map((cart) => (
            <div
              key={cart.id}
              className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Cart #{cart.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Created {cart.createdAt} · Updated {cart.updatedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {statusIcons[cart.status]}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[cart.status] ||
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cart.status}
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-amber-600">
                    TSh {cart.subtotal.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {cart.itemCount} item{cart.itemCount === 1 ? '' : 's'}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCart(cart)}
                  className="px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-2"
                >
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Cart Details Modal ---------------- */}
      {selectedCart && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCart(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Cart Details
                </h3>
                <p className="text-sm text-amber-600">Cart #{selectedCart.id}</p>
              </div>
              <button
                onClick={() => setSelectedCart(null)}
                className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status bar */}
              <div className="flex items-center gap-4 p-3 bg-amber-50/50 rounded-lg flex-wrap">
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    statusColors[selectedCart.status]
                  }`}
                >
                  {selectedCart.status}
                </span>
                <span className="text-sm text-gray-500">
                  Created: {selectedCart.createdAt}
                </span>
                <span className="text-sm text-gray-500">
                  Updated: {selectedCart.updatedAt}
                </span>
              </div>

              {/* Meta */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MapPin size={16} /> Cart Info
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-700">
                    Total BV: {selectedCart.totalBV}
                  </p>
                  <p className="text-sm font-semibold text-amber-600">
                    Subtotal: TSh {selectedCart.subtotal.toLocaleString()}
                  </p>
                  {selectedCart.distributorName && (
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                      <User2Icon size={14} />
                      Distributor: {selectedCart.distributorName}
                    </p>
                  )}
                  {selectedCart.shopName && (
                    <p className="text-sm text-gray-500 mt-1">
                      Shop: {selectedCart.shopName}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
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
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">
                          BV
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
                      {selectedCart.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              {item.productPicture ? (
                                <img
                                  src={item.productPicture}
                                  alt={item.productName}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center">
                                  <Package
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
                          <td className="px-4 py-2 text-center text-sm text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2 text-center text-sm text-gray-600">
                            {item.bv}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-600">
                            TSh {item.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-medium text-amber-600">
                            TSh {item.subtotal.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-2 text-right font-medium text-gray-700"
                        >
                          Total BV: {selectedCart.totalBV}
                        </td>
                        <td
                          colSpan={2}
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
                <Link
                  to="/cart"
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-center"
                >
                  Continue this cart
                </Link>
                <Link
                  to="/shop"
                  className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-center"
                >
                  Shop Again
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;