// src/pages/shop/Inventory.tsx
import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const productsData: Product[] = [
  { id: 1, name: 'Classic Class A Flower', code: 'CCA', category: 'Classic', price: 56000, stock: 245, status: 'In Stock' },
  { id: 2, name: 'Classic Class B Flower', code: 'CCB', category: 'Classic', price: 34000, stock: 312, status: 'In Stock' },
  { id: 3, name: 'Classic Class C Flower', code: 'CCC', category: 'Classic', price: 15000, stock: 189, status: 'In Stock' },
  { id: 4, name: 'Luxury Class A Flower', code: 'LCA', category: 'Luxury', price: 250000, stock: 67, status: 'Low Stock' },
  { id: 5, name: 'Luxury Class B Flower', code: 'LCB', category: 'Luxury', price: 160000, stock: 89, status: 'In Stock' },
  { id: 6, name: 'Luxury Class C Flower', code: 'LCC', category: 'Luxury', price: 120000, stock: 0, status: 'Out of Stock' },
];

const statusColors = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-yellow-100 text-yellow-700',
  'Out of Stock': 'bg-red-100 text-red-700'
};

const ShopInventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredProducts = productsData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = productsData.length;
  const totalStock = productsData.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = productsData.filter(p => p.status === 'Low Stock').length;
  const outOfStock = productsData.filter(p => p.status === 'Out of Stock').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500">Manage shop inventory</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors shadow-md hover:shadow-lg text-sm font-medium">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <h3 className="text-2xl font-bold text-gray-800">{totalProducts}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Total Stock</p>
          <h3 className="text-2xl font-bold text-blue-600">{totalStock}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Low Stock</p>
          <h3 className="text-2xl font-bold text-yellow-600">{lowStock}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <h3 className="text-2xl font-bold text-red-600">{outOfStock}</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          <option value="All">All Categories</option>
          <option value="Classic">Classic</option>
          <option value="Luxury">Luxury</option>
        </select>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-200/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {product.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 font-medium text-amber-600">TSh {product.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
                        <Edit size={16} className="text-gray-400 hover:text-amber-600" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-amber-100/30 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredProducts.length} of {productsData.length} products</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-amber-500 text-white">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopInventory;