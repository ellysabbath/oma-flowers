// src/pages/Wishlist.tsx
import React, { useState } from 'react';
import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState([
    { id: 1, name: 'Luxury Class A Flower', price: 250000, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150' },
    { id: 2, name: 'Classic Class B Flower', price: 34000, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150' },
    { id: 3, name: 'Luxury Class C Flower', price: 120000, image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=150' },
  ]);

  const removeItem = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="text-center">
          <Heart size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mt-2">Start saving your favorite items</p>
          <Link to="/shop" className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden group">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                >
                  <X size={16} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-lg font-bold text-amber-600 mt-2">TSh {item.price.toLocaleString()}</p>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 px-4 py-2 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="px-4 py-2 border border-red-300 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
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

export default Wishlist;