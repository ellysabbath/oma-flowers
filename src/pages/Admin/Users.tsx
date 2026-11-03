// src/pages/Admin/Users.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  KeyRound,
  Loader2,
  RefreshCw,
  AlertCircle,
  X,
  UserCog,
  Ban,
  Activity as ActivityIcon,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShoppingBag,
  ShoppingCart,
  Wallet,
  Award,
  Store,
  Users,
  LogIn,
  LogOut,
  History,
  Filter,
  ChevronRight,
} from 'lucide-react';

import {
  adminUsersAPI,
  type AdminUser,
  type AdminUserStats,
} from '../../api/adminUsers';
import type {
  AdminUserFullDetail,
  AdminUserActivity,
  ActivityEventType,
} from '../../types/Admin';
import { SkeletonUsersPage } from '../../components/common/Skeleton';

/* ------------------------------------------------------------------ */
/* Local types                                                        */
/* ------------------------------------------------------------------ */

type Role = 'admin' | 'distributor' | 'customer';

interface UserFormState {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  user_type: Role;
  status: string;
  password: string;
}

const emptyForm: UserFormState = {
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  phone: '',
  country: '',
  region: '',
  city: '',
  user_type: 'customer',
  status: 'active',
  password: '',
};

/* ------------------------------------------------------------------ */
/* Colors                                                             */
/* ------------------------------------------------------------------ */

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-300',
  distributor: 'bg-blue-100 text-blue-700 border-blue-300',
  customer: 'bg-gray-100 text-gray-700 border-gray-300',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-300',
  banned: 'bg-red-100 text-red-700 border-red-300',
  inactive: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

/* ================================================================== */
/* Component                                                          */
/* ================================================================== */

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | Role>('All');
  const [filterStatus, setFilterStatus] = useState('All');

  /* Modals */
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewing, setViewing] = useState<AdminUser | null>(null);

  const [confirmAction, setConfirmAction] = useState<
    | { kind: 'delete'; user: AdminUser }
    | { kind: 'ban'; user: AdminUser }
    | { kind: 'unban'; user: AdminUser }
    | { kind: 'activate'; user: AdminUser }
    | { kind: 'deactivate'; user: AdminUser }
    | { kind: 'verify'; user: AdminUser }
    | null
  >(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const [passwordFor, setPasswordFor] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [roleFor, setRoleFor] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<Role>('customer');
  const [roleBusy, setRoleBusy] = useState(false);

  const [banner, setBanner] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  /* Full-inspect drawer */
  const [inspectId, setInspectId] = useState<number | null>(null);

  /* ---------------------------------------------------------------- */
  /* Load                                                             */
  /* ---------------------------------------------------------------- */

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, st] = await Promise.all([
        adminUsersAPI.list({ page_size: 200 }),
        adminUsersAPI.stats().catch(() => null),
      ]);
      setUsers(Array.isArray(list?.results) ? list.results : []);
      setStats(st);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load users.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------- */
  /* Filters                                                          */
  /* ---------------------------------------------------------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        (u.user_id || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.first_name || '').toLowerCase().includes(q) ||
        (u.last_name || '').toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q);
      const matchesRole = filterRole === 'All' || u.user_type === filterRole;
      const matchesStatus =
        filterStatus === 'All' || u.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  /* ---------------------------------------------------------------- */
  /* Flash                                                            */
  /* ---------------------------------------------------------------- */

  const flash = (kind: 'success' | 'error', text: string) => {
    setBanner({ kind, text });
    setTimeout(() => setBanner(null), 3500);
  };

  /* ---------------------------------------------------------------- */
  /* Form (add / edit)                                                */
  /* ---------------------------------------------------------------- */

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({
      email: u.email || '',
      username: u.username || '',
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      phone: u.phone || '',
      country: u.country || '',
      region: u.region || '',
      city: u.city || '',
      user_type: (u.user_type as Role) || 'customer',
      status: u.status || 'active',
      password: '',
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveForm = async () => {
    setFormError(null);

    if (!form.email.trim()) {
      setFormError('Email is required.');
      return;
    }
    if (!editing && !form.password) {
      setFormError('Password is required when creating a user.');
      return;
    }
    if (!editing && form.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await adminUsersAPI.update(editing.id, {
          email: form.email,
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          country: form.country,
          region: form.region,
          city: form.city,
        });

        if (form.user_type !== editing.user_type) {
          await adminUsersAPI.setRole(editing.id, form.user_type);
        }

        if (form.status !== editing.status) {
          if (form.status === 'banned') await adminUsersAPI.ban(editing.id);
          else if (form.status === 'active')
            await adminUsersAPI.activate(editing.id);
          else if (form.status === 'inactive')
            await adminUsersAPI.deactivate(editing.id);
        }

        flash('success', `User "${form.email}" updated.`);
      } else {
        await adminUsersAPI.create({
          email: form.email,
          username: form.username,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          country: form.country,
          region: form.region,
          city: form.city,
          user_type: form.user_type,
          status: form.status as any,
          password: form.password,
        });
        flash('success', `User "${form.email}" created.`);
      }

      setShowForm(false);
      await load();
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        (data &&
          typeof data === 'object' &&
          (data.detail || data.email?.[0] || data.password?.[0])) ||
        'Failed to save user.';
      setFormError(String(msg));
    } finally {
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Confirm actions                                                  */
  /* ---------------------------------------------------------------- */

  const runConfirmed = async () => {
    if (!confirmAction) return;
    setConfirmBusy(true);
    try {
      const { kind, user } = confirmAction;
      if (kind === 'delete') {
        await adminUsersAPI.remove(user.id);
        flash('success', `Deleted ${user.email}.`);
      } else if (kind === 'ban') {
        await adminUsersAPI.ban(user.id);
        flash('success', `Banned ${user.email}.`);
      } else if (kind === 'unban') {
        await adminUsersAPI.unban(user.id);
        flash('success', `Unbanned ${user.email}.`);
      } else if (kind === 'activate') {
        await adminUsersAPI.activate(user.id);
        flash('success', `Activated ${user.email}.`);
      } else if (kind === 'deactivate') {
        await adminUsersAPI.deactivate(user.id);
        flash('success', `Deactivated ${user.email}.`);
      } else if (kind === 'verify') {
        await adminUsersAPI.verifyEmail(user.id);
        flash('success', `Marked ${user.email} as email-verified.`);
      }
      setConfirmAction(null);
      await load();
    } catch (err: any) {
      flash('error', err?.response?.data?.detail || 'Action failed.');
    } finally {
      setConfirmBusy(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Password modal                                                   */
  /* ---------------------------------------------------------------- */

  const openPassword = (u: AdminUser) => {
    setPasswordFor(u);
    setNewPassword('');
    setPasswordError(null);
  };

  const submitPassword = async () => {
    if (!passwordFor) return;
    setPasswordError(null);
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setPasswordBusy(true);
    try {
      await adminUsersAPI.setPassword(passwordFor.id, newPassword);
      flash('success', `Password updated for ${passwordFor.email}.`);
      setPasswordFor(null);
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.detail || 'Failed to update password.'
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Role modal                                                       */
  /* ---------------------------------------------------------------- */

  const openRole = (u: AdminUser) => {
    setRoleFor(u);
    setNewRole((u.user_type as Role) || 'customer');
  };

  const submitRole = async () => {
    if (!roleFor) return;
    setRoleBusy(true);
    try {
      await adminUsersAPI.setRole(roleFor.id, newRole);
      flash('success', `${roleFor.email} is now ${newRole}.`);
      setRoleFor(null);
      await load();
    } catch (err: any) {
      flash('error', err?.response?.data?.detail || 'Failed to change role.');
    } finally {
      setRoleBusy(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Loading / error                                                  */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return <SkeletonUsersPage rows={10} />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <p className="font-medium">Failed to load users</p>
          </div>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={load}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Banner */}
      {banner && (
        <div
          className={`rounded-lg p-3 flex items-center gap-2 text-sm ${
            banner.kind === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {banner.kind === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="flex-1">{banner.text}</span>
          <button onClick={() => setBanner(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all accounts, roles, access — and inspect every action
            they've taken
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200/30 text-amber-600 rounded-lg hover:bg-amber-50 transition-all duration-300 text-sm font-medium"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats.total} tone="amber" />
          <StatCard label="Admins" value={stats.admins} tone="purple" />
          <StatCard label="Distributors" value={stats.distributors} tone="blue" />
          <StatCard label="Customers" value={stats.customers} tone="gray" />
          <StatCard label="Active" value={stats.active} tone="green" />
          <StatCard label="Inactive" value={stats.inactive} tone="yellow" />
          <StatCard label="Banned" value={stats.banned} tone="red" />
          <StatCard
            label="Email verified"
            value={stats.email_verified}
            tone="green"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by OMA ID, email, name, phone…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[150px]"
        >
          <option value="All">All Roles</option>
          <option value="admin">Admin</option>
          <option value="distributor">Distributor</option>
          <option value="customer">Customer</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white min-w-[150px]"
        >
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserCog className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">No users found</p>
            <p className="text-sm">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-200/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    OMA ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/30">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">
                        {u.full_name ||
                          `${u.first_name || ''} ${u.last_name || ''}`.trim() ||
                          u.username ||
                          u.email}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {u.user_id || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          roleColors[u.user_type] || roleColors.customer
                        }`}
                      >
                        {u.user_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          statusColors[u.status] ||
                          'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      {u.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {u.date_joined
                        ? new Date(u.date_joined).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Quick view"
                          onClick={() => setViewing(u)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg"
                        >
                          <Eye
                            size={16}
                            className="text-gray-400 hover:text-amber-600"
                          />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => openEdit(u)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg"
                        >
                          <Pencil
                            size={16}
                            className="text-gray-400 hover:text-amber-600"
                          />
                        </button>
                        <button
                          title="Change role"
                          onClick={() => openRole(u)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg"
                        >
                          <Shield
                            size={16}
                            className="text-gray-400 hover:text-amber-600"
                          />
                        </button>
                        <button
                          title="Set password"
                          onClick={() => openPassword(u)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg"
                        >
                          <KeyRound
                            size={16}
                            className="text-gray-400 hover:text-amber-600"
                          />
                        </button>
                        {!u.email_verified && (
                          <button
                            title="Verify email"
                            onClick={() =>
                              setConfirmAction({ kind: 'verify', user: u })
                            }
                            className="p-1.5 hover:bg-green-50 rounded-lg"
                          >
                            <CheckCircle
                              size={16}
                              className="text-green-500"
                            />
                          </button>
                        )}
                        {u.status === 'banned' ? (
                          <button
                            title="Unban"
                            onClick={() =>
                              setConfirmAction({ kind: 'unban', user: u })
                            }
                            className="p-1.5 hover:bg-green-50 rounded-lg"
                          >
                            <ShieldOff
                              size={16}
                              className="text-green-500"
                            />
                          </button>
                        ) : (
                          <button
                            title="Ban"
                            onClick={() =>
                              setConfirmAction({ kind: 'ban', user: u })
                            }
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                          >
                            <Ban size={16} className="text-red-500" />
                          </button>
                        )}
                        <button
                          title="Delete"
                          onClick={() =>
                            setConfirmAction({ kind: 'delete', user: u })
                          }
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-amber-100/30 text-sm text-gray-500">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>

      {/* Inspect Drawer */}
      {inspectId !== null && (
        <UserInspectDrawer
          userId={inspectId}
          onClose={() => setInspectId(null)}
        />
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)} maxWidth="max-w-2xl">
          <ModalHeader
            title={editing ? 'Edit User' : 'Add User'}
            subtitle={editing ? editing.email : 'Create a new account'}
            onClose={() => setShowForm(false)}
          />
          <div className="p-6 space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Email *">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleField}
                  className={inputCls}
                />
              </Field>
              <Field label="Username">
                <input
                  name="username"
                  value={form.username}
                  onChange={handleField}
                  className={inputCls}
                />
              </Field>
              <Field label="First name">
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleField}
                  className={inputCls}
                />
              </Field>
              <Field label="Last name">
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleField}
                  className={inputCls}
                />
              </Field>
              <Field label="Phone">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleField}
                  className={inputCls}
                />
              </Field>
              <Field label="Role">
                <select
                  name="user_type"
                  value={form.user_type}
                  onChange={handleField}
                  className={inputCls}
                >
                  <option value="customer">Customer</option>
                  <option value="distributor">Distributor</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Country">
                <input
                  name="country"
                  value={form.country}
                  onChange={handleField}
                  className={inputCls}
                />
              </Field>
              <Field label="Region">
                <input
                  name="region"
                  value={form.region}
                  onChange={handleField}
                  className={inputCls}
                />
              </Field>
              <Field label="City">
                <input
                  name="city"
                  value={form.city}
                  onChange={handleField}
                  className={inputCls}
                />
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleField}
                  className={inputCls}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </Field>

              {!editing && (
                <Field label="Password *" className="md:col-span-2">
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleField}
                    className={inputCls}
                  />
                </Field>
              )}
            </div>
          </div>
          <ModalFooter>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveForm}
              disabled={saving}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Save Changes' : 'Create User'}
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Quick View Modal */}
      {viewing && (
        <Modal onClose={() => setViewing(null)} maxWidth="max-w-xl">
          <ModalHeader
            title="User Details"
            subtitle={viewing.email}
            onClose={() => setViewing(null)}
          />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ReadRow label="OMA ID" value={viewing.user_id} />
            <ReadRow label="Full name" value={viewing.full_name} />
            <ReadRow label="Username" value={viewing.username} />
            <ReadRow label="Email" value={viewing.email} />
            <ReadRow label="Phone" value={viewing.phone} />
            <ReadRow label="Role" value={viewing.user_type} />
            <ReadRow label="Status" value={viewing.status} />
            <ReadRow
              label="Email verified"
              value={viewing.email_verified ? 'Yes' : 'No'}
            />
            <ReadRow
              label="Active"
              value={viewing.is_active ? 'Yes' : 'No'}
            />
            <ReadRow label="Country" value={viewing.country} />
            <ReadRow label="Region" value={viewing.region} />
            <ReadRow label="City" value={viewing.city} />
            <ReadRow
              label="Joined"
              value={
                viewing.date_joined
                  ? new Date(viewing.date_joined).toLocaleString()
                  : undefined
              }
            />
            <ReadRow
              label="Last login"
              value={
                viewing.last_login
                  ? new Date(viewing.last_login).toLocaleString()
                  : '—'
              }
            />
          </div>
          <ModalFooter>
            <button
              onClick={() => setViewing(null)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                const u = viewing;
                setViewing(null);
                setInspectId(u.id);
              }}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-2"
            >
              <ActivityIcon size={14} />
              Full profile
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <Modal onClose={() => setConfirmAction(null)} maxWidth="max-w-md">
          <ModalHeader
            title={confirmTitle(confirmAction.kind)}
            subtitle={confirmAction.user.email}
            onClose={() => setConfirmAction(null)}
          />
          <div className="p-6">
            <p className="text-sm text-gray-600">
              {confirmMessage(confirmAction.kind)}
            </p>
          </div>
          <ModalFooter>
            <button
              onClick={() => setConfirmAction(null)}
              disabled={confirmBusy}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={runConfirmed}
              disabled={confirmBusy}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 ${
                confirmAction.kind === 'delete' ||
                confirmAction.kind === 'ban'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {confirmBusy && <Loader2 size={14} className="animate-spin" />}
              Confirm
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Password Modal */}
      {passwordFor && (
        <Modal onClose={() => setPasswordFor(null)} maxWidth="max-w-md">
          <ModalHeader
            title="Set New Password"
            subtitle={passwordFor.email}
            onClose={() => setPasswordFor(null)}
          />
          <div className="p-6 space-y-4">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {passwordError}
              </div>
            )}
            <Field label="New password">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls}
                autoFocus
              />
            </Field>
          </div>
          <ModalFooter>
            <button
              onClick={() => setPasswordFor(null)}
              disabled={passwordBusy}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={submitPassword}
              disabled={passwordBusy}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
            >
              {passwordBusy && <Loader2 size={14} className="animate-spin" />}
              Update Password
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* Role Modal */}
      {roleFor && (
        <Modal onClose={() => setRoleFor(null)} maxWidth="max-w-md">
          <ModalHeader
            title="Change Role"
            subtitle={roleFor.email}
            onClose={() => setRoleFor(null)}
          />
          <div className="p-6 space-y-4">
            <Field label="Role">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className={inputCls}
              >
                <option value="customer">Customer</option>
                <option value="distributor">Distributor</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          </div>
          <ModalFooter>
            <button
              onClick={() => setRoleFor(null)}
              disabled={roleBusy}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={submitRole}
              disabled={roleBusy}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
            >
              {roleBusy && <Loader2 size={14} className="animate-spin" />}
              Save Role
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsers;

/* ================================================================== */
/* Full-inspect Drawer                                                 */
/* ================================================================== */

const UserInspectDrawer: React.FC<{
  userId: number;
  onClose: () => void;
}> = ({ userId, onClose }) => {
  const [detail, setDetail] = useState<AdminUserFullDetail | null>(null);
  const [activity, setActivity] = useState<AdminUserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<
    'overview' | 'orders' | 'commissions' | 'bonuses' | 'activity'
  >('overview');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [d, a] = await Promise.all([
        adminUsersAPI.getFullDetail(userId),
        adminUsersAPI.getActivity(userId, { limit: 300 }),
      ]);
      setDetail(d);
      setActivity(a);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load user detail.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 flex items-stretch justify-end"
      onClick={onClose}
    >
      <div
        className="bg-amber-50/40 w-full max-w-5xl h-full overflow-y-auto shadow-2xl border-l border-amber-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-amber-200/50 z-10 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <UserIcon size={16} className="text-amber-600" />
            <span>User inspector</span>
            {detail?.user?.user_id && (
              <>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {detail.user.user_id}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? 'animate-spin' : ''}
              />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {loading && !detail && (
          <div className="p-8 flex items-center gap-2 text-amber-600">
            <Loader2 className="animate-spin" size={18} /> Loading user…
          </div>
        )}

        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <p className="font-medium">Couldn't load user</p>
              </div>
              <p className="text-sm mt-1">{error}</p>
              <button
                onClick={load}
                className="mt-3 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        )}

        {detail && (
          <div className="p-5 space-y-5">
            {/* Profile card */}
            <div className="bg-white rounded-xl border border-amber-200/30 p-5">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden">
                  {detail.user.profile_picture ? (
                    <img
                      src={detail.user.profile_picture}
                      alt={detail.user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials(
                      detail.user.full_name ||
                        detail.user.username ||
                        detail.user.email
                    )
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800 truncate">
                      {detail.user.full_name ||
                        detail.user.username ||
                        detail.user.email}
                    </h2>
                    <RolePill role={detail.user.user_type} />
                    <StatusPill status={detail.user.status} />
                    {detail.user.email_verified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 border border-green-300">
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-300">
                        <XCircle size={12} /> Unverified
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                    <InfoRow
                      icon={<Mail size={14} />}
                      value={detail.user.email}
                    />
                    <InfoRow
                      icon={<Phone size={14} />}
                      value={detail.user.phone || '—'}
                    />
                    <InfoRow
                      icon={<MapPin size={14} />}
                      value={
                        [detail.user.city, detail.user.region, detail.user.country]
                          .filter(Boolean)
                          .join(', ') || '—'
                      }
                    />
                    <InfoRow
                      icon={<Clock size={14} />}
                      label="Joined"
                      value={fmtDate(detail.user.created_at)}
                    />
                    <InfoRow
                      icon={<Clock size={14} />}
                      label="Last login"
                      value={
                        detail.user.last_login
                          ? fmtDate(detail.user.last_login)
                          : 'Never'
                      }
                    />
                    <InfoRow
                      icon={<KeyRound size={14} />}
                      label="Username"
                      value={detail.user.username}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InspectorStat
                label="Orders"
                value={detail.counts.orders}
                icon={<ShoppingBag size={18} />}
                tone="amber"
              />
              <InspectorStat
                label="Commissions"
                value={detail.counts.commissions}
                icon={<Wallet size={18} />}
                tone="green"
              />
              <InspectorStat
                label="Bonuses"
                value={detail.counts.bonuses}
                icon={<Award size={18} />}
                tone="purple"
              />
              <InspectorStat
                label="Activity"
                value={detail.counts.activity_events}
                icon={<ActivityIcon size={18} />}
                tone="blue"
              />
            </div>

            {/* Totals */}
            <div className="bg-white rounded-xl border border-amber-200/30 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Financial totals
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Mini
                  label="Order revenue"
                  value={`TSh ${fmtNum(detail.totals.order_revenue)}`}
                />
                <Mini
                  label="Total BV"
                  value={fmtNum(detail.totals.total_bv)}
                />
                <Mini
                  label="Commission"
                  value={`TSh ${fmtNum(detail.totals.total_commission)}`}
                />
                <Mini
                  label="Bonuses"
                  value={`TSh ${fmtNum(detail.totals.total_bonuses)}`}
                />
              </div>
            </div>

            {/* Distributor block */}
            {detail.distributor && (
              <div className="bg-white rounded-xl border border-amber-200/30 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users size={16} className="text-amber-600" /> Distributor
                  profile
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Mini label="Rank" value={detail.distributor.rank} />
                  <Mini
                    label="Level"
                    value={String(detail.distributor.level)}
                  />
                  <Mini
                    label="PBV"
                    value={fmtNum(detail.distributor.pbv)}
                  />
                  <Mini
                    label="CGV"
                    value={fmtNum(detail.distributor.cgv)}
                  />
                  <Mini
                    label="Bonus %"
                    value={`${detail.distributor.bonus_percentage}%`}
                  />
                  <Mini
                    label="Downline"
                    value={String(detail.distributor.downline_count)}
                  />
                  <Mini
                    label="Active downline"
                    value={String(detail.distributor.active_downline_count)}
                  />
                  <Mini
                    label="Upline"
                    value={detail.distributor.upline_name || '—'}
                  />
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-amber-200/30">
              <div className="flex flex-wrap gap-1 border-b border-amber-100/50 px-2">
                <Tab
                  active={tab === 'overview'}
                  onClick={() => setTab('overview')}
                  icon={<Eye size={14} />}
                  label="Overview"
                />
                <Tab
                  active={tab === 'orders'}
                  onClick={() => setTab('orders')}
                  icon={<ShoppingBag size={14} />}
                  label={`Orders (${detail.counts.orders})`}
                />
                <Tab
                  active={tab === 'commissions'}
                  onClick={() => setTab('commissions')}
                  icon={<Wallet size={14} />}
                  label={`Commissions (${detail.counts.commissions})`}
                />
                <Tab
                  active={tab === 'bonuses'}
                  onClick={() => setTab('bonuses')}
                  icon={<Award size={14} />}
                  label={`Bonuses (${detail.counts.bonuses})`}
                />
                <Tab
                  active={tab === 'activity'}
                  onClick={() => setTab('activity')}
                  icon={<History size={14} />}
                  label={`Activity (${activity?.counts.logins ?? 0} logins)`}
                />
              </div>

              <div className="p-5">
                {tab === 'overview' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Store size={16} className="text-amber-600" /> Shops (
                      {detail.shops.length})
                    </h4>
                    {detail.shops.length === 0 ? (
                      <Empty text="No shops." />
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {detail.shops.map((s) => (
                          <div
                            key={s.id}
                            className="border border-gray-200 rounded-lg p-3 text-sm"
                          >
                            <p className="font-medium text-gray-800">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {s.location} · {s.region}
                            </p>
                            <p className="text-xs mt-1">
                              <span className="text-gray-500">
                                Performance:
                              </span>{' '}
                              {s.performance_level}
                            </p>
                            <p className="text-xs">
                              <span className="text-gray-500">Monthly:</span>{' '}
                              TSh {fmtNum(Number(s.monthly_revenue))}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 pt-2">
                      <ShoppingCart size={16} className="text-amber-600" />{' '}
                      Recent carts ({detail.recent_carts.length})
                    </h4>
                    {detail.recent_carts.length === 0 ? (
                      <Empty text="No carts." />
                    ) : (
                      <SimpleTable
                        head={[
                          'Code',
                          'Status',
                          'Items',
                          'Subtotal',
                          'Date',
                        ]}
                        rows={detail.recent_carts.map((c) => [
                          c.code,
                          c.status,
                          String(c.total_items),
                          `TSh ${fmtNum(Number(c.subtotal))}`,
                          fmtDate(c.created_at),
                        ])}
                      />
                    )}
                  </div>
                )}

                {tab === 'orders' && (
                  <>
                    {detail.recent_orders.length === 0 ? (
                      <Empty text="No orders." />
                    ) : (
                      <SimpleTable
                        head={[
                          'Order',
                          'Status',
                          'Payment',
                          'Total',
                          'BV',
                          'Date',
                        ]}
                        rows={detail.recent_orders.map((o) => [
                          o.order_number,
                          o.status,
                          o.payment_status,
                          `TSh ${fmtNum(o.total_amount)}`,
                          fmtNum(o.total_bv),
                          fmtDate(o.order_date),
                        ])}
                      />
                    )}
                  </>
                )}

                {tab === 'commissions' && (
                  <>
                    {detail.recent_commissions.length === 0 ? (
                      <Empty text="No commissions." />
                    ) : (
                      <SimpleTable
                        head={['Type', 'PBV', 'Amount', 'Status', 'Date']}
                        rows={detail.recent_commissions.map((c) => [
                          c.type,
                          c.pbv,
                          `TSh ${fmtNum(Number(c.amount))}`,
                          c.status,
                          fmtDate(c.created_at),
                        ])}
                      />
                    )}
                  </>
                )}

                {tab === 'bonuses' && (
                  <>
                    {detail.recent_bonuses.length === 0 ? (
                      <Empty text="No bonuses." />
                    ) : (
                      <SimpleTable
                        head={['Name', 'Type', 'Amount', 'Period', 'Status']}
                        rows={detail.recent_bonuses.map((b) => [
                          b.name,
                          b.type,
                          `TSh ${fmtNum(Number(b.amount))}`,
                          `${b.month} ${b.year}`,
                          b.status,
                        ])}
                      />
                    )}
                  </>
                )}

                {tab === 'activity' && activity && (
                  <ActivityFeed activity={activity} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================================================================== */
/* Activity feed                                                      */
/* ================================================================== */

const ActivityFeed: React.FC<{ activity: AdminUserActivity }> = ({
  activity,
}) => {
  const [filter, setFilter] = useState<ActivityEventType | 'all'>('all');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return activity.events.filter((e) => {
      const matchesType = filter === 'all' || e.type === filter;
      const matchesSearch =
        !query ||
        e.summary.toLowerCase().includes(query) ||
        (e.description || '').toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [activity.events, filter, q]);

  const types = useMemo(
    () => Array.from(new Set(activity.events.map((e) => e.type))),
    [activity.events]
  );

  return (
    <div className="space-y-4">
      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Mini label="Logins" value={String(activity.counts.logins)} />
        <Mini
          label="Failed logins"
          value={String(activity.counts.failed_logins)}
        />
        <Mini label="Orders" value={String(activity.counts.orders)} />
        <Mini
          label="Downline"
          value={String(activity.counts.downline_members)}
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search activity…"
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Filter size={12} />
          Filter:
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        <FilterChip
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          label="All"
        />
        {types.map((t) => (
          <FilterChip
            key={t}
            active={filter === t}
            onClick={() => setFilter(t)}
            label={prettyType(t)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty text="No activity in this range." />
      ) : (
        <ul className="relative border-l-2 border-amber-100 pl-4 space-y-4">
          {filtered.map((e) => (
            <li key={e.id} className="relative">
              <span
                className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full ${eventDot(
                  e.type
                )}`}
              />
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    {eventIcon(e.type)} {e.summary}
                  </p>
                  {e.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {e.description}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    {fmtDate(e.timestamp)}
                    {e.ip_address ? ` · ${e.ip_address}` : ''}
                  </p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-gray-400 whitespace-nowrap">
                  {prettyType(e.type)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ================================================================== */
/* Presentational helpers                                             */
/* ================================================================== */

const inputCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400';

const Modal: React.FC<{
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}> = ({ children, onClose, maxWidth = 'max-w-2xl' }) => (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <div
      className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const ModalHeader: React.FC<{
  title: string;
  subtitle?: string;
  onClose: () => void;
}> = ({ title, subtitle, onClose }) => (
  <div className="p-5 border-b border-amber-100/50 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-amber-600">{subtitle}</p>}
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
    >
      <X size={18} className="text-gray-500" />
    </button>
  </div>
);

const ModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-4 border-t border-amber-100/50 flex justify-end gap-3">
    {children}
  </div>
);

const Field: React.FC<{
  label: string;
  children: React.ReactNode;
  className?: string;
}> = ({ label, children, className = '' }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {children}
  </div>
);

const ReadRow: React.FC<{ label: string; value?: string | null }> = ({
  label,
  value,
}) => (
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-sm text-gray-800 mt-0.5">{value || '—'}</p>
  </div>
);

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label?: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <span className="text-amber-500 mt-0.5">{icon}</span>
    <span className="text-gray-800 break-all">
      {label && <span className="text-gray-500">{label}: </span>}
      {value || '—'}
    </span>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: number;
  tone: 'amber' | 'purple' | 'blue' | 'gray' | 'green' | 'yellow' | 'red';
}> = ({ label, value, tone }) => {
  const tones: Record<string, string> = {
    amber: 'text-amber-600',
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    gray: 'text-gray-700',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className={`text-2xl font-bold mt-1 ${tones[tone]}`}>{value}</h3>
    </div>
  );
};

const InspectorStat: React.FC<{
  label: string;
  value: number | string;
  icon: React.ReactNode;
  tone: 'amber' | 'green' | 'purple' | 'blue';
}> = ({ label, value, icon, tone }) => {
  const tones = {
    amber: 'text-amber-600 bg-amber-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    blue: 'text-blue-600 bg-blue-50',
  }[tone];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
      <div className={`p-2.5 rounded-lg ${tones}`}>{icon}</div>
    </div>
  );
};

const Mini: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">
      {value}
    </p>
  </div>
);

const Tab: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg ${
      active
        ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50/50'
        : 'text-gray-500 hover:text-gray-800'
    }`}
  >
    {icon}
    {label}
  </button>
);

const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
}> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded-full text-xs border ${
      active
        ? 'bg-amber-500 text-white border-amber-500'
        : 'bg-white text-gray-600 border-gray-300 hover:border-amber-300'
    }`}
  >
    {label}
  </button>
);

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <div className="p-6 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
    {text}
  </div>
);

const SimpleTable: React.FC<{ head: string[]; rows: string[][] }> = ({
  head,
  rows,
}) => (
  <div className="overflow-x-auto border border-gray-200 rounded-lg">
    <table className="w-full text-xs">
      <thead className="bg-gray-50">
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="px-3 py-2 text-left font-medium text-gray-500"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} className="px-3 py-2 text-gray-700">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const RolePill: React.FC<{ role: string }> = ({ role }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs border ${
      role === 'admin'
        ? 'bg-purple-100 text-purple-700 border-purple-300'
        : role === 'distributor'
        ? 'bg-blue-100 text-blue-700 border-blue-300'
        : 'bg-gray-100 text-gray-700 border-gray-300'
    }`}
  >
    {role}
  </span>
);

const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`px-2 py-0.5 rounded-full text-xs border ${
      status === 'active'
        ? 'bg-green-100 text-green-700 border-green-300'
        : status === 'banned'
        ? 'bg-red-100 text-red-700 border-red-300'
        : status === 'pending'
        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
        : 'bg-gray-100 text-gray-600 border-gray-300'
    }`}
  >
    {status}
  </span>
);

/* ------------------------------------------------------------------ */
/* Small helpers                                                      */
/* ------------------------------------------------------------------ */

const initials = (s: string) =>
  (s || '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??';

const fmtNum = (n: number) =>
  Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '0';

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const prettyType = (t: string) =>
  t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const eventDot = (t: ActivityEventType) => {
  switch (t) {
    case 'login':
      return 'bg-green-500';
    case 'login_failed':
      return 'bg-red-500';
    case 'logout':
      return 'bg-gray-400';
    case 'order_placed':
      return 'bg-amber-500';
    case 'commission_earned':
    case 'bonus_awarded':
      return 'bg-emerald-500';
    case 'password_change':
    case 'password_reset':
      return 'bg-purple-500';
    case 'admin_action':
      return 'bg-red-600';
    default:
      return 'bg-blue-500';
  }
};

const eventIcon = (t: ActivityEventType): React.ReactNode => {
  switch (t) {
    case 'login':
      return <LogIn size={12} className="inline text-green-600" />;
    case 'login_failed':
      return <XCircle size={12} className="inline text-red-600" />;
    case 'logout':
      return <LogOut size={12} className="inline text-gray-500" />;
    case 'order_placed':
      return <ShoppingBag size={12} className="inline text-amber-600" />;
    case 'password_change':
    case 'password_reset':
      return <KeyRound size={12} className="inline text-purple-600" />;
    case 'role_change':
    case 'status_change':
      return <UserCog size={12} className="inline text-blue-600" />;
    case 'profile_update':
      return <Pencil size={12} className="inline text-blue-600" />;
    case 'admin_action':
      return <Shield size={12} className="inline text-red-600" />;
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* Confirm dialog text                                                */
/* ------------------------------------------------------------------ */

const confirmTitle = (kind: string) => {
  switch (kind) {
    case 'delete':
      return 'Delete user?';
    case 'ban':
      return 'Ban user?';
    case 'unban':
      return 'Unban user?';
    case 'activate':
      return 'Activate user?';
    case 'deactivate':
      return 'Deactivate user?';
    case 'verify':
      return 'Mark email as verified?';
    default:
      return 'Confirm action';
  }
};

const confirmMessage = (kind: string) => {
  switch (kind) {
    case 'delete':
      return 'This permanently deletes the account. This cannot be undone.';
    case 'ban':
      return 'The user will be immediately blocked from logging in.';
    case 'unban':
      return 'The user will regain access to their account.';
    case 'activate':
      return 'The account will be reactivated.';
    case 'deactivate':
      return 'The account will be deactivated but not deleted.';
    case 'verify':
      return 'The email will be marked as verified on the user’s behalf.';
    default:
      return 'Please confirm.';
  }
};