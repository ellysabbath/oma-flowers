// src/components/home/ProductOffers.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower2, Loader2 } from 'lucide-react';
import { productAPI } from '../../api/products';
import type { Product } from '../../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const num = (v: number | string | undefined | null): number =>
  v === undefined || v === null ? 0 : Number(v);

/* ------------------------------------------------------------------ */
/* ProductOffers                                                       */
/* ------------------------------------------------------------------ */

const ProductOffers: React.FC = () => {
  const navigate = useNavigate();

  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Fetch two products for the two offer cards ---------- */
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

        // Take the two with the highest stock (swap for a `featured` flag later)
        const picks = [...active]
          .sort((a, b) => (b.stock || 0) - (a.stock || 0))
          .slice(0, 2);

        if (!cancelled) setOffers(picks);
      } catch (err) {
        console.error('Failed to load product offers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  if (offers.length === 0) {
    return (
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <Flower2 className="text-amber-300 mx-auto mb-3" size={48} />
          <p className="text-gray-500">
            No offers available right now. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((product) => {
            const price = num(product.effective_price ?? product.price);
            // Placeholder discount of 15% until you add a real discount field
            const discountPercent = 15;

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 mb-2 truncate">
                    {product.category_name
                      ? `Fresh ${product.category_name}`
                      : 'Fresh Flowers'}
                  </p>
                  <h3 className="text-primary text-xl font-bold truncate">
                    {product.name}
                  </h3>
                  <h2 className="text-4xl font-bold text-secondary">
                    {discountPercent}%{' '}
                    <span className="text-primary font-normal">Off</span>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    From TSh {price.toLocaleString()}
                  </p>
                </div>

                {/* Product image or flower icon */}
                <div className="w-32 h-32 shrink-0 flex items-center justify-center bg-amber-50 rounded-xl overflow-hidden ml-4">
                  {product.product_picture ? (
                    <img
                      src={product.product_picture}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Flower2 className="text-amber-300" size={56} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductOffers;