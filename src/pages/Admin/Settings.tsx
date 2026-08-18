// src/pages/admin/Settings.tsx
import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Globe,
  Mail,
  Smartphone,
  Palette,
  Database,
  Cloud,
  Lock,
  Key,
  Users,
  Store,
  DollarSign,
  Percent,
  Calendar,
  Clock,
  Save,
  RefreshCw,
  ChevronDown,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface GeneralSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCurrency: string;
  timezone: string;
  dateFormat: string;
}

interface CommissionSettings {
  baseRate: number;
  currency: string;
  calculationMethod: string;
  minPayout: number;
  payoutFrequency: string;
}

interface BonusSettings {
  consistencyBonus: boolean;
  referralBonus: boolean;
  dynamicBonus: boolean;
  trainingBonus: boolean;
  eventBonus: boolean;
  festivalBonus: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  commissionUpdates: boolean;
  bonusUpdates: boolean;
  systemUpdates: boolean;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    storeName: 'OMA Flowers Co. LTD',
    storeEmail: 'info@omaflowers.com',
    storePhone: '+255 712 345 678',
    storeAddress: 'Dar es Salaam, Tanzania',
    storeCurrency: 'TSh',
    timezone: 'Africa/Dar_es_Salaam',
    dateFormat: 'DD/MM/YYYY'
  });

  // Commission Settings
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>({
    baseRate: 2500,
    currency: 'TSh',
    calculationMethod: 'PBV × Percentage × 2,500',
    minPayout: 20000,
    payoutFrequency: 'Monthly'
  });

  // Bonus Settings
  const [bonusSettings, setBonusSettings] = useState<BonusSettings>({
    consistencyBonus: true,
    referralBonus: true,
    dynamicBonus: true,
    trainingBonus: true,
    eventBonus: true,
    festivalBonus: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    commissionUpdates: true,
    bonusUpdates: true,
    systemUpdates: false
  });

  const tabs: SettingSection[] = [
    { id: 'general', title: 'General', icon: <SettingsIcon size={18} />, description: 'Store information and basic settings' },
    { id: 'commission', title: 'Commission', icon: <DollarSign size={18} />, description: 'Commission rates and calculations' },
    { id: 'bonus', title: 'Bonuses', icon: <Percent size={18} />, description: 'Bonus program settings' },
    { id: 'notifications', title: 'Notifications', icon: <Bell size={18} />, description: 'Email and notification preferences' },
    { id: 'security', title: 'Security', icon: <Shield size={18} />, description: 'Security and access settings' }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCommissionSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleBonusToggle = (key: keyof BonusSettings) => {
    setBonusSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your store settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-amber-200/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/30' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-amber-50/20'
                }
              `}
            >
              {tab.icon}
              {tab.title}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">General Settings</h3>
                <p className="text-sm text-gray-500">Basic store information and configuration</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={generalSettings.storeName}
                    onChange={handleGeneralChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                  <input
                    type="email"
                    name="storeEmail"
                    value={generalSettings.storeEmail}
                    onChange={handleGeneralChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Phone</label>
                  <input
                    type="text"
                    name="storePhone"
                    value={generalSettings.storePhone}
                    onChange={handleGeneralChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                  <input
                    type="text"
                    name="storeAddress"
                    value={generalSettings.storeAddress}
                    onChange={handleGeneralChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    name="storeCurrency"
                    value={generalSettings.storeCurrency}
                    onChange={handleGeneralChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  >
                    <option value="TSh">TSh - Tanzanian Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="UGX">UGX - Ugandan Shilling</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    name="timezone"
                    value={generalSettings.timezone}
                    onChange={handleGeneralChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  >
                    <option value="Africa/Dar_es_Salaam">Africa/Dar es Salaam</option>
                    <option value="Africa/Nairobi">Africa/Nairobi</option>
                    <option value="Africa/Kampala">Africa/Kampala</option>
                    <option value="Africa/Lagos">Africa/Lagos</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select
                    name="dateFormat"
                    value={generalSettings.dateFormat}
                    onChange={handleGeneralChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Commission Settings */}
          {activeTab === 'commission' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Commission Settings</h3>
                <p className="text-sm text-gray-500">Configure commission rates and calculations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Rate (per BV)</label>
                  <input
                    type="number"
                    name="baseRate"
                    value={commissionSettings.baseRate}
                    onChange={handleCommissionChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Commission calculation: PBV × Percentage × Base Rate</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    name="currency"
                    value={commissionSettings.currency}
                    onChange={handleCommissionChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  >
                    <option value="TSh">TSh</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Payout</label>
                  <input
                    type="number"
                    name="minPayout"
                    value={commissionSettings.minPayout}
                    onChange={handleCommissionChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payout Frequency</label>
                  <select
                    name="payoutFrequency"
                    value={commissionSettings.payoutFrequency}
                    onChange={handleCommissionChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-200/30">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Current Formula:</span> {commissionSettings.calculationMethod}
                </p>
                <p className="text-xs text-gray-500 mt-1">Example: 350 PBV × 32% × 2,500 = TSh 280,000</p>
              </div>
            </div>
          )}

          {/* Bonus Settings */}
          {activeTab === 'bonus' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Bonus Settings</h3>
                <p className="text-sm text-gray-500">Enable or disable bonus programs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(bonusSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {value ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBonusToggle(key as keyof BonusSettings)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                        value ? 'bg-amber-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        value ? 'translate-x-6' : ''
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
                <p className="text-sm text-gray-500">Configure notification preferences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Channels</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Email Notifications</span>
                      <button
                        onClick={() => handleNotificationToggle('emailNotifications')}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          notificationSettings.emailNotifications ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notificationSettings.emailNotifications ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">SMS Notifications</span>
                      <button
                        onClick={() => handleNotificationToggle('smsNotifications')}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          notificationSettings.smsNotifications ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notificationSettings.smsNotifications ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Push Notifications</span>
                      <button
                        onClick={() => handleNotificationToggle('pushNotifications')}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          notificationSettings.pushNotifications ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notificationSettings.pushNotifications ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Events</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Order Updates</span>
                      <button
                        onClick={() => handleNotificationToggle('orderUpdates')}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          notificationSettings.orderUpdates ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notificationSettings.orderUpdates ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Commission Updates</span>
                      <button
                        onClick={() => handleNotificationToggle('commissionUpdates')}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          notificationSettings.commissionUpdates ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notificationSettings.commissionUpdates ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">Bonus Updates</span>
                      <button
                        onClick={() => handleNotificationToggle('bonusUpdates')}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          notificationSettings.bonusUpdates ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notificationSettings.bonusUpdates ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-600">System Updates</span>
                      <button
                        onClick={() => handleNotificationToggle('systemUpdates')}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          notificationSettings.systemUpdates ? 'bg-amber-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notificationSettings.systemUpdates ? 'translate-x-5' : ''
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                <p className="text-sm text-gray-500">Manage security and access controls</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock size={18} className="text-amber-500" />
                    <h4 className="font-medium text-gray-800">Change Password</h4>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="password"
                      placeholder="Current Password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    />
                    <button className="w-full px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">
                      Update Password
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Key size={18} className="text-amber-500" />
                    <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">Enable 2FA</span>
                      <button className="relative w-10 h-5 rounded-full bg-gray-300 transition-colors duration-200">
                        <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                    <button className="w-full px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium">
                      Set Up 2FA
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-50/30 rounded-lg border border-red-200/30">
                <h4 className="text-sm font-medium text-red-600">Danger Zone</h4>
                <p className="text-xs text-gray-500 mt-1">These actions cannot be undone</p>
                <div className="mt-3 flex gap-3">
                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                    Clear All Data
                  </button>
                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;