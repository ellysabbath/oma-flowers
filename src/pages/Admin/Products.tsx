// src/pages/admin/Products.tsx
import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  Tag,
  DollarSign,
  TrendingUp,
  Layers,
  ChevronDown
} from 'lucide-react';

// Product data based on OMA Flowers business plan
interface Product {
  id: string;
  code: string;
  name: string;
  category: 'Classic' | 'Luxury';
  class: 'A' | 'B' | 'C';
  bv: number;
  price: number;
  description: string;
  status: 'Active' | 'Inactive' | 'Coming Soon';
  stock: number;
  sales: number;
}

const productsData: Product[] = [
  {
    id: '1',
    code: 'CCA',
    name: 'Classic Class A Flower',
    category: 'Classic',
    class: 'A',
    bv: 6,
    price: 56000,
    description: 'Premium quality flowers for home and office decoration. Perfect for daily arrangements and special occasions.',
    status: 'Active',
    stock: 245,
    sales: 189
  },
  {
    id: '2',
    code: 'CCB',
    name: 'Classic Class B Flower',
    category: 'Classic',
    class: 'B',
    bv: 4,
    price: 34000,
    description: 'Standard quality flowers for everyday use. Ideal for regular customers and bulk orders.',
    status: 'Active',
    stock: 312,
    sales: 256
  },
  {
    id: '3',
    code: 'CCC',
    name: 'Classic Class C Flower',
    category: 'Classic',
    class: 'C',
    bv: 2,
    price: 15000,
    description: 'Budget-friendly flowers for events and large gatherings. Great value for money.',
    status: 'Active',
    stock: 189,
    sales: 423
  },
  {
    id: '4',
    code: 'LCA',
    name: 'Luxury Class A Flower',
    category: 'Luxury',
    class: 'A',
    bv: 20,
    price: 250000,
    description: 'Premium exotic flowers for special occasions. Imported from the finest growers worldwide.',
    status: 'Active',
    stock: 67,
    sales: 45
  },
  {
    id: '5',
    code: 'LCB',
    name: 'Luxury Class B Flower',
    category: 'Luxury',
    class: 'B',
    bv: 14,
    price: 160000,
    description: 'High-end flowers for weddings and corporate events. Elegant and sophisticated arrangements.',
    status: 'Active',
    stock: 89,
    sales: 78
  },
  {
    id: '6',
    code: 'LCC',
    name: 'Luxury Class C Flower',
    category: 'Luxury',
    class: 'C',
    bv: 10,
    price: 120000,
    description: 'Premium flowers for gifting and special deliveries. Beautifully packaged and presented.',
    status: 'Coming Soon',
    stock: 0,
    sales: 0
  }
];

// Category colors
const categoryColors: Record<string, string> = {
  'Classic': 'bg-blue-100 text-blue-700 border-blue-300',
  'Luxury': 'bg-purple-100 text-purple-700 border-purple-300'
};

const statusColors: Record<string, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Inactive': 'bg-red-100 text-red-700',
  'Coming Soon': 'bg-yellow-100 text-yellow-700'
};

const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'bv'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort products
  const filteredProducts = productsData
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
      } else {
        return sortOrder === 'asc' ? a.bv - b.bv : b.bv - a.bv;
      }
    });

  // Stats
  const totalProducts = productsData.length;
  const totalBV = productsData.reduce((sum, p) => sum + p.bv, 0);
  const totalValue = productsData.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const totalSales = productsData.reduce((sum, p) => sum + p.sales, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your OMA Flowers product catalog</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalProducts}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <Package className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total BV</p>
              <h3 className="text-2xl font-bold text-blue-600">{totalBV}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Tag className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Stock Value</p>
              <h3 className="text-2xl font-bold text-green-600">TSh {(totalValue/1000).toFixed(1)}K</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <DollarSign className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold text-purple-600">{totalSales}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <TrendingUp className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products by name or code..."
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Coming Soon">Coming Soon</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'bv')}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
        >
          <option value="name">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="bv">Sort by BV</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-5 hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${product.category === 'Classic' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                  <Layers className={product.category === 'Classic' ? 'text-blue-500' : 'text-purple-500'} size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400">{product.code}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[product.status]}`}>
                {product.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-amber-50/50 rounded-lg">
                <p className="text-xs text-gray-500">BV</p>
                <p className="text-sm font-bold text-amber-600">{product.bv}</p>
              </div>
              <div className="text-center p-2 bg-blue-50/50 rounded-lg">
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-sm font-bold text-blue-600">TSh {product.price.toLocaleString()}</p>
              </div>
              <div className="text-center p-2 bg-green-50/50 rounded-lg">
                <p className="text-xs text-gray-500">Stock</p>
                <p className="text-sm font-bold text-green-600">{product.stock}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-3 border-t border-amber-100/30">
              <div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${categoryColors[product.category]}`}>
                  {product.category} {product.class}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
                  <Eye size={16} className="text-gray-400 hover:text-amber-600" />
                </button>
                <button className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors">
                  <Edit size={16} className="text-gray-400 hover:text-amber-600" />
                </button>
                <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} className="text-gray-400 hover:text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${selectedProduct.category === 'Classic' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                  <Layers className={selectedProduct.category === 'Classic' ? 'text-blue-500' : 'text-purple-500'} size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedProduct.name}</h3>
                  <p className="text-sm text-amber-600">Code: {selectedProduct.code}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">BV</p>
                  <p className="text-lg font-bold text-amber-700">{selectedProduct.bv}</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-lg font-bold text-blue-700">TSh {selectedProduct.price.toLocaleString()}</p>
                </div>
                <div className="bg-green-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Stock</p>
                  <p className="text-lg font-bold text-green-700">{selectedProduct.stock}</p>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Sales</p>
                  <p className="text-lg font-bold text-purple-700">{selectedProduct.sales}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Product Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Category:</span> {selectedProduct.category}</p>
                    <p className="text-sm"><span className="text-gray-500">Class:</span> {selectedProduct.class}</p>
                    <p className="text-sm"><span className="text-gray-500">Status:</span> {selectedProduct.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-sm text-gray-600 mt-2">{selectedProduct.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  Edit Product
                </button>
                <button className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                  View Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;