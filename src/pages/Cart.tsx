// src/pages/Cart.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Truck,
  Loader2,
  AlertCircle,
  Flower2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../api/cart';
import type { Cart as ApiCart, CartItem as ApiCartItem } from '../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

const FALLBACK_ICON_SIZE = 32;

/* Persistent guest session token for anonymous carts */
const getOrCreateSessionKey = (): string => {
  const KEY = 'cart_session_key';
  let sk = localStorage.getItem(KEY);
  if (!sk) {
    sk = `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem(KEY, sk);
  }
  return sk;
};

/* Try to read current user id from localStorage (set at login) */
const getCurrentUserId = (): number | null => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Cart: React.FC = () => {
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [items, setItems] = useState<ApiCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null); // per-item spinner
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Load or create the active cart ---------- */
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = getCurrentUserId();
      const sessionKey = userId ? null : getOrCreateSessionKey();

      const activeCart = await cartAPI.getOrCreateForUser(userId, sessionKey);
      setCart(activeCart);
      setItems(activeCart.items || []);
    } catch (err: any) {
      console.error('Failed to load cart:', err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Failed to load your cart. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  /* ---------- Refresh from server after every mutation ---------- */
  const refresh = async () => {
    if (!cart) return;
    try {
      const fresh = await cartAPI.getById(cart.id);
      setCart(fresh);
      setItems(fresh.items || []);
    } catch (err) {
      console.error('Failed to refresh cart:', err);
    }
  };

  /* ---------- Update quantity ---------- */
  const updateQuantity = async (item: ApiCartItem, change: number) => {
    if (!cart) return;
    const nextQty = item.quantity + change;
    if (nextQty < 1) return;

    setBusyId(item.id);

    // Optimistic update for snappy UX
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, quantity: nextQty } : i
      )
    );

    try {
      await cartAPI.updateItem(cart.id, item.id, { quantity: nextQty });
      await refresh();
    } catch (err) {
      console.error('Failed to update quantity:', err);
      await refresh(); // revert by re-fetching
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Remove item ---------- */
  const removeItem = async (item: ApiCartItem) => {
    if (!cart) return;
    if (!window.confirm(`Remove "${item.product_name}" from your cart?`)) return;

    setBusyId(item.id);
    // Optimistic removal
    setItems((prev) => prev.filter((i) => i.id !== item.id));

    try {
      await cartAPI.removeItem(cart.id, item.id);
      await refresh();
    } catch (err) {
      console.error('Failed to remove item:', err);
      await refresh();
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Clear cart ---------- */
  const clearCart = async () => {
    if (!cart) return;
    if (!window.confirm('Remove all items from your cart?')) return;
    setClearing(true);
    try {
      const fresh = await cartAPI.clear(cart.id);
      setCart(fresh);
      setItems(fresh.items || []);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    } finally {
      setClearing(false);
    }
  };

  /* ---------- Derived ---------- */
  const subtotal = items.reduce(
    (sum, i) => sum + num(i.price) * i.quantity,
    0
  );
  const totalBV = items.reduce((sum, i) => sum + (i.bv || 0) * i.quantity, 0);
  const shipping = subtotal > 100000 || subtotal === 0 ? 0 : 5000;
  const total = subtotal + shipping;

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h2 className="text-xl font-bold text-gray-800">Couldn’t load cart</h2>
          <p className="text-gray-500 mt-2 text-sm">{error}</p>
          <button
            onClick={loadCart}
            className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (!cart || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 mt-2">
            Looks like you haven’t added any items yet
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

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={clearCart}
            disabled={clearing}
            className="text-sm text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {clearing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
              <div className="divide-y divide-amber-100/30">
                {items.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4">
                    {/* Product image or flower icon */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-amber-50 flex items-center justify-center shrink-0">
                      {item.product_picture ? (
                        <img
                          src={item.product_picture}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Flower2
                          className="text-amber-300"
                          size={FALLBACK_ICON_SIZE}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        {item.product_name}
                      </h3>
                      <p className="text-xs text-gray-400">{item.product_sku}</p>
                      <p className="text-sm text-amber-600 font-bold mt-1">
                        TSh {num(item.price).toLocaleString()}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item, -1)}
                            disabled={busyId === item.id || item.quantity <= 1}
                            className="px-3 py-1 hover:bg-amber-50 transition-colors disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, 1)}
                            disabled={busyId === item.id}
                            className="px-3 py-1 hover:bg-amber-50 transition-colors disabled:opacity-40"
                          >
                            {busyId === item.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Plus size={14} />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item)}
                          disabled={busyId === item.id}
                          className="text-red-500 hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-amber-600">
                        TSh{' '}
                        {(num(item.price) * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.bv * item.quantity} BV
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>TSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total BV</span>
                  <span>{totalBV}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0
                      ? 'Free'
                      : `TSh ${shipping.toLocaleString()}`}
                  </span>
                </div>
                <div className="border-t border-amber-200/30 pt-3">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-amber-600">
                      TSh {total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    to="/checkout"
                    className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/shop"
                    className="w-full px-6 py-3 border border-amber-500 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard size={18} />
                    Continue Shopping
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-amber-100/30">
                  <Truck size={18} className="text-amber-500" />
                  <span>Free shipping on orders over TSh 100,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;