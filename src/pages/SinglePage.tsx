// src/pages/SinglePage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  Grid3X3,
  Rows3,
  List,
  ShoppingCart,
  Heart,
  Eye,
  Loader2,
  AlertCircle,
  Flower2,
} from 'lucide-react';
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
/* Layout modes                                                        */
/* ------------------------------------------------------------------ */

type LayoutMode = 'grid-sm' | 'grid-md' | 'grid-lg' | 'list';

const GRID_CLASS: Record<LayoutMode, string> = {
  'grid-sm': 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  'grid-md': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  'grid-lg': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  'list': 'grid-cols-1',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const SinglePage: React.FC = () => {
  const navigate = useNavigate();

  /* ---------- Data ---------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- UI state ---------- */
  const [layout, setLayout] = useState<LayoutMode>('grid-md');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [addingId, setAddingId] = useState<number | null>(null);

  /* ---------- Load from API ---------- */
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
        console.error('Failed to load products:', err);
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
      navigate('/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingId(null);
    }
  };

  /* ---------- Derived: filtered + sorted ---------- */
  const visibleProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = products.filter((p) => {
      if (category !== 'all') {
        if ((p.category_name || '').toLowerCase() !== category) return false;
      }
      if (q) {
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        if (!name.includes(q) && !sku.includes(q)) return false;
      }
      return true;
    });

    switch (sortBy) {
      case 'price-low':
        list = [...list].sort(
          (a, b) =>
            num(a.effective_price ?? a.price) -
            num(b.effective_price ?? b.price)
        );
        break;
      case 'price-high':
        list = [...list].sort(
          (a, b) =>
            num(b.effective_price ?? b.price) -
            num(a.effective_price ?? a.price)
        );
        break;
      case 'popular':
        list = [...list].sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      case 'newest':
        list = [...list].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;
      case 'featured':
      default:
        list = [...list].sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
    }

    return list;
  }, [products, category, search, sortBy]);

  /* ---------- Layout switcher config ---------- */
  const layoutButtons: { mode: LayoutMode; icon: React.ReactNode; title: string }[] = [
    { mode: 'grid-sm', icon: <Grid3X3 size={18} />, title: 'Small grid' },
    { mode: 'grid-md', icon: <LayoutGrid size={18} />, title: 'Medium grid' },
    { mode: 'grid-lg', icon: <Rows3 size={18} />, title: 'Large grid' },
    { mode: 'list', icon: <List size={18} />, title: 'List' },
  ];

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
          <h1 className="text-4xl font-bold text-gray-800">All Products</h1>
          <p className="text-gray-600 mt-2">
            Browse our full collection of fresh flowers
          </p>
        </div>

        {/* Filters + layout switcher */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
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

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name.toLowerCase()}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort */}
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

            {/* Layout switcher */}
            <div className="flex gap-1">
              {layoutButtons.map(({ mode, icon, title }) => (
                <button
                  key={mode}
                  onClick={() => setLayout(mode)}
                  title={title}
                  className={`p-2 rounded-lg transition-colors ${
                    layout === mode
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
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
          <div className={`grid ${GRID_CLASS[layout]} gap-4`}>
            {visibleProducts.map((product) => {
              const price = num(product.effective_price ?? product.price);
              const isList = layout === 'list';

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden hover:shadow-md transition-shadow group ${
                    isList ? 'flex' : ''
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative overflow-hidden bg-amber-50 ${
                      isList ? 'w-48 shrink-0' : ''
                    }`}
                  >
                    {product.product_picture ? (
                      <img
                        src={product.product_picture}
                        alt={product.name}
                        className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          isList
                            ? 'h-48'
                            : layout === 'grid-sm'
                            ? 'h-40'
                            : layout === 'grid-lg'
                            ? 'h-72'
                            : 'h-56'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-full flex items-center justify-center ${
                          isList
                            ? 'h-48'
                            : layout === 'grid-sm'
                            ? 'h-40'
                            : layout === 'grid-lg'
                            ? 'h-72'
                            : 'h-56'
                        }`}
                      >
                        <Flower2
                          className="text-amber-300"
                          size={layout === 'grid-sm' ? 40 : 56}
                        />
                      </div>
                    )}

                    {product.status === 'coming_soon' && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="p-2 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors"
                        title="Add to wishlist"
                      >
                        <Heart size={16} />
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={addingId === product.id}
                        className="p-2 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-60"
                        title="Add to cart"
                      >
                        {addingId === product.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className={`font-semibold text-gray-800 truncate ${
                          layout === 'grid-sm' ? 'text-sm' : 'text-base'
                        }`}
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {product.category_name || 'Flowers'}
                      </p>
                    </div>

                    <div
                      className={`flex items-center justify-between mt-3 ${
                        layout === 'grid-sm' ? 'flex-col gap-2 items-start' : ''
                      }`}
                    >
                      <span
                        className={`font-bold text-amber-600 ${
                          layout === 'grid-sm' ? 'text-sm' : 'text-base'
                        }`}
                      >
                        TSh {price.toLocaleString()}
                      </span>

                      {layout !== 'grid-sm' && (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingId === product.id}
                          className="px-3 py-1 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-60 flex items-center gap-1"
                        >
                          {addingId === product.id ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Adding…
                            </>
                          ) : (
                            'Add to Cart'
                          )}
                        </button>
                      )}

                      {layout === 'grid-sm' && (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingId === product.id}
                          className="w-full px-2 py-1 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
                        >
                          {addingId === product.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart size={12} />
                              Add
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Count */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Showing {visibleProducts.length} of {products.length} products
        </div>
      </div>
    </div>
  );
};

export default SinglePage;