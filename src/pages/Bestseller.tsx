// src/pages/Bestseller.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Heart,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle,
  Flower2,
} from 'lucide-react';
import { productAPI } from '../api/products';
import { cartAPI } from '../api/cart';
import type { Product } from '../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

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
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Bestseller: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  /* ---------- Load products from API ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response: any = await productAPI.getAll();
        const raw: Product[] = Array.isArray(response)
          ? response
          : response?.results || [];

        // Bestsellers = top 6 active products by sales
        const bestsellers = raw
          .filter((p) => p.status === 'active')
          .sort((a, b) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 6);

        if (!cancelled) setProducts(bestsellers);
      } catch (err: any) {
        console.error('Failed to load bestsellers:', err);
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              'Failed to load bestsellers.'
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
  }, []);

  /* ---------- Add to cart → redirect to /cart ---------- */
  const handleAddToCart = async (product: Product) => {
    setAddingId(product.id);
    try {
      const userId = getCurrentUserId();
      const sessionKey = userId ? null : getOrCreateSessionKey();

      const cart = await cartAPI.getOrCreateForUser(userId, sessionKey);
      await cartAPI.addItem(cart.id, {
        product: product.id,
        quantity: 1,
      });

      window.dispatchEvent(new Event('cart:updated'));

      // Open the cart page
      navigate('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingId(null);
    }
  };

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
            Couldn’t load bestsellers
          </h2>
          <p className="text-gray-500 mt-2 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <Flower2 className="text-amber-300 mx-auto mb-3" size={56} />
          <h2 className="text-2xl font-bold text-gray-800">
            No bestsellers yet
          </h2>
          <p className="text-gray-500 mt-2">
            Once customers start buying, top products will show up here.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="text-amber-500" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">Bestsellers</h1>
          </div>
          <p className="text-gray-600">
            Our top selling products loved by customers
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="relative">
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Award size={14} />
                  #{index + 1} Best Seller
                </div>

                {/* Image or fallback icon */}
                {product.product_picture ? (
                  <img
                    src={product.product_picture}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-64 bg-amber-50 flex items-center justify-center">
                    <Flower2 className="text-amber-300" size={56} />
                  </div>
                )}

                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product.id}
                    className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-60"
                    title="Add to cart"
                  >
                    {addingId === product.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ShoppingCart size={18} />
                    )}
                  </button>
                  <button
                    className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors"
                    title="Add to wishlist"
                  >
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* Star rating (5 filled — swap for real rating field later) */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>

                <h3 className="font-semibold text-gray-800 mt-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {product.category_name || 'Flowers'}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-amber-600">
                    TSh{' '}
                    {num(
                      product.effective_price ?? product.price
                    ).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product.id}
                    className="px-4 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {addingId === product.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Adding…
                      </>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bestseller;