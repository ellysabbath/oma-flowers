// src/components/home/ProductBanners.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower2, Loader2 } from 'lucide-react';
import Button from '../common/Button';
import { productAPI } from '../../api/products';
import type { Product } from '../../types';

/* ------------------------------------------------------------------ */
/* ProductBanners                                                      */
/* ------------------------------------------------------------------ */

const ProductBanners: React.FC = () => {
  const navigate = useNavigate();

  const [leftProduct, setLeftProduct] = useState<Product | null>(null);
  const [rightProduct, setRightProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Fetch two products to fill the two banners ---------- */
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

        // Left banner: highest BV active flower
        const leftPick =
          [...active].sort(
            (a, b) => (b.effective_bv || 0) - (a.effective_bv || 0)
          )[0] || null;

        // Right banner: highest-selling flower that isn't the left one
        const rightPick =
          [...active]
            .filter((p) => p.id !== leftPick?.id)
            .sort((a, b) => (b.sales || 0) - (a.sales || 0))[0] ||
          active[0] ||
          null;

        if (!cancelled) {
          setLeftProduct(leftPick);
          setRightProduct(rightPick);
        }
      } catch (err) {
        console.error('Failed to load banner products:', err);
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

  const goToProduct = (p: Product | null) => {
    if (p) navigate(`/products/${p.id}`);
    else navigate('/products');
  };

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ---------- Left banner ---------- */}
          <div
            className="relative overflow-hidden rounded-2xl group cursor-pointer bg-amber-50 min-h-[256px]"
            onClick={() => goToProduct(leftProduct)}
          >
            {/* Image OR icon placeholder */}
            {leftProduct?.product_picture ? (
              <img
                src={leftProduct.product_picture}
                alt={leftProduct.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                <Flower2 className="text-amber-300" size={96} />
              </div>
            )}

            <div className="relative inset-0 bg-white/60 flex flex-col justify-center p-8 min-h-[256px]">
              <h3 className="text-3xl font-bold text-primary">
                {leftProduct?.category_name || 'Fresh Flowers'}
              </h3>
              <p className="text-xl text-gray-700 mt-2">
                {leftProduct?.name || 'Seasonal Bouquet'}
              </p>
              <p className="text-lg font-semibold text-gray-800 mt-1">
                {leftProduct
                  ? `TSh ${priceOf(leftProduct).toLocaleString()}`
                  : 'Browse our collection'}
              </p>
              <Button
                variant="primary"
                className="text-sm py-2 px-6 w-auto mt-4 self-start"
                onClick={(e) => {
                  e.stopPropagation();
                  goToProduct(leftProduct);
                }}
              >
                Shop Now
              </Button>
            </div>
          </div>

          {/* ---------- Right banner ---------- */}
          <div
            className="relative overflow-hidden rounded-2xl group cursor-pointer bg-amber-100 min-h-[256px]"
            onClick={() => goToProduct(rightProduct)}
          >
            {rightProduct?.product_picture ? (
              <img
                src={rightProduct.product_picture}
                alt={rightProduct.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200">
                <Flower2 className="text-orange-400" size={112} />
              </div>
            )}

            <div className="relative inset-0 bg-orange-500/60 flex flex-col justify-center items-center p-8 min-h-[256px] text-center">
              <h2 className="text-5xl font-bold text-white">FLOWERS</h2>
              <h4 className="text-2xl text-white mt-2">
                {rightProduct?.name || 'Fresh Picks of the Week'}
              </h4>
              {rightProduct && (
                <p className="text-white text-lg mt-2">
                  <span className="line-through opacity-75 mr-2">
                    TSh {originalOf(rightProduct).toLocaleString()}
                  </span>
                  <span className="font-bold">
                    TSh {priceOf(rightProduct).toLocaleString()}
                  </span>
                </p>
              )}
              <Button
                variant="secondary"
                className="text-sm py-2 px-6 w-auto mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  goToProduct(rightProduct);
                }}
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductBanners;