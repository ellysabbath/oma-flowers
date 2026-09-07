// src/pages/distributor/Settings.tsx
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
  Globe,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';

const DistributorSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@omaflowers.com',
    phone: '+255 712 345 678',
    address: 'Dar es Salaam, Tanzania',
    region: 'Kinondoni',
    city: 'Dar es Salaam'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    orderUpdates: true,
    commissionUpdates: true,
    bonusUpdates: true,
    promotionalEmails: false
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
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
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium disabled:opacity-50"
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
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-amber-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={profileData.region}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Lock size={20} className="text-amber-500" />
                Change Password
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                  <Eye size={14} onClick={() => setShowPassword(!showPassword)} />
                  {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            {/* Notification Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-amber-500" />
                Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email Notifications</span>
                  <button
                    onClick={() => handleNotificationToggle('emailNotifications')}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.emailNotifications ? 'bg-amber-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.emailNotifications ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">SMS Notifications</span>
                  <button
                    onClick={() => handleNotificationToggle('smsNotifications')}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.smsNotifications ? 'bg-amber-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.smsNotifications ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Order Updates</span>
                  <button
                    onClick={() => handleNotificationToggle('orderUpdates')}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.orderUpdates ? 'bg-amber-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.orderUpdates ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Commission Updates</span>
                  <button
                    onClick={() => handleNotificationToggle('commissionUpdates')}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.commissionUpdates ? 'bg-amber-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.commissionUpdates ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bonus Updates</span>
                  <button
                    onClick={() => handleNotificationToggle('bonusUpdates')}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${notificationSettings.bonusUpdates ? 'bg-amber-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${notificationSettings.bonusUpdates ? 'translate-x-5' : ''}`} />
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
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-amber-500" />
                Security
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Two-Factor Authentication</span>
                  <button className="relative w-10 h-5 rounded-full bg-gray-300 transition-colors duration-200">
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Session Management</span>
                  <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    View Sessions
                  </button>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Login History</span>
                  <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorSettings;