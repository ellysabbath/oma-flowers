// src/components/home/Hero.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower2, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { productAPI } from '../../api/products';
import { cartAPI } from '../../api/cart';
import type { Product } from '../../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const [featured, setFeatured] = useState<Product | null>(null);
  const [special, setSpecial] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  /* ---------- Fetch two flower products to fill the two banners ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const response: any = await productAPI.getAll();
        const raw: Product[] = Array.isArray(response)
          ? response
          : response?.results || [];

        const active = raw.filter((p) => p.status === 'active');

        const featuredPick =
          [...active].sort((a, b) => (b.stock || 0) - (a.stock || 0))[0] ||
          null;

        const specialPick =
          [...active]
            .filter((p) => p.id !== featuredPick?.id)
            .sort((a, b) => (b.sales || 0) - (a.sales || 0))[0] ||
          active[0] ||
          null;

        if (!cancelled) {
          setFeatured(featuredPick);
          setSpecial(specialPick);
        }
      } catch (err) {
        console.error('Failed to load hero products:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Helpers ---------- */

  const priceOf = (p: Product | null): number =>
    p ? Number(p.effective_price ?? p.price ?? 0) : 0;

  const originalOf = (p: Product | null): number => {
    const price = priceOf(p);
    return Number((price * 1.15).toFixed(2));
  };

  /* ---------- Navigation ---------- */

  // Featured "Shop Now" -> product detail.  (See note below to send to /cart.)
  const handleShopNow = (p: Product | null) => {
    if (p) navigate(`/products/${p.id}`);
    else navigate('/shop');
  };

  /* ---------- Add to cart (via backend) ---------- */

  const addToCart = async (p: Product | null) => {
    if (!p) return;
    setAddingId(p.id);
    try {
      const userId = getCurrentUserId();
      const sessionKey = userId ? null : getOrCreateSessionKey();

      // Get or create the active cart for this user / guest
      const cart = await cartAPI.getOrCreateForUser(userId, sessionKey);

      // Add (or bump quantity of) the product
      await cartAPI.addItem(cart.id, {
        product: p.id,
        quantity: 1,
      });

      // Notify the header badge & other listeners
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

  /* ---------- Render ---------- */

  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ---------- Featured banner (left, 3 cols) ---------- */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-2xl p-8 shadow-lg">
              <div>
                <span className="text-primary font-semibold tracking-wider">
                  FRESH FLOWERS • DELIVERED DAILY
                </span>
                <h1 className="text-4xl font-bold mt-4 mb-4">
                  {loading
                    ? 'Loading today’s featured bouquet…'
                    : featured
                    ? featured.name
                    : 'Fresh Flowers, Delivered with Love'}
                </h1>
                <p className="text-gray-600 mb-6">
                  {featured ? (
                    <>
                      {featured.category_name
                        ? `${featured.category_name} • `
                        : ''}
                      From TSh {priceOf(featured).toLocaleString()}
                    </>
                  ) : (
                    'Hand-picked bouquets for every occasion. Order today.'
                  )}
                </p>
                <Button
                  variant="primary"
                  onClick={() => handleShopNow(featured)}
                  disabled={addingId === featured?.id}
                >
                  Shop Now
                </Button>
              </div>

              {/* Featured product image OR icon placeholder */}
              <div className="w-full h-64 flex items-center justify-center bg-amber-50 rounded-xl overflow-hidden">
                {featured?.product_picture ? (
                  <img
                    src={featured.product_picture}
                    alt={featured.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Flower2 className="text-amber-300" size={96} />
                )}
              </div>
            </div>
          </div>

          {/* ---------- Special offer card (right, 1 col) ---------- */}
          <div className="lg:col-span-1 relative overflow-hidden rounded-2xl bg-amber-100 min-h-[420px]">
            {special?.product_picture ? (
              <img
                src={special.product_picture}
                alt={special.name}
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                <Flower2 className="text-amber-400" size={120} />
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span className="bg-primary text-white px-4 py-1 rounded-full text-sm">
                {special
                  ? `Save TSh ${(
                      originalOf(special) - priceOf(special)
                    ).toLocaleString()}`
                  : 'Special Offer'}
              </span>
              <p className="text-primary font-bold mt-2">Today’s Pick</p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <p className="text-sm">
                {special?.category_name || 'Fresh Flowers'}
              </p>
              <h3 className="text-xl font-bold">
                {special?.name || 'Fresh Bouquet of the Day'}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                {special && (
                  <span className="line-through text-gray-400">
                    TSh {originalOf(special).toLocaleString()}
                  </span>
                )}
                <span className="text-primary font-bold">
                  {special
                    ? `TSh ${priceOf(special).toLocaleString()}`
                    : 'Ask in store'}
                </span>
              </div>
              <Button
                variant="primary"
                className="text-sm mt-3 py-2 px-4"
                onClick={() => addToCart(special)}
                disabled={!special || addingId === special.id}
              >
                {addingId === special?.id ? (
                  <>
                    <Loader2 size={14} className="inline mr-1 animate-spin" />
                    Adding…
                  </>
                ) : (
                  'Add To Cart'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;