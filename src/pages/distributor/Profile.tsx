// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  User as UserIcon,
  Calendar,
  BadgeCheck,
  Shield,
  Loader2,
  AlertCircle,
  RefreshCw,
  Edit,
  Award,
  Users,
  TrendingUp,
  Clock,
  KeyRound,
  CheckCircle2,
  XCircle,
  Globe,
  Building2,
  Hash,
  AtSign,
  Briefcase,
  Flag,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext'; 
import { authAPI } from '../../api/auth'; 
import { distributorAPI } from '../../api/distributors'; 
import ProfilePictureUpload from '../../components/common/ProfilePictureUpload';
import type { User, Distributor } from '../../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const formatShortDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
};

const roleLabel = (t?: string) =>
  t === 'admin'
    ? 'Administrator'
    : t === 'distributor'
    ? 'Distributor'
    : t === 'customer'
    ? 'Customer'
    : '—';

const roleColors: Record<string, string> = {
  admin: 'bg-amber-100 text-amber-800 border-amber-300',
  distributor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  customer: 'bg-blue-100 text-blue-800 border-blue-300',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-gray-100 text-gray-600 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  banned: 'bg-red-100 text-red-700 border-red-200',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const Profile: React.FC = () => {
  const { user: contextUser, updateUser } = useAuth();

  const [profile, setProfile] = useState<User | null>(
    (contextUser as any) || null
  );
  const [distributor, setDistributor] = useState<Distributor | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Load fresh profile from API ---------- */
  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh: any = await authAPI.getProfile();
      const userObj = fresh?.data ?? fresh;
      setProfile(userObj);
      if (updateUser && userObj) updateUser(userObj);

      // If distributor, load their profile
      if (userObj?.user_type === 'distributor') {
        try {
          const distRes: any = await distributorAPI.getMyHierarchy();
          const distData =
            distRes?.distributor ?? distRes?.data?.distributor;
          if (distData) setDistributor(distData as Distributor);
        } catch {
          setDistributor(null);
        }
      }
    } catch (e: any) {
      console.error('Profile load failed:', e);
      setError(
        e?.response?.data?.detail || e?.message || 'Failed to load profile'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Upload handler ---------- */
  const handleUploadSuccess = async (url: string) => {
    try {
      const result: any = await authAPI.updateProfile({
        profile_picture: url,
      });
      const updated = result?.data ?? result;
      if (updated) {
        setProfile(updated);
        if (updateUser) updateUser(updated);
      } else if (profile) {
        const next = { ...profile, profile_picture: url };
        setProfile(next);
        if (updateUser) updateUser(next);
      }
    } catch (e) {
      console.error('Profile picture update failed:', e);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2">
          <AlertCircle size={18} className="mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Couldn't load your profile</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={loadProfile}
              className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center text-gray-500">
        No user data.
      </div>
    );
  }

  const displayName =
    profile.full_name ||
    `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
    profile.username ||
    profile.email ||
    'User';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ============================================================ */}
        {/* HEADER                                                       */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Decorative gradient strip */}
          <div className="h-24 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

          <div className="px-6 pb-6 -mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                <ProfilePictureUpload
                  size="xl"
                  editable={true}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={(e) => console.error(e)}
                />
              </div>

              {/* Identity */}
              <div className="flex-1 text-center md:text-left min-w-0 pb-2">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {displayName}
                </h1>
                <p className="text-gray-500 truncate flex items-center justify-center md:justify-start gap-1 mt-1">
                  <Mail size={14} /> {profile.email}
                </p>

                {/* Chips */}
                <div className="flex flex-wrap items-center gap-2 mt-3 justify-center md:justify-start">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      roleColors[profile.user_type] ||
                      'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    <Shield size={12} />
                    {roleLabel(profile.user_type)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      statusColors[profile.status] ||
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {profile.status === 'active' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {profile.status}
                  </span>
                  {profile.email_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <BadgeCheck size={12} />
                      Email verified
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-end pb-2">
                <Link
                  to="/profile/edit"
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm flex items-center gap-2 shadow-sm"
                >
                  <Edit size={14} /> Edit Profile
                </Link>
                <Link
                  to="/change-password"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                >
                  <KeyRound size={14} /> Change Password
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3-COLUMN KPI STRIP                                           */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiTile
            icon={<UserIcon size={20} />}
            label="Username"
            value={profile.username}
            color="blue"
          />
          <KpiTile
            icon={<Hash size={20} />}
            label="User ID"
            value={`#${profile.id}`}
            color="amber"
          />
          <KpiTile
            icon={<Calendar size={20} />}
            label="Member Since"
            value={formatShortDate(profile.created_at)}
            color="green"
          />
        </div>

        {/* ============================================================ */}
        {/* PERSONAL INFORMATION                                         */}
        {/* ============================================================ */}
        <Section
          icon={<UserIcon size={18} />}
          title="Personal Information"
          description="Your name and account identifier"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <Field label="First name" value={profile.first_name} />
            <Field label="Last name" value={profile.last_name} />
            <Field
              label="Full name"
              value={profile.full_name}
              icon={<UserIcon size={14} />}
            />
            <Field
              label="Username"
              value={profile.username}
              icon={<AtSign size={14} />}
            />
            <Field
              label="Email address"
              value={profile.email}
              icon={<Mail size={14} />}
            />
            <Field
              label="User ID"
              value={`#${profile.id}`}
              icon={<Hash size={14} />}
            />
          </div>
        </Section>

        {/* ============================================================ */}
        {/* CONTACT & LOCATION                                           */}
        {/* ============================================================ */}
        <Section
          icon={<MapPin size={18} />}
          title="Contact & Location"
          description="How we can reach you"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <Field
              label="Phone number"
              value={profile.phone}
              icon={<Phone size={14} />}
            />
            <Field
              label="Country"
              value={profile.country}
              icon={<Flag size={14} />}
            />
            <Field label="Region" value={profile.region} />
            <Field label="City" value={profile.city} />
          </div>
        </Section>

        {/* ============================================================ */}
        {/* DISTRIBUTOR PROFILE (only if applicable)                     */}
        {/* ============================================================ */}
        {profile.user_type === 'distributor' && distributor && (
          <Section
            icon={<Award size={18} />}
            title="Distributor Profile"
            description="Your network marketing performance"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatTile
                label="Rank"
                value={distributor.rank}
                color="amber"
              />
              <StatTile
                label="Level"
                value={String(distributor.level)}
                color="blue"
              />
              <StatTile
                label="Bonus %"
                value={`${distributor.bonus_percentage}%`}
                color="green"
              />
              <StatTile
                label="Join Date"
                value={formatShortDate(distributor.join_date)}
                color="purple"
              />
              <StatTile
                label="PBV"
                value={String(distributor.pbv)}
                color="amber"
                icon={<TrendingUp size={14} />}
              />
              <StatTile
                label="CGV"
                value={String(distributor.cgv)}
                color="blue"
                icon={<TrendingUp size={14} />}
              />
              <StatTile
                label="Downline"
                value={String(distributor.downline_count ?? 0)}
                color="green"
                icon={<Users size={14} />}
              />
              <StatTile
                label="Active Downline"
                value={String(distributor.active_downline_count ?? 0)}
                color="purple"
                icon={<Users size={14} />}
              />
            </div>
          </Section>
        )}

        {/* ============================================================ */}
        {/* ACCOUNT & SECURITY                                           */}
        {/* ============================================================ */}
        <Section
          icon={<Shield size={18} />}
          title="Account & Security"
          description="Your account type and verification status"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <Field
              label="Account type"
              value={roleLabel(profile.user_type)}
              icon={<Shield size={14} />}
            />
            <Field
              label="Status"
              value={profile.status}
              icon={
                profile.status === 'active' ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <XCircle size={14} />
                )
              }
            />
            <Field
              label="Email verified"
              value={profile.email_verified ? 'Yes' : 'No'}
              icon={<BadgeCheck size={14} />}
            />
            {profile.email_verified_at && (
              <Field
                label="Email verified on"
                value={formatDate(profile.email_verified_at)}
                icon={<Calendar size={14} />}
              />
            )}
          </div>
        </Section>

        {/* ============================================================ */}
        {/* ACCOUNT TIMELINE                                             */}
        {/* ============================================================ */}
        <Section
          icon={<Clock size={18} />}
          title="Account Timeline"
          description="Key events in your account history"
        >
          <div className="space-y-1">
            <TimelineRow
              icon={<Calendar size={14} />}
              label="Account created"
              value={formatDate(profile.created_at)}
              accent="amber"
            />
            {profile.date_joined && (
              <TimelineRow
                icon={<UserIcon size={14} />}
                label="Date joined"
                value={formatDate(profile.date_joined)}
                accent="blue"
              />
            )}
            {profile.email_verified_at && (
              <TimelineRow
                icon={<BadgeCheck size={14} />}
                label="Email verified"
                value={formatDate(profile.email_verified_at)}
                accent="green"
              />
            )}
            {profile.updated_at && (
              <TimelineRow
                icon={<RefreshCw size={14} />}
                label="Last updated"
                value={formatDate(profile.updated_at)}
                accent="purple"
              />
            )}
            <TimelineRow
              icon={<Clock size={14} />}
              label="Last login"
              value={profile.last_login ? formatDate(profile.last_login) : 'No data'}
              accent="gray"
            />
          </div>
        </Section>

        {/* ============================================================ */}
        {/* SYSTEM FLAGS (is_active, is_staff, is_superuser)             */}
        {/* ============================================================ */}
        {(profile.is_active !== undefined ||
          profile.is_staff !== undefined ||
          profile.is_superuser !== undefined) && (
          <Section
            icon={<Briefcase size={18} />}
            title="System Flags"
            description="Internal account properties"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.is_active !== undefined && (
                <FlagTile
                  label="Is Active"
                  value={profile.is_active}
                  activeColor="green"
                />
              )}
              {profile.is_staff !== undefined && (
                <FlagTile
                  label="Is Staff"
                  value={profile.is_staff}
                  activeColor="blue"
                />
              )}
              {profile.is_superuser !== undefined && (
                <FlagTile
                  label="Is Superuser"
                  value={profile.is_superuser}
                  activeColor="amber"
                />
              )}
            </div>
          </Section>
        )}

        {/* ============================================================ */}
        {/* FOOTER                                                       */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-2xl border border-amber-200/40 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Building2 size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                OMA Flowers Co. LTD
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Your profile is linked to your account. All changes are
                saved automatically and applied across the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* Sub-components                                                      */
/* ================================================================== */

/* ---------- Section card ---------- */
interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({
  icon,
  title,
  description,
  children,
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex items-start gap-3 mb-5">
      <div className="p-2 bg-amber-50 text-amber-500 rounded-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

/* ---------- Label + value field ---------- */
interface FieldProps {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, value, icon }) => {
  const display =
    value === null || value === undefined || value === ''
      ? 'Not set'
      : String(value);
  const isNotSet = display === 'Not set';

  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wide text-gray-400 flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span
        className={`text-sm mt-1 break-words ${
          isNotSet
            ? 'text-gray-400 italic'
            : 'font-medium text-gray-800'
        }`}
      >
        {display}
      </span>
    </div>
  );
};

/* ---------- KPI tile (top strip) ---------- */
interface KpiTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'amber' | 'blue' | 'green' | 'purple';
}

const KpiTile: React.FC<KpiTileProps> = ({ icon, label, value, color }) => {
  const colors = {
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  }[color];

  return (
    <div className={`rounded-xl border p-4 ${colors}`}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-80">
        {icon}
        {label}
      </div>
      <p className="text-lg font-bold mt-2 truncate">{value}</p>
    </div>
  );
};

/* ---------- Stat tile (distributor section) ---------- */
interface StatTileProps {
  label: string;
  value: string;
  color: 'amber' | 'blue' | 'green' | 'purple';
  icon?: React.ReactNode;
}

const StatTile: React.FC<StatTileProps> = ({ label, value, color, icon }) => {
  const colors = {
    amber: 'bg-amber-50/60 text-amber-700',
    blue: 'bg-blue-50/60 text-blue-700',
    green: 'bg-green-50/60 text-green-700',
    purple: 'bg-purple-50/60 text-purple-700',
  }[color];

  return (
    <div className={`rounded-lg p-3 ${colors}`}>
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide opacity-70">
        {icon}
        {label}
      </div>
      <p className="text-base font-bold mt-1 truncate">{value}</p>
    </div>
  );
};

/* ---------- Timeline row ---------- */
interface TimelineRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'amber' | 'blue' | 'green' | 'purple' | 'gray';
}

const TimelineRow: React.FC<TimelineRowProps> = ({
  icon,
  label,
  value,
  accent,
}) => {
  const accents = {
    amber: 'text-amber-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    gray: 'text-gray-400',
  }[accent];

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 text-gray-600 min-w-0">
        <span className={`${accents} shrink-0`}>{icon}</span>
        <span className="text-sm truncate">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-800 text-right shrink-0">
        {value}
      </span>
    </div>
  );
};

/* ---------- Flag tile (is_active, is_staff, ...) ---------- */
interface FlagTileProps {
  label: string;
  value: boolean;
  activeColor: 'green' | 'blue' | 'amber';
}

const FlagTile: React.FC<FlagTileProps> = ({
  label,
  value,
  activeColor,
}) => {
  const activeColors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }[activeColor];

  const inactiveColors = 'bg-gray-50 text-gray-500 border-gray-200';

  return (
    <div
      className={`rounded-xl border p-4 flex items-center gap-3 ${
        value ? activeColors : inactiveColors
      }`}
    >
      {value ? (
        <CheckCircle2 size={20} />
      ) : (
        <XCircle size={20} />
      )}
      <div>
        <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-sm font-bold mt-0.5">
          {value ? 'Enabled' : 'Disabled'}
        </p>
      </div>
    </div>
  );
};

export default Profile;