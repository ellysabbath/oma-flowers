// src/pages/Wishlist.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Trash2,
  X,
  Loader2,
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

/* ---------- localStorage wishlist helpers ---------- */

const readWishlistIds = (): number[] => {
  try {
    const raw = localStorage.getItem('wishlist');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map(Number) : [];
  } catch {
    return [];
  }
};

const writeWishlistIds = (ids: number[]) => {
  localStorage.setItem('wishlist', JSON.stringify(ids));
  // Let the header badge know
  window.dispatchEvent(new Event('wishlist:updated'));
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Wishlist: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  /* ---------- Load wishlist + resolve products ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const ids = readWishlistIds();
        if (ids.length === 0) {
          if (!cancelled) setProducts([]);
          return;
        }

        const response: any = await productAPI.getAll();
        const raw: Product[] = Array.isArray(response)
          ? response
          : response?.results || [];

        // Keep only the products that are still in the wishlist,
        // and preserve the wishlist order
        const idSet = new Set(ids);
        const resolved = raw.filter((p) => idSet.has(p.id));
        const ordered = ids
          .map((id) => resolved.find((p) => p.id === id))
          .filter((p): p is Product => Boolean(p));

        if (!cancelled) setProducts(ordered);
      } catch (err) {
        console.error('Failed to load wishlist products:', err);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    // Re-run when another tab updates the wishlist
    const onWishlistUpdated = () => load();
    window.addEventListener('wishlist:updated', onWishlistUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener('wishlist:updated', onWishlistUpdated);
    };
  }, []);

  /* ---------- Remove from wishlist ---------- */
  const removeItem = (id: number) => {
    const next = readWishlistIds().filter((x) => x !== id);
    writeWishlistIds(next);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  /* ---------- Add to cart → /cart ---------- */
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

  /* ---------- Empty wishlist ---------- */
  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <Heart size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-500 mt-2">
            Start saving your favorite items
          </p>
          <Link
            to="/shop"
            className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Browse Products
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
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
          <button
            onClick={() => {
              writeWishlistIds([]);
              setProducts([]);
            }}
            className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <Trash2 size={16} />
            Clear wishlist
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const price = num(product.effective_price ?? product.price);

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden group"
              >
                <div className="relative">
                  {product.product_picture ? (
                    <img
                      src={product.product_picture}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 bg-amber-50 flex items-center justify-center">
                      <Flower2 className="text-amber-300" size={56} />
                    </div>
                  )}

                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    title="Remove from wishlist"
                  >
                    <X
                      size={16}
                      className="text-gray-400 hover:text-red-500"
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {product.category_name || 'Flowers'}
                  </p>
                  <p className="text-lg font-bold text-amber-600 mt-2">
                    TSh {price.toLocaleString()}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingId === product.id}
                      className="flex-1 px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {addingId === product.id ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Adding…
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          Add to Cart
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="px-4 py-2 border border-red-300 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;