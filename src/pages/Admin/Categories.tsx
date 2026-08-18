// src/pages/admin/Categories.tsx
import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  Eye,
  Tag,
  Package,
  Flower2,
  Gift,
  Sparkles,
  Layers,
  ChevronDown,
  FolderTree
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  type: 'Classic' | 'Luxury';
  classType: 'A' | 'B' | 'C';
  bv: number;
  price: number;
  productCount: number;
  status: 'Active' | 'Inactive';
  icon: React.ReactNode;
  color: string;
}

const categoriesData: Category[] = [
  {
    id: 1,
    name: 'Classic Class A Flower',
    code: 'CCA',
    description: 'Premium quality flowers for home and office decoration. Perfect for daily arrangements and special occasions.',
    type: 'Classic',
    classType: 'A',
    bv: 6,
    price: 56000,
    productCount: 12,
    status: 'Active',
    icon: <Flower2 size={20} />,
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    id: 2,
    name: 'Classic Class B Flower',
    code: 'CCB',
    description: 'Standard quality flowers for everyday use. Ideal for regular customers and bulk orders.',
    type: 'Classic',
    classType: 'B',
    bv: 4,
    price: 34000,
    productCount: 8,
    status: 'Active',
    icon: <Flower2 size={20} />,
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    id: 3,
    name: 'Classic Class C Flower',
    code: 'CCC',
    description: 'Budget-friendly flowers for events and large gatherings. Great value for money.',
    type: 'Classic',
    classType: 'C',
    bv: 2,
    price: 15000,
    productCount: 15,
    status: 'Active',
    icon: <Flower2 size={20} />,
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    id: 4,
    name: 'Luxury Class A Flower',
    code: 'LCA',
    description: 'Premium exotic flowers for special occasions. Imported from the finest growers worldwide.',
    type: 'Luxury',
    classType: 'A',
    bv: 20,
    price: 250000,
    productCount: 5,
    status: 'Active',
    icon: <Sparkles size={20} />,
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  {
    id: 5,
    name: 'Luxury Class B Flower',
    code: 'LCB',
    description: 'High-end flowers for weddings and corporate events. Elegant and sophisticated arrangements.',
    type: 'Luxury',
    classType: 'B',
    bv: 14,
    price: 160000,
    productCount: 7,
    status: 'Active',
    icon: <Sparkles size={20} />,
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  {
    id: 6,
    name: 'Luxury Class C Flower',
    code: 'LCC',
    description: 'Premium flowers for gifting and special deliveries. Beautifully packaged and presented.',
    type: 'Luxury',
    classType: 'C',
    bv: 10,
    price: 120000,
    productCount: 0,
    status: 'Inactive',
    icon: <Sparkles size={20} />,
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  }
];

// Category groups
const categoryGroups = [
  {
    name: 'Classic Flowers',
    icon: <Flower2 size={18} />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    categories: categoriesData.filter(c => c.type === 'Classic')
  },
  {
    name: 'Luxury Flowers',
    icon: <Sparkles size={18} />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    categories: categoriesData.filter(c => c.type === 'Luxury')
  }
];

const Categories: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filteredCategories = categoriesData.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || c.type === filterType;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCategories = categoriesData.length;
  const activeCategories = categoriesData.filter(c => c.status === 'Active').length;
  const totalBV = categoriesData.reduce((sum, c) => sum + c.bv, 0);
  const totalProducts = categoriesData.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories and classifications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium">
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Categories</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalCategories}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-lg">
              <FolderTree className="text-amber-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Categories</p>
              <h3 className="text-2xl font-bold text-green-600">{activeCategories}</h3>
            </div>
            <div className="p-2.5 bg-green-50 rounded-lg">
              <Tag className="text-green-500" size={20} />
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
              <Layers className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <h3 className="text-2xl font-bold text-purple-600">{totalProducts}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Package className="text-purple-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryGroups.map((group) => (
          <div key={group.name} className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg ${group.bgColor}`}>
                <span className={group.color}>{group.icon}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{group.name}</h3>
              <span className="text-xs text-gray-400 ml-auto">{group.categories.length} categories</span>
            </div>
            <div className="space-y-2">
              {group.categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-amber-50/50 transition-colors border border-amber-100/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${cat.color}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{cat.name}</p>
                      <p className="text-xs text-gray-400">BV: {cat.bv} • {cat.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {cat.status}
                    </span>
                    <button className="p-1 hover:bg-amber-100 rounded-lg transition-colors">
                      <Edit size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search categories by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[150px]"
        >
          <option value="All">All Types</option>
          <option value="Classic">Classic</option>
          <option value="Luxury">Luxury</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white min-w-[130px]"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <button className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-amber-50/50 border-b border-amber-200/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Products</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/30">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => setSelectedCategory(category)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        {category.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{category.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{category.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {category.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.type === 'Classic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {category.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-amber-600">{category.bv}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">TSh {category.price.toLocaleString()}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">{category.productCount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-amber-100/30 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredCategories.length} of {categoriesData.length} categories</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Previous</button>
            <button className="px-3 py-1 rounded-lg bg-amber-500 text-white">1</button>
            <button className="px-3 py-1 rounded-lg hover:bg-amber-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Category Details Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCategory(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-amber-100/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${selectedCategory.color}`}>
                  {selectedCategory.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedCategory.name}</h3>
                  <p className="text-sm text-amber-600">Code: {selectedCategory.code}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCategory(null)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-amber-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm font-bold text-amber-700">{selectedCategory.type}</p>
                </div>
                <div className="bg-blue-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="text-sm font-bold text-blue-700">{selectedCategory.classType}</p>
                </div>
                <div className="bg-green-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">BV</p>
                  <p className="text-sm font-bold text-green-700">{selectedCategory.bv}</p>
                </div>
                <div className="bg-purple-50/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Products</p>
                  <p className="text-sm font-bold text-purple-700">{selectedCategory.productCount}</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm text-gray-700 mt-1">{selectedCategory.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">Name:</span> {selectedCategory.name}</p>
                    <p className="text-sm"><span className="text-gray-500">Code:</span> {selectedCategory.code}</p>
                    <p className="text-sm"><span className="text-gray-500">Type:</span> {selectedCategory.type}</p>
                    <p className="text-sm"><span className="text-gray-500">Class:</span> {selectedCategory.classType}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pricing Information</p>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm"><span className="text-gray-500">BV:</span> {selectedCategory.bv}</p>
                    <p className="text-sm"><span className="text-gray-500">Price:</span> TSh {selectedCategory.price.toLocaleString()}</p>
                    <p className="text-sm"><span className="text-gray-500">Products:</span> {selectedCategory.productCount}</p>
                    <p className="text-sm"><span className="text-gray-500">Status:</span> {selectedCategory.status}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-amber-100/30 pt-4 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                  Edit Category
                </button>
                <button className="flex-1 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                  View Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;