// src/pages/shop/Settings.tsx
import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Bell, 
  Shield,
  Save,
  RefreshCw,
  Check,
  Store,
  Clock,
  DollarSign
} from 'lucide-react';

const ShopSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [shopData, setShopData] = useState({
    name: 'OMA Flowers - Dar es Salaam',
    email: 'shop.dar@omaflowers.com',
    phone: '+255 712 345 678',
    address: 'Dar es Salaam, Tanzania',
    openingHours: '8:00 AM - 6:00 PM',
    currency: 'TSh',
    taxRate: '18'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    orderNotifications: true,
    inventoryAlerts: true,
    customerUpdates: true,
    promotionalEmails: false,
    systemUpdates: true
  });

  const handleShopChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShopData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Shop Settings</h1>
          <p className="text-gray-500">Manage your shop preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors shadow-md hover:shadow-lg text-sm font-medium disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
        {saveSuccess && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <Check size={16} />
            Saved!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Store size={20} className="text-amber-500" />
              Shop Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <input
                  type="text"
                  name="name"
                  value={shopData.name}
                  onChange={handleShopChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={shopData.email}
                  onChange={handleShopChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={shopData.phone}
                  onChange={handleShopChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={shopData.address}
                  onChange={handleShopChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                <input
                  type="text"
                  name="openingHours"
                  value={shopData.openingHours}
                  onChange={handleShopChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  name="currency"
                  value={shopData.currency}
                  onChange={handleShopChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                >
                  <option value="TSh">TSh</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={shopData.taxRate}
                  onChange={handleShopChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Preferences */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-amber-500" />
              Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order Notifications</span>
                <button
                  onClick={() => handleNotificationToggle('orderNotifications')}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.orderNotifications ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.orderNotifications ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inventory Alerts</span>
                <button
                  onClick={() => handleNotificationToggle('inventoryAlerts')}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.inventoryAlerts ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.inventoryAlerts ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Customer Updates</span>
                <button
                  onClick={() => handleNotificationToggle('customerUpdates')}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.customerUpdates ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.customerUpdates ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Promotional Emails</span>
                <button
                  onClick={() => handleNotificationToggle('promotionalEmails')}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.promotionalEmails ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.promotionalEmails ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Updates</span>
                <button
                  onClick={() => handleNotificationToggle('systemUpdates')}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.systemUpdates ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.systemUpdates ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-amber-500" />
              Shop Security
            </h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">
                Change Password
              </button>
              <button className="w-full px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium">
                Manage Staff
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                View Activity Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSettings;