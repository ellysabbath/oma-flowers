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
} from 'lucide-react';

import {
  adminUsersAPI,
  type AdminUser,
  type AdminUserStats,
} from '../../api/adminUsers';

/* ------------------------------------------------------------------ */
/* Types                                                               */
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
/* Colors                                                              */
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
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

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
  }, []);

  /* ---------------------------------------------------------------- */
  /* Filters                                                          */
  /* ---------------------------------------------------------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
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
        // Update basic fields
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

        // Role change (separate endpoint because user_type is read-only on serializer)
        if (form.user_type !== editing.user_type) {
          await adminUsersAPI.setRole(editing.id, form.user_type);
        }

        // Status toggle
        if (form.status !== editing.status) {
          if (form.status === 'banned') await adminUsersAPI.ban(editing.id);
          else await adminUsersAPI.activate(editing.id);
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
          status: form.status,
          password: form.password,
        });
        flash('success', `User "${form.email}" created.`);
      }

      setShowForm(false);
      await load();
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        (data && typeof data === 'object' && (data.detail || data.email?.[0] || data.password?.[0])) ||
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
      flash(
        'error',
        err?.response?.data?.detail || 'Action failed.'
      );
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
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
            Manage all accounts, roles and access
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
            placeholder="Search by email, name, phone…"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/30">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/30">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">
                        {u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || u.email}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${roleColors[u.user_type] || roleColors.customer}`}>
                        {u.user_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[u.status] || 'bg-gray-100 text-gray-600 border-gray-300'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                      {u.phone || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {u.date_joined ? new Date(u.date_joined).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View"
                          onClick={() => setViewing(u)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg"
                        >
                          <Eye size={16} className="text-gray-400 hover:text-amber-600" />
                        </button>
                        <button
                          title="Edit"
                          onClick={() => openEdit(u)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg"
                        >
                          <Pencil size={16} className="text-gray-400 hover:text-amber-600" />
                        </button>
                        <button
                          title="Change role"
                          onClick={() => openRole(u)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg"
                        >
                          <Shield size={16} className="text-gray-400 hover:text-amber-600" />
                        </button>
                        <button
                          title="Set password"
                          onClick={() => openPassword(u)}
                          className="p-1.5 hover:bg-amber-50 rounded-lg"
                        >
                          <KeyRound size={16} className="text-gray-400 hover:text-amber-600" />
                        </button>
                        {!u.email_verified && (
                          <button
                            title="Verify email"
                            onClick={() =>
                              setConfirmAction({ kind: 'verify', user: u })
                            }
                            className="p-1.5 hover:bg-green-50 rounded-lg"
                          >
                            <CheckCircle size={16} className="text-green-500" />
                          </button>
                        )}
                        {u.status === 'banned' ? (
                          <button
                            title="Unban"
                            onClick={() => setConfirmAction({ kind: 'unban', user: u })}
                            className="p-1.5 hover:bg-green-50 rounded-lg"
                          >
                            <ShieldOff size={16} className="text-green-500" />
                          </button>
                        ) : (
                          <button
                            title="Ban"
                            onClick={() => setConfirmAction({ kind: 'ban', user: u })}
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                          >
                            <Ban size={16} className="text-red-500" />
                          </button>
                        )}
                        <button
                          title="Delete"
                          onClick={() => setConfirmAction({ kind: 'delete', user: u })}
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

      {/* ================================================================ */}
      {/* Add / Edit Modal                                                 */}
      {/* ================================================================ */}
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

      {/* ================================================================ */}
      {/* View Modal                                                       */}
      {/* ================================================================ */}
      {viewing && (
        <Modal onClose={() => setViewing(null)} maxWidth="max-w-xl">
          <ModalHeader
            title="User Details"
            subtitle={viewing.email}
            onClose={() => setViewing(null)}
          />
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ReadRow label="Full name" value={viewing.full_name} />
            <ReadRow label="Username" value={viewing.username} />
            <ReadRow label="Email" value={viewing.email} />
            <ReadRow label="Phone" value={viewing.phone} />
            <ReadRow label="Role" value={viewing.user_type} />
            <ReadRow label="Status" value={viewing.status} />
            <ReadRow label="Email verified" value={viewing.email_verified ? 'Yes' : 'No'} />
            <ReadRow label="Active" value={viewing.is_active ? 'Yes' : 'No'} />
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
                openEdit(u);
              }}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Edit
            </button>
          </ModalFooter>
        </Modal>
      )}

      {/* ================================================================ */}
      {/* Confirm Action Modal                                             */}
      {/* ================================================================ */}
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
                confirmAction.kind === 'delete' || confirmAction.kind === 'ban'
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

      {/* ================================================================ */}
      {/* Password Modal                                                   */}
      {/* ================================================================ */}
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

      {/* ================================================================ */}
      {/* Role Modal                                                       */}
      {/* ================================================================ */}
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

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

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

const StatCard: React.FC<{
  label: string;
  value: number;
  tone: 'amber' | 'purple' | 'blue' | 'gray' | 'green' | 'yellow' | 'red';
}> = ({ label, value, tone }) => {
  const tones: Record<string, string> = {
    amber: 'text-amber-600 bg-amber-50',
    purple: 'text-purple-600 bg-purple-50',
    blue: 'text-blue-600 bg-blue-50',
    gray: 'text-gray-700 bg-gray-100',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200/30 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className={`text-2xl font-bold mt-1 ${tones[tone].split(' ')[0]}`}>
        {value}
      </h3>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Confirm dialog text                                                 */
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