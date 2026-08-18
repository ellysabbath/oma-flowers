// src/pages/Account.tsx
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit, Save, UserCircle, Package, Heart, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Account: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+255 712 345 678',
    address: 'Dar es Salaam, Tanzania'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-amber-50/30 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <UserCircle size={40} className="text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mt-2">{formData.name}</h3>
                <p className="text-sm text-gray-500">{formData.email}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-amber-100/30 space-y-2">
                <Link to="/account" className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg">
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <Link to="/orders" className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors">
                  <Package size={16} />
                  <span>My Orders</span>
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors">
                  <Heart size={16} />
                  <span>Wishlist</span>
                </Link>
                <Link to="/settings" className="flex items-center gap-2 px-3 py-2 hover:bg-amber-50 rounded-lg transition-colors">
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
                <button
                  onClick={() => isEditing ? handleSubmit : setIsEditing(true)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  {isEditing ? <Save size={16} /> : <Edit size={16} />}
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;