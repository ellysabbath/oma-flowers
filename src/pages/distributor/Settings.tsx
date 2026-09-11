// src/pages/distributor/Settings.tsx
import React, { useEffect, useState } from 'react';
import {
  User,
  Lock,
  Bell,
  Shield,
  Save,
  RefreshCw,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

import api from '../../api'; // your axios wrapper
import { distributorAPI } from '../../api/distributors';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  city: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  commissionUpdates: boolean;
  bonusUpdates: boolean;
  promotionalEmails: boolean;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const pickName = (p: any): string => {
  if (!p) return '';
  const candidates = [
    p?.user?.full_name,
    p?.user?.fullName,
    p?.user?.name,
    p?.full_name,
    p?.fullName,
    p?.name,
    p?.user?.username,
    p?.username,
    p?.user?.first_name && p?.user?.last_name
      ? `${p.user.first_name} ${p.user.last_name}`
      : null,
    p?.first_name && p?.last_name
      ? `${p.first_name} ${p.last_name}`
      : null,
  ];
  for (const c of candidates) {
    if (c && String(c).trim()) return String(c).trim();
  }
  return '';
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const DistributorSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [myProfile, setMyProfile] = useState<any | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    region: '',
    city: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      emailNotifications: true,
      smsNotifications: true,
      orderUpdates: true,
      commissionUpdates: true,
      bonusUpdates: true,
      promotionalEmails: false,
    });

  /* ================================================================ */
  /* Load profile from backend                                         */
  /* ================================================================ */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      let profile: any = null;
      try {
        const h: any = await distributorAPI.getMyHierarchy();
        profile =
          h?.distributor ??
          h?.data?.distributor ??
          h?.data ??
          h;
      } catch {
        // Not a distributor — try the plain user endpoint
        try {
          const me: any = await api.get('/auth/users/me/');
          profile = { user: me?.data ?? me };
        } catch {
          profile = null;
        }
      }

      setMyProfile(profile);

      const u = profile?.user ?? profile ?? {};

      setProfileData({
        name: pickName(profile) || u?.full_name || u?.username || '',
        email: u?.email || '',
        phone: u?.phone_number || u?.phone || '',
        address: u?.address || profile?.address || '',
        region: u?.region || profile?.region || '',
        city: u?.city || profile?.city || '',
      });
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to load profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================ */
  /* Handlers                                                          */
  /* ================================================================ */

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const u = myProfile?.user ?? myProfile ?? {};

      // 1) Update User fields (name / email / phone / address / region / city)
      const userPayload: any = {};
      if (profileData.email) userPayload.email = profileData.email;
      if (profileData.phone) userPayload.phone_number = profileData.phone;
      if (profileData.address) userPayload.address = profileData.address;
      if (profileData.region) userPayload.region = profileData.region;
      if (profileData.city) userPayload.city = profileData.city;

      // Split name into first/last (fallback to full_name if backend supports it)
      const parts = profileData.name.trim().split(/\s+/);
      if (parts.length > 0) {
        userPayload.first_name = parts[0];
        if (parts.length > 1) userPayload.last_name = parts.slice(1).join(' ');
        userPayload.full_name = profileData.name.trim();
      }

      if (Object.keys(userPayload).length > 0 && u?.id) {
        await api.patch(`/auth/users/${u.id}/`, userPayload);
      }

      // 2) Notification prefs (only if your backend stores them)
      // await api.patch(`/auth/users/${u?.id}/preferences/`, notificationSettings);

      // Reload to reflect server-side values
      await loadProfile();

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSaveError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          'Failed to save settings.'
      );
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.post('/auth/password/change/', {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setPasswordError(
        err?.response?.data?.detail ||
          err?.response?.data?.old_password?.[0] ||
          err?.response?.data?.new_password?.[0] ||
          'Failed to change password.'
      );
      setTimeout(() => setPasswordError(null), 5000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  /* ================================================================ */
  /* Loading / error                                                   */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <p className="font-medium">Failed to load settings</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={loadProfile}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  return (
    <div className="min-h-screen bg-amber-50/30 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-500 mt-1">
              {profileData.name
                ? `${profileData.name} — manage your account preferences`
                : 'Manage your account preferences'}
            </p>
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
            {saveError && (
              <span className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle size={16} />
                {saveError}
              </span>
            )}
          </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={profileData.region}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showPassword ? 'Hide Passwords' : 'Show Passwords'}
                  </button>

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isChangingPassword ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>

                {passwordSuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-2.5">
                    <Check size={16} />
                    Password updated successfully.
                  </div>
                )}
                {passwordError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
                    <AlertCircle size={16} />
                    {passwordError}
                  </div>
                )}
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
                {(
                  [
                    ['emailNotifications', 'Email Notifications'],
                    ['smsNotifications', 'SMS Notifications'],
                    ['orderUpdates', 'Order Updates'],
                    ['commissionUpdates', 'Commission Updates'],
                    ['bonusUpdates', 'Bonus Updates'],
                    ['promotionalEmails', 'Promotional Emails'],
                  ] as [keyof NotificationSettings, string][]
                ).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">{label}</span>
                    <button
                      onClick={() => handleNotificationToggle(key)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        notificationSettings[key]
                          ? 'bg-amber-500'
                          : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notificationSettings[key] ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                ))}
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
                  <span className="text-sm text-gray-600">
                    Two-Factor Authentication
                  </span>
                  <button className="relative w-10 h-5 rounded-full bg-gray-300 transition-colors duration-200">
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Session Management
                  </span>
                  <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    View Sessions
                  </button>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    Login History
                  </span>
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