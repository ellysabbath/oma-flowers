// src/pages/Search.tsx
import React, { useState } from 'react';
import { Search as SearchIcon, Filter, Grid, List, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const Search: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);

  // Mock search results
  const results = query ? [
    { id: 1, name: 'Luxury Class A Flower', price: 250000, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150' },
    { id: 2, name: 'Classic Class B Flower', price: 34000, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150' },
  ] : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Search Results</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
            >
              <SearchIcon size={18} />
              Search
            </button>
          </div>
        </form>

        {query && results.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No Results Found</h3>
            <p className="text-gray-500 mt-2">We couldn't find any products matching "{query}"</p>
            <Link to="/shop" className="inline-block mt-4 text-amber-600 hover:text-amber-700 font-medium">
              Browse All Products →
            </Link>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">Showing {results.length} results for "{query}"</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <p className="text-lg font-bold text-amber-600 mt-2">TSh {product.price.toLocaleString()}</p>
                    <button className="w-full mt-3 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Search;