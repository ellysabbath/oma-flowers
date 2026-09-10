// src/pages/Category.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Grid,
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
import type { Product, Category as CategoryType } from '../types';

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

/* ---------- Wishlist helpers ---------- */

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

const Category: React.FC = () => {
  const { category: codeParam } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<CategoryType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');

  const [addingId, setAddingId] = useState<number | null>(null);
  const [wishlistIds, setWishlistIds] = useState<number[]>(() =>
    readWishlistIds()
  );

  /* ---------- Load category + matching products ---------- */
  useEffect(() => {
    if (!codeParam) return;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [cats, allProducts] = await Promise.all([
          categoryAPI.getAll(),
          productAPI.getAll(),
        ]);

        const catList: CategoryType[] = Array.isArray(cats)
          ? cats
          : (cats as any)?.results || [];
        const prodList: Product[] = Array.isArray(allProducts)
          ? allProducts
          : (allProducts as any)?.results || [];

        // Match by CODE (case-insensitive) — the Navigation links use codes
        const found =
          catList.find(
            (c) => c.code.toLowerCase() === codeParam.toLowerCase()
          ) || null;

        // Match products by their category name (backend sends category_name)
        const matching = found
          ? prodList.filter(
              (p) =>
                p.category_name?.toLowerCase() ===
                  found.name.toLowerCase() ||
                p.category_code?.toLowerCase() === found.code.toLowerCase()
            )
          : [];

        if (!cancelled) {
          setCategory(found);
          setProducts(matching);
        }
      } catch (err: any) {
        console.error('Failed to load category:', err);
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              'Failed to load category.'
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
  }, [codeParam]);

  /* ---------- Sync wishlist ---------- */
  useEffect(() => {
    const onWishlistUpdated = () => setWishlistIds(readWishlistIds());
    window.addEventListener('wishlist:updated', onWishlistUpdated);
    return () =>
      window.removeEventListener('wishlist:updated', onWishlistUpdated);
  }, []);

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

  /* ---------- Wishlist toggle ---------- */
  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
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
  const goToProduct = (product: Product) =>
    navigate(`/products/${product.id}`);

  /* ---------- Sort ---------- */
  const visibleProducts = useMemo(() => {
    const list = [...products];
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
      case 'bv':
        list.sort(
          (a, b) =>
            num(b.effective_bv ?? b.bv) - num(a.effective_bv ?? a.bv)
        );
        break;
      case 'newest':
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;
      default:
        // featured = highest sales first
        list.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
    }
    return list;
  }, [products, sortBy]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  /* ---------- Error / not found ---------- */
  if (error || !category) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h2 className="text-xl font-bold text-gray-800">
            Category not found
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {error || `No category matches "${codeParam}".`}
          </p>
          <Link
            to="/shop"
            className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-amber-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-amber-600">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-amber-600">{category.code}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-4xl font-bold text-gray-800">
              {category.name}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                category.type === 'Classic'
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-purple-100 text-purple-700 border-purple-200'
              }`}
            >
              {category.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
              Class {category.class_type}
            </span>
          </div>

          <p className="text-gray-600 mt-2">
            {category.description ||
              `Browse products in the ${category.name} category`}
          </p>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>
              <span className="font-medium text-gray-700">
                {category.code}
              </span>{' '}
              · {category.bv} BV · TSh {num(category.price).toLocaleString()}
            </span>
            <span>·</span>
            <span>
              {visibleProducts.length}{' '}
              {visibleProducts.length === 1 ? 'product' : 'products'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="bv">Sort by BV</option>
              <option value="newest">Newest</option>
            </select>
            <div className="flex gap-2 ml-auto">
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

        {/* Empty */}
        {visibleProducts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-12 text-center">
            <Flower2 className="mx-auto text-amber-300" size={48} />
            <h3 className="mt-4 text-lg font-medium text-gray-600">
              No products in this category yet
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Check back soon — new flowers are added regularly.
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
                  onClick={() => goToProduct(product)}
                  className={`bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer ${
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
                          viewMode === 'list' ? 'h-48' : 'h-56'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-full flex items-center justify-center ${
                          viewMode === 'list' ? 'h-48' : 'h-56'
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

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToProduct(product);
                        }}
                        className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => handleToggleWishlist(product, e)}
                        className={`p-2.5 rounded-full transition-colors ${
                          liked
                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                            : 'bg-white hover:bg-amber-500 hover:text-white'
                        }`}
                        title={
                          liked
                            ? 'Remove from wishlist'
                            : 'Add to wishlist'
                        }
                      >
                        <Heart
                          size={18}
                          className={liked ? 'fill-white' : ''}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
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
                      <h3 className="font-semibold text-gray-800 hover:text-amber-600 transition-colors truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-400">{product.sku}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {product.category_name || '—'}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
                        }}
                        disabled={
                          addingId === product.id ||
                          product.status === 'coming_soon'
                        }
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;