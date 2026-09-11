// src/api/adminUsers.ts
import api from './index';

export interface AdminUser {
  id: number;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  profile_picture?: string | null;
  user_type: 'admin' | 'distributor' | 'customer';
  status: string;
  email_verified: boolean;
  email_verified_at?: string | null;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  date_joined?: string;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserStats {
  total: number;
  admins: number;
  distributors: number;
  customers: number;
  active: number;
  inactive: number;
  banned: number;
  email_verified: number;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = '/admini/users';

export const adminUsersAPI = {
  list: async (params?: Record<string, any>): Promise<Paginated<AdminUser>> => {
    const res: any = await api.get(`${BASE}/`, { params });
    return res?.data ?? res;
  },

  get: async (id: number): Promise<AdminUser> => {
    const res: any = await api.get(`${BASE}/${id}/`);
    return res?.data ?? res;
  },

  create: async (payload: Partial<AdminUser> & { password: string }): Promise<AdminUser> => {
    const res: any = await api.post(`${BASE}/`, payload);
    return res?.data ?? res;
  },

  update: async (id: number, payload: Partial<AdminUser>): Promise<AdminUser> => {
    const res: any = await api.patch(`${BASE}/${id}/`, payload);
    return res?.data ?? res;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}/`);
  },

  setPassword: async (id: number, password: string): Promise<void> => {
    await api.post(`${BASE}/${id}/set-password/`, { password });
  },

  activate: async (id: number): Promise<AdminUser> => {
    const res: any = await api.post(`${BASE}/${id}/activate/`);
    return res?.data ?? res;
  },

  deactivate: async (id: number): Promise<AdminUser> => {
    const res: any = await api.post(`${BASE}/${id}/deactivate/`);
    return res?.data ?? res;
  },

  ban: async (id: number): Promise<AdminUser> => {
    const res: any = await api.post(`${BASE}/${id}/ban/`);
    return res?.data ?? res;
  },

  unban: async (id: number): Promise<AdminUser> => {
    const res: any = await api.post(`${BASE}/${id}/unban/`);
    return res?.data ?? res;
  },

  verifyEmail: async (id: number): Promise<AdminUser> => {
    const res: any = await api.post(`${BASE}/${id}/verify-email/`);
    return res?.data ?? res;
  },

  setRole: async (
    id: number,
    user_type: 'admin' | 'distributor' | 'customer'
  ): Promise<AdminUser> => {
    const res: any = await api.post(`${BASE}/${id}/set-role/`, { user_type });
    return res?.data ?? res;
  },

  stats: async (): Promise<AdminUserStats> => {
    const res: any = await api.get(`${BASE}/stats/`);
    return res?.data ?? res;
  },
};