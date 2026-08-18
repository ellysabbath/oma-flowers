// src/pages/SinglePage.tsx
import React, { useState } from 'react';
import { Star, ShoppingCart, Heart, Share2, Minus, Plus, Truck, Shield, RefreshCw } from 'lucide-react';

const SinglePage: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const product = {
    name: 'Luxury Class A Flower Bouquet',
    price: 250000,
    rating: 4.8,
    reviews: 127,
    description: 'Premium exotic flowers for special occasions. Imported from the finest growers worldwide. Each bouquet is carefully handcrafted by our expert florists to ensure the highest quality and beauty.',
    details: [
      'Fresh flowers sourced from premium growers',
      'Handcrafted by expert florists',
      'Elegant gift wrapping included',
      'Delivery within 24 hours',
      'Suitable for all occasions'
    ]
  };

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => q > 1 ? q - 1 : 1);

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <span className="hover:text-amber-600 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="hover:text-amber-600 cursor-pointer">Shop</span>
          <span className="mx-2">/</span>
          <span className="text-amber-600">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="bg-amber-50/30 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600"
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              <div className="grid grid-cols-4 gap-2 p-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-amber-50 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all">
                    <img
                      src={`https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150&h=150&fit=crop`}
                      alt={`Thumbnail ${i}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </div>
                    <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-amber-50 transition-colors">
                    <Heart size={20} className="text-gray-400" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-amber-50 transition-colors">
                    <Share2 size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-3xl font-bold text-amber-600">TSh {product.price.toLocaleString()}</span>
                <span className="ml-2 text-sm text-gray-400 line-through">TSh 320,000</span>
                <span className="ml-2 text-sm text-green-600">Save 22%</span>
              </div>

              <p className="mt-4 text-gray-600 leading-relaxed">{product.description}</p>

              {/* Quantity */}
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={decreaseQuantity}
                    className="px-4 py-2 hover:bg-amber-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 min-w-[40px] text-center font-medium">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="px-4 py-2 hover:bg-amber-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="flex-1 px-6 py-3 border border-amber-500 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-colors">
                  Buy Now
                </button>
              </div>

              {/* Features */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck size={18} className="text-amber-500" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={18} className="text-amber-500" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RefreshCw size={18} className="text-amber-500" />
                  <span>30 Day Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-amber-100/30">
            <div className="flex overflow-x-auto border-b border-amber-100/30">
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
                <div>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}
              {activeTab === 'details' && (
                <ul className="space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
              {activeTab === 'reviews' && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePage;