// src/pages/Bestseller.tsx
import React from 'react';
import { Star, ShoppingCart, Heart, TrendingUp, Award } from 'lucide-react';
import { products } from '../components/data/data';

const Bestseller: React.FC = () => {
  const bestsellers = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="text-amber-500" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">Bestsellers</h1>
          </div>
          <p className="text-gray-600">Our top selling products loved by customers</p>
        </div>

        {/* Bestsellers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellers.map((product, index) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative">
                <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Award size={14} />
                  #{index + 1} Best Seller
                </div>
                <img
                  src={product.image || `https://via.placeholder.com/300x300/amber/white?text=${product.name}`}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                    <ShoppingCart size={18} />
                  </button>
                  <button className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                    <Heart size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <h3 className="font-semibold text-gray-800 mt-2">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category || 'Flowers'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-amber-600">TSh {product.price?.toLocaleString() || '0'}</span>
                  <button className="px-4 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bestseller;