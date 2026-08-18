// src/pages/Category.tsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown, ShoppingCart, Heart } from 'lucide-react';

const Category: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');

  const categoryName = category ? category.replace(/-/g, ' ') : '';

  // Mock category products
  const products = [
    { id: 1, name: 'Luxury Class A Flower', price: 250000, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=300' },
    { id: 2, name: 'Classic Class B Flower', price: 34000, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=300' },
    { id: 3, name: 'Luxury Class C Flower', price: 120000, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=300' },
  ];

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-amber-600">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-amber-600 capitalize">{categoryName}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-800 mb-2 capitalize">{categoryName}</h1>
        <p className="text-gray-600 mb-8">Browse products in {categoryName} category</p>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <div className="flex gap-2 ml-auto">
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

        {/* Products */}
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden group">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button className="p-2 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                    <ShoppingCart size={18} />
                  </button>
                  <button className="p-2 bg-white rounded-full hover:bg-amber-500 hover:text-white transition-colors">
                    <Heart size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <p className="text-lg font-bold text-amber-600 mt-2">TSh {product.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Category;