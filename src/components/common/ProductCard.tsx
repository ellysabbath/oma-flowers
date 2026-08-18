import React from 'react';
import { Star, ShoppingCart, RefreshCw, Heart, Eye } from 'lucide-react';
import Button from './Button';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    image: string;
    badge: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card group">
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
        {product.badge && (
          <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
            product.badge === 'New' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {product.badge}
          </span>
        )}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
            <Eye size={18} className="text-gray-600" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-500 text-sm">{product.category}</p>
        <h3 className="font-semibold text-lg mt-1">{product.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <span className="line-through text-gray-400">${product.originalPrice.toFixed(2)}</span>
          <span className="text-primary font-bold text-lg">${product.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button variant="primary" className="text-sm py-2 px-4">
            <ShoppingCart size={16} className="inline mr-2" /> Add To Cart
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} />
            </div>
            <button className="p-1 hover:text-primary transition-colors">
              <RefreshCw size={16} />
            </button>
            <button className="p-1 hover:text-primary transition-colors">
              <Heart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;