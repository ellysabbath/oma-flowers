// src/pages/Shop.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Grid,
  List,
  ShoppingCart,
  Heart,
  Eye,
  Loader2,
  AlertCircle,
  Flower2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../api/products';
import { categoryAPI } from '../api/categories';
import { cartAPI } from '../api/cart';
import type { Product, Category } from '../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

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

/* ---------- Wishlist helpers (localStorage-backed) ---------- */

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

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Shop: React.FC = () => {
  const navigate = useNavigate();

  /* ---------- Data ---------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- UI state ---------- */
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  /* ---------- Cart feedback ---------- */
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  /* ---------- Wishlist state ---------- */
  const [wishlistIds, setWishlistIds] = useState<number[]>(() =>
    readWishlistIds()
  );

  /* ---------- Load products + categories ---------- */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAll(),
          categoryAPI.getAll(),
        ]);

        const rawProducts: Product[] = Array.isArray(productsRes)
          ? productsRes
          : (productsRes as any)?.results || [];
        const rawCategories: Category[] = Array.isArray(categoriesRes)
          ? categoriesRes
          : (categoriesRes as any)?.results || [];

        if (!cancelled) {
          setProducts(rawProducts);
          setCategories(rawCategories);
        }
      } catch (err: any) {
        console.error('Failed to load shop data:', err);
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              'Failed to load products.'
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

  /* ---------- Keep wishlist in sync with other tabs/components ---------- */
  useEffect(() => {
    const onWishlistUpdated = () => setWishlistIds(readWishlistIds());
    window.addEventListener('wishlist:updated', onWishlistUpdated);
    return () =>
      window.removeEventListener('wishlist:updated', onWishlistUpdated);
  }, []);

  /* ---------- Add to cart ---------- */
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

      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingId(null);
    }
  };

  /* ---------- Toggle wishlist ---------- */
  const handleToggleWishlist = (product: Product) => {
    const current = readWishlistIds();
    const idx = current.indexOf(product.id);
    let next: number[];

    if (idx >= 0) {
      next = current.filter((id) => id !== product.id);
    } else {
      next = [...current, product.id];
    }

    writeWishlistIds(next);
    setWishlistIds(next);
  };

  const isInWishlist = (id: number) => wishlistIds.includes(id);

  /* ---------- Derived: filtered + sorted ---------- */
  const visibleProducts = useMemo(() => {
    const searchLc = search.trim().toLowerCase();

    let list = products.filter((p) => {
      if (category !== 'all') {
        const catName = (p.category_name || '').toLowerCase();
        if (catName !== category) return false;
      }
      if (searchLc) {
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        if (!name.includes(searchLc) && !sku.includes(searchLc)) return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'price-low':
        list.sort(
          (a, b) =>
            num(a.effective_price ?? a.price) -
            num(b.effective_price ?? b.price)
        );
        break;
      case 'price-high':
        list.sort(
          (a, b) =>
            num(b.effective_price ?? b.price) -
            num(a.effective_price ?? a.price)
        );
        break;
      case 'popular':
        list.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
    }

    return list;
  }, [products, category, search, sortBy]);

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
            Couldn’t load products
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

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Our Shop</h1>
          <p className="text-gray-600 mt-2">
            Browse our beautiful collection of flowers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name.toLowerCase()}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {visibleProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-12 text-center">
            <Flower2 className="mx-auto text-amber-300" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-600">
              No products found
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div
            className={`grid ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            } gap-6`}
          >
            {visibleProducts.map((product) => {
              const liked = isInWishlist(product.id);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden hover:shadow-md transition-shadow group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden bg-amber-50 ${
                      viewMode === 'list' ? 'w-48 shrink-0' : ''
                    }`}
                  >
                    {product.product_picture ? (
                      <img
                        src={product.product_picture}
                        alt={product.name}
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          viewMode === 'list' ? 'h-48' : 'h-64'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-full flex items-center justify-center ${
                          viewMode === 'list' ? 'h-48' : 'h-64'
                        }`}
                      >
                        <Flower2 className="text-amber-300" size={56} />
                      </div>
                    )}

                    {product.status === 'coming_soon' && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className={`p-2.5 rounded-full transition-colors ${
                          liked
                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                            : 'bg-white hover:bg-amber-500 hover:text-white'
                        }`}
                        title={
                          liked ? 'Remove from wishlist' : 'Add to wishlist'
                        }
                      >
                        <Heart
                          size={18}
                          className={liked ? 'fill-white' : ''}
                        />
                      </button>
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
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.category_name || 'Flowers'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-amber-600">
                        TSh{' '}
                        {num(
                          product.effective_price ?? product.price
                        ).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={
                          addingId === product.id ||
                          product.status === 'coming_soon'
                        }
                        className={`px-4 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60 ${
                          addedId === product.id
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}
                      >
                        {addingId === product.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Adding…
                          </>
                        ) : addedId === product.id ? (
                          <>✓ Added</>
                        ) : (
                          <>Add to Cart</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;