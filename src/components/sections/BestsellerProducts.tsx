import React from 'react';
import { Eye, ShoppingCart, RefreshCw, Heart } from 'lucide-react';
import Button from '../common/Button';

interface BestsellerProductsProps {
  products: Array<{
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    image: string;
    badge: string;
  }>;
}

const BestsellerProducts: React.FC<BestsellerProductsProps> = ({ products }) => {
  return (
    <section className="py-12 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h4 className="text-primary inline-block border-b-2 border-primary pb-2 mb-4 font-semibold">Bestseller Products</h4>
          <p className="text-gray-600">Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi, asperiores ducimus sint quos tempore officia similique quia?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 6).map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex">
              <div className="w-2/5 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <button className="absolute bottom-2 right-2 p-2 bg-primary rounded-full text-white hover:bg-blue-600 transition-colors">
                  <Eye size={16} />
                </button>
              </div>
              <div className="w-3/5 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{product.category}</p>
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="line-through text-gray-400">${product.originalPrice.toFixed(2)}</span>
                    <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <Button variant="primary" className="text-sm py-1 px-3">
                    <ShoppingCart size={14} className="inline mr-1" /> Add
                  </Button>
                  <div className="flex gap-2">
                    <button className="p-1 hover:text-primary transition-colors">
                      <RefreshCw size={14} />
                    </button>
                    <button className="p-1 hover:text-primary transition-colors">
                      <Heart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestsellerProducts;