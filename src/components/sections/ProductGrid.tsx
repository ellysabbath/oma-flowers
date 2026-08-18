import React, { useState } from 'react';
import ProductCard from '../common/ProductCard';

interface ProductGridProps {
  products: Array<{
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice: number;
    image: string;
    badge: string;
  }>;
  tabs: string[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, tabs }) => {
  const [activeTab, setActiveTab] = useState('All Products');

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Our Products</h2>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full transition-colors ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;