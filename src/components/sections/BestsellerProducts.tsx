// src/components/home/BestsellerProducts.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ShoppingCart, RefreshCw, Heart, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { productAPI } from '../../api/products';
import { cartAPI } from '../../api/cart';
import type { Product } from '../../types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface DisplayProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  raw: Product;
}

interface BestsellerProductsProps {
  products?: DisplayProduct[];
  limit?: number;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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

/* ---------- Wishlist (localStorage-backed) ---------- */

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
  window.dispatchEvent(new Event('wishlist:updated'));
};

const toDisplayProduct = (p: Product): DisplayProduct => {
  const price = Number(p.effective_price ?? p.price ?? 0);
  return {
    id: p.id,
    name: p.name,
    category: p.category_name || 'Uncategorized',
    price,
    originalPrice: Number((price * 1.15).toFixed(2)),
    image: p.product_picture || '',
    badge:
      p.status && p.status !== 'active' ? p.status.replace('_', ' ') : '',
    raw: p,
  };
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const BestsellerProducts: React.FC<BestsellerProductsProps> = ({
  products: incomingProducts,
  limit = 6,
}) => {
  const navigate = useNavigate();

  const [items, setItems] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>(() =>
    readWishlistIds()
  );

  /* ---------- Fetch bestsellers from backend ---------- */
  useEffect(() => {
    // If parent passed products, use those.
    if (incomingProducts && incomingProducts.length > 0) {
      setItems(incomingProducts.slice(0, limit));
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchBestsellers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response: any = await productAPI.getAll();
        const raw: Product[] = Array.isArray(response)
          ? response
          : response?.results || [];

        const topSellers = raw
          .filter((p) => p.status === 'active')
          .sort((a, b) => (b.sales || 0) - (a.sales || 0))
          .slice(0, limit)
          .map(toDisplayProduct);

        if (!cancelled) setItems(topSellers);
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

    fetchBestsellers();

    return () => {
      cancelled = true;
    };
  }, [incomingProducts, limit]);

  /* ---------- Sync wishlist across components ---------- */
  useEffect(() => {
    const onWishlistUpdated = () => setWishlistIds(readWishlistIds());
    window.addEventListener('wishlist:updated', onWishlistUpdated);
    return () =>
      window.removeEventListener('wishlist:updated', onWishlistUpdated);
  }, []);

  /* ---------- Add to cart → /cart ---------- */
  const handleAddToCart = async (product: DisplayProduct) => {
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

  /* ---------- Wishlist toggle ---------- */
  const handleToggleWishlist = (
    product: DisplayProduct,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const current = readWishlistIds();
    const idx = current.indexOf(product.id);
    const next =
      idx >= 0
        ? current.filter((id) => id !== product.id)
        : [...current, product.id];

    writeWishlistIds(next);
    setWishlistIds(next);
  };

  const isInWishlist = (id: number) => wishlistIds.includes(id);
  const handleView = (product: DisplayProduct) =>
    navigate(`/products/${product.id}`);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  /* ---------- Empty ---------- */
  if (items.length === 0) {
    return (
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">No bestseller products yet.</p>
        </div>
      </section>
    );
  }

  /* ---------- Render ---------- */
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h4 className="text-primary inline-block border-b-2 border-primary pb-2 mb-4 font-semibold">
            Bestseller Products
          </h4>
          <p className="text-gray-600">
            Our most-loved flowers, chosen by customers across Tanzania.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => {
            const liked = isInWishlist(product.id);

            return (
              <div
                key={product.id}
                onClick={() => handleView(product)}
                className="bg-white rounded-lg shadow-md overflow-hidden flex hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Image column */}
                <div className="w-2/5 relative bg-amber-50">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingCart className="text-amber-300" size={32} />
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(product);
                    }}
                    className="absolute bottom-2 right-2 p-2 bg-primary rounded-full text-white hover:bg-blue-600 transition-colors"
                    title="View product"
                  >
                    <Eye size={16} />
                  </button>
                </div>

                {/* Details column */}
                <div className="w-3/5 p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">
                      {product.category}
                    </p>
                    <h3 className="font-semibold line-clamp-2">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="line-through text-gray-400">
                        TSh {product.originalPrice.toLocaleString()}
                      </span>
                      <span className="text-primary font-bold">
                        TSh {product.price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <Button
                      variant="primary"
                      className="text-sm py-1 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={addingId === product.id}
                    >
                      {addingId === product.id ? (
                        <>
                          <Loader2
                            size={14}
                            className="inline mr-1 animate-spin"
                          />
                          Adding…
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} className="inline mr-1" /> Add
                        </>
                      )}
                    </Button>

                    <div className="flex gap-2">
                      <button
                        className="p-1 hover:text-primary transition-colors"
                        title="Compare"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RefreshCw size={14} />
                      </button>

                      <button
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className={`p-1 transition-colors ${
                          liked ? 'text-rose-500' : 'hover:text-primary'
                        }`}
                        title={
                          liked
                            ? 'Remove from wishlist'
                            : 'Add to wishlist'
                        }
                      >
                        <Heart
                          size={14}
                          className={liked ? 'fill-rose-500' : ''}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BestsellerProducts;