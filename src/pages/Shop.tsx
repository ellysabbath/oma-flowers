// src/pages/Shop.tsx
import React, { useState } from 'react';
import { Search, Filter, Grid, List, ChevronDown, ShoppingCart, Heart, Eye } from 'lucide-react';
import { products } from '../components/data/data';

const Shop: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [category, setCategory] = useState('all');

  const categories = ['All', 'Classic', 'Luxury', 'Gift', 'Decoration'];

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Our Shop</h1>
          <p className="text-gray-600 mt-2">Browse our beautiful collection of flowers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
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
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
          {products.slice(0, 12).map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative overflow-hidden">
                <img
                  src={product.image || `https://via.placeholder.com/300x300/amber/white?text=${product.name}`}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.sale && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Sale
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                    <Eye size={18} />
                  </button>
                  <button className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                    <Heart size={18} />
                  </button>
                  <button className="p-2.5 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 hover:text-amber-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{product.category || 'Flowers'}</p>
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

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
            <button className="px-4 py-2 bg-amber-500 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-amber-50 transition-colors">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-amber-50 transition-colors">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;