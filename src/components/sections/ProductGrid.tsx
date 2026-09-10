// src/components/home/ProductGrid.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, Flower2 } from 'lucide-react';
import ProductCard from '../common/ProductCard';
import { productAPI } from '../../api/products';
import { categoryAPI } from '../../api/categories';
import type { Product, Category } from '../../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

/* Map backend Product -> shape ProductCard expects */
const toCardProduct = (p: Product) => {
  const price = num(p.effective_price ?? p.price);
  return {
    id: p.id,
    name: p.name,
    category: p.category_name || 'Flowers',
    price,
    // Placeholder "was" price until you add a real discount field
    originalPrice: Number((price * 1.15).toFixed(2)),
    image: p.product_picture || '',
    badge:
      p.status === 'coming_soon'
        ? 'Coming Soon'
        : p.status === 'inactive'
        ? 'Unavailable'
        : '',
    raw: p,
  };
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All Products');

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
        console.error('Failed to load products for grid:', err);
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

  /* ---------- Build tabs from real categories ---------- */
  const tabs = useMemo(() => {
    const categoryNames = categories
      .map((c) => c.name)
      .filter((n): n is string => Boolean(n));
    return ['All Products', ...categoryNames];
  }, [categories]);

  /* ---------- Filter products by active tab ---------- */
  const visibleProducts = useMemo(() => {
    const base =
      activeTab === 'All Products'
        ? products
        : products.filter(
            (p) =>
              (p.category_name || '').toLowerCase() ===
              activeTab.toLowerCase()
          );

    return base.slice(0, 8).map(toCardProduct);
  }, [products, activeTab]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={40} />
          <p className="text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  /* ---------- Empty ---------- */
  if (products.length === 0) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <Flower2 className="text-amber-300 mx-auto mb-3" size={48} />
          <h3 className="text-lg font-medium text-gray-600">
            No products yet
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Products will appear here once they're added in the admin panel.
          </p>
        </div>
      </section>
    );
  }

  /* ---------- Render ---------- */
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Our Products</h2>

          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="text-center py-12">
            <Flower2 className="text-amber-300 mx-auto mb-3" size={48} />
            <p className="text-gray-500">
              No products in “{activeTab}” yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;