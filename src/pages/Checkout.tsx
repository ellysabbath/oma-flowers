// src/pages/Checkout.tsx
import React, { useEffect, useState } from 'react';
import { CreditCard, Shield, Check, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cartAPI } from '../api/cart';
import { useAuth } from '../context/AuthContext';
import type { Cart as ApiCart } from '../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

const SHIPPING_FREE_THRESHOLD = 100000;
const SHIPPING_FLAT = 5000;

const getCurrentUserId = (): number | null => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')?.id ?? null;
  } catch {
    return null;
  }
};

const getOrCreateSessionKey = (): string => {
  const KEY = 'cart_session_key';
  let sk = localStorage.getItem(KEY);
  if (!sk) {
    sk = `guest-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem(KEY, sk);
  }
  return sk;
};

/* ------------------------------------------------------------------ */
/* Auto-fill helpers                                                   */
/* ------------------------------------------------------------------ */

interface PrefillData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  city: string;
}

const getPrefillFromUser = (user: any): PrefillData => {
  if (!user) {
    return {
      fullName: '',
      email: '',
      phone: '',
      country: 'Tanzania',
      region: '',
      city: '',
    };
  }

  // Prefer nested full_name; fall back to first + last
  const fullName =
    user.full_name ||
    `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
    user.username ||
    '';

  return {
    fullName,
    email: user.email || '',
    phone: user.phone || user.mobile_number || '',
    // Map country codes → names if needed
    country: (() => {
      const c = user.country || 'Tanzania';
      const map: Record<string, string> = {
        TZ: 'Tanzania',
        KE: 'Kenya',
        UG: 'Uganda',
        NG: 'Nigeria',
        ZA: 'South Africa',
        GH: 'Ghana',
      };
      return map[c] || c;
    })(),
    region: user.region || '',
    city: user.city || '',
  };
};

const getPrefillFromLocalStorage = (): PrefillData => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return getPrefillFromUser(null);
    return getPrefillFromUser(JSON.parse(raw));
  } catch {
    return getPrefillFromUser(null);
  }
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Checkout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    zipCode: '',
    country: 'Tanzania',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });

  /* ---------- Load the active cart ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoadingCart(true);
        const userId = getCurrentUserId();
        const sessionKey = userId ? null : getOrCreateSessionKey();
        const active = await cartAPI.getOrCreateForUser(userId, sessionKey);
        if (!cancelled) setCart(active);
      } catch (err) {
        console.error('Failed to load cart for checkout:', err);
      } finally {
        if (!cancelled) setLoadingCart(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Auto-fill from the logged-in user ---------- */
  useEffect(() => {
    // Try the AuthContext user first
    let source: PrefillData;

    if (user) {
      source = getPrefillFromUser(user);
    } else {
      source = getPrefillFromLocalStorage();
    }

    // Only apply prefill values that exist — never blank out typed values
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || source.fullName,
      email: prev.email || source.email,
      phone: prev.phone || source.phone,
      country: prev.country && prev.country !== 'Tanzania'
        ? prev.country
        : source.country,
      region: prev.region || source.region,
      city: prev.city || source.city,
      // Prefill cardholder name from full name for convenience
      cardName: prev.cardName || source.fullName,
    }));

    // Only show the "prefilled" badge once we have at least one value
    if (source.fullName || source.email || source.phone) {
      setPrefilled(true);
    }
  }, [user]);

  /* ---------- Totals (single source of truth) ---------- */
  const subtotal = (cart?.items || []).reduce(
    (sum, i) => sum + num(i.price) * i.quantity,
    0
  );
  const totalItems = (cart?.items || []).reduce(
    (sum, i) => sum + i.quantity,
    0
  );
  const shipping =
    subtotal === 0 || subtotal > SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = 0;
  const total = subtotal + shipping + tax;

  /* ---------- Input handler ---------- */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- Place order ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || totalItems === 0) {
      alert('Your cart is empty.');
      return;
    }

    setError(null);
    setStep(2);
    setPlacingOrder(true);

    try {
      await cartAPI.checkout(cart.id);
      window.dispatchEvent(new Event('cart:updated'));
      setStep(3);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          'Checkout failed. Please try again.'
      );
      setStep(1);
    } finally {
      setPlacingOrder(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loadingCart) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  /* ---------- Empty cart ---------- */
  if (!cart || totalItems === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mt-2">
            Add some flowers before checking out.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Step 2: processing ---------- */
  if (step === 2) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Processing Your Order
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we confirm your payment...
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Step 3: success ---------- */
  if (step === 3) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">
            Order Successful!
          </h2>
          <p className="text-gray-500 mt-2">
            Your order has been placed successfully.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <Link
              to="/shop"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/orders"
              className="px-6 py-3 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Step 1: checkout form ---------- */
  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        {prefilled && isAuthenticated && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-sm text-amber-700">
            <Check size={16} />
            <span>
              Your details have been pre-filled from your account. Review and
              complete the remaining fields.
            </span>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-600 text-sm flex-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal info — mostly auto-filled */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                    Personal Information
                    {isAuthenticated && (
                      <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Auto-filled from your account
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Region
                      </label>
                      <input
                        type="text"
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                      >
                        <option value="Tanzania">Tanzania</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Ghana">Ghana</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment — still manual (nobody stores this) */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {placingOrder ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Placing order…
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      Place Order
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0
                      ? 'Free'
                      : `TSh ${shipping.toLocaleString()}`}
                  </span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>TSh {tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-amber-200/30 pt-3">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total</span>
                    <span className="text-amber-600 text-xl">
                      TSh {total.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-amber-100/30">
                  <Shield size={18} className="text-amber-500" />
                  <span>Your payment is secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;