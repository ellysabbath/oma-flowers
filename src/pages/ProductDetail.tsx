// src/pages/ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Loader2,
  AlertCircle,
  Flower2,
} from 'lucide-react';
import { productAPI } from '../api/products';
import { cartAPI } from '../api/cart';
import type { Product } from '../types';

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

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) {
        setError('No product selected.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response: any = await productAPI.getById(Number(id));
        const data: Product = response?.id ? response : response?.data ?? response;
        if (!cancelled) setProduct(data);
      } catch (err: any) {
        console.error('Failed to load product:', err);
        if (!cancelled) {
          setError(
            err?.response?.data?.detail ||
              err?.message ||
              'Failed to load product.'
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
  }, [id]);

  const handleAddToCart = async (goToCheckout = false) => {
    if (!product) return;
    setAdding(true);
    try {
      const userId = getCurrentUserId();
      const sessionKey = userId ? null : getOrCreateSessionKey();
      const cart = await cartAPI.getOrCreateForUser(userId, sessionKey);
      await cartAPI.addItem(cart.id, {
        product: product.id,
        quantity,
      });
      window.dispatchEvent(new Event('cart:updated'));
      navigate(goToCheckout ? '/checkout' : '/cart');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={48} />
          <h2 className="text-xl font-bold text-gray-800">
            Product not available
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            {error || 'This product may have been removed.'}
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

  const price = num(product.effective_price ?? product.price);

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-amber-600">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-amber-600">{product.name}</span>
        </nav>

        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            <div className="bg-amber-50 rounded-lg overflow-hidden">
              <div className="w-full h-96 flex items-center justify-center">
                {product.product_picture ? (
                  <img
                    src={product.product_picture}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Flower2 className="text-amber-300" size={128} />
                )}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
                <span className="text-sm text-gray-500">
                  ({product.sales || 0} sold)
                </span>
              </div>

              <div className="mt-4">
                <span className="text-3xl font-bold text-amber-600">
                  TSh {price.toLocaleString()}
                </span>
              </div>

              <p className="mt-4 text-gray-600 leading-relaxed">
                {product.description || 'Fresh flowers, hand-arranged daily.'}
              </p>

              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-amber-50 disabled:opacity-40"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 min-w-[40px] text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-2 hover:bg-amber-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  {product.stock ?? 0} in stock
                </span>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={adding}
                  className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={adding}
                  className="flex-1 px-6 py-3 border border-amber-500 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 disabled:opacity-60"
                >
                  Buy Now
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck size={18} className="text-amber-500" />
                  Free Delivery
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={18} className="text-amber-500" />
                  Secure Payment
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RefreshCw size={18} className="text-amber-500" />
                  30 Day Returns
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-100/30">
            <div className="flex border-b border-amber-100/30">
              {['Description', 'Details', 'Reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'text-amber-600 border-b-2 border-amber-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              )}
              {activeTab === 'details' && (
                <ul className="space-y-2">
                  {[
                    `Category: ${product.category_name || 'N/A'}`,
                    `SKU: ${product.sku}`,
                    `BV: ${product.effective_bv ?? product.bv ?? 0}`,
                    `Stock: ${product.stock ?? 0} available`,
                  ].map((d, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'reviews' && (
                <p className="text-center text-gray-400 py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;