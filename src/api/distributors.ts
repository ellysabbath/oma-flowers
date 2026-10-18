// src/api/distributors.ts
import api from './index';
import type { Distributor, DistributorStats } from '../types';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface HierarchyUser {
  id: number;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  mobile_number?: string;
  status?: string;
  user_type?: string;
  profile_picture?: string | null;
  [key: string]: any;
}

/**
 * A single node in the hierarchy tree.
 * Matches `DistributorHierarchySerializer` output from the backend.
 */
export interface HierarchyNode {
  id: number;
  user?: HierarchyUser;
  user_id?: number;
  full_name?: string;
  name?: string;
  rank?: string;
  level?: number;
  pbv?: number | string;
  cgv?: number | string;
  bonus_percentage?: number | string;
  join_date?: string;
  created_at?: string;
  is_active?: boolean;
  downline_count?: number;
  active_downline_count?: number;
  downline?: HierarchyNode[];
  [key: string]: any;
}

/**
 * Shape returned by `GET /distributors/me/hierarchy/`.
 */
export interface MyHierarchyResponse {
  distributor: HierarchyNode;
  downline: HierarchyNode[];
}

export type RemoveDownlineAction = 'detach' | 'delete';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Normalize any list-shaped API response into a plain array.
 */
export const normalizeDistributorList = <T = any>(data: any): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && Array.isArray(data.data.results)) return data.data.results;
  return [];
};

/**
 * Pick a human-readable display name from a distributor / hierarchy node.
 */
export const pickDisplayName = (profile: any): string => {
  if (!profile) return 'Distributor';

  const candidates = [
    profile?.user?.full_name,
    profile?.user?.fullName,
    profile?.user?.name,
    profile?.full_name,
    profile?.fullName,
    profile?.name,
    profile?.user?.username,
    profile?.username,
    profile?.user?.first_name && profile?.user?.last_name
      ? `${profile.user.first_name} ${profile.user.last_name}`
      : null,
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : null,
    profile?.user?.first_name,
    profile?.first_name,
  ];

  for (const c of candidates) {
    if (c && String(c).trim()) return String(c).trim();
  }

  const email = profile?.user?.email || profile?.email;
  if (email && typeof email === 'string' && email.includes('@')) {
    const local = email.split('@')[0].replace(/[._-]+/g, ' ');
    return local
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  return 'Distributor';
};

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

export const distributorAPI = {
  /* ---------------- Read ---------------- */

  /**
   * Get all distributors. Always returns an array.
   */
  getAll: async (params?: any): Promise<Distributor[]> => {
    try {
      const data = await api.get<any>('/distributors/', { params });
      return normalizeDistributorList<Distributor>(data);
    } catch (error) {
      console.error('Error in distributorAPI.getAll:', error);
      throw error;
    }
  },

  /**
   * Get a single distributor by ID.
   */
  getById: async (id: number): Promise<Distributor> => {
    return api.get<Distributor>(`/distributors/${id}/`);
  },

  /**
   * Get hierarchy (downline tree) for a specific distributor.
   * Backend returns an ARRAY of direct children (each with nested downline).
   */
  getHierarchy: async (id: number): Promise<HierarchyNode[]> => {
    const raw: any = await api.get(`/distributors/${id}/hierarchy/`);
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  },

  /**
   * Get the logged-in distributor's own hierarchy.
   * Backend: GET /distributors/me/hierarchy/
   * Returns { distributor, downline }
   * Throws 404 if the user has no Distributor profile.
   */
  getMyHierarchy: async (): Promise<MyHierarchyResponse> => {
    const raw: any = await api.get('/distributors/me/hierarchy/');

    // Backend may wrap in `data`, but our view returns flat.
    const root = raw?.data ?? raw ?? {};

    const distributor: HierarchyNode | null =
      root?.distributor ?? raw?.distributor ?? null;

    const downline: HierarchyNode[] = Array.isArray(root?.downline)
      ? root.downline
      : Array.isArray(raw?.downline)
      ? raw.downline
      : [];

    return { distributor: distributor as HierarchyNode, downline };
  },

  /**
   * Get the logged-in distributor's statistics.
   */
  getStats: async (): Promise<DistributorStats> => {
    return api.get<DistributorStats>('/distributors/stats/');
  },

  /* ---------------- Write ---------------- */

  /**
   * Create a new distributor from an existing user.
   */
  create: async (data: {
    user_id: number;
    upline_id?: number | null;
    rank?: string;
  }): Promise<Distributor> => {
    return api.post<Distributor>('/distributors/', data);
  },

  /**
   * Update an existing distributor (PATCH — partial).
   * `user_id` is intentionally not sent on update.
   */
  update: async (
    id: number,
    data: Partial<Distributor> & { upline_id?: number | null }
  ): Promise<Distributor> => {
    const payload: any = {};

    if (data.rank !== undefined) payload.rank = data.rank;
    if (data.level !== undefined) payload.level = data.level;
    if (data.pbv !== undefined) payload.pbv = data.pbv;
    if (data.cgv !== undefined) payload.cgv = data.cgv;
    if (data.bonus_percentage !== undefined)
      payload.bonus_percentage = data.bonus_percentage;
    if (data.upline_id !== undefined) payload.upline_id = data.upline_id;

    return api.patch<Distributor>(`/distributors/${id}/`, payload);
  },

  /**
   * Delete a distributor.
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/distributors/${id}/`);
  },

  /**
   * Remove a direct downline from the logged-in distributor's team.
   *
   * @param distributorId — the distributor record to remove
   * @param action
   *   - 'detach' → clears the upline (they stay a distributor)
   *   - 'delete' → deletes the Distributor profile
   *                (User stays, downgraded to 'customer')
   */
  removeDownline: async (
    distributorId: number,
    action: RemoveDownlineAction = 'detach'
  ): Promise<{ message: string }> => {
    if (action !== 'detach' && action !== 'delete') {
      throw new Error(
        `Invalid removeDownline action: "${action}". Use "detach" or "delete".`
      );
    }
    return api.post<{ message: string }>(
      `/distributors/${distributorId}/remove-downline/`,
      { action }
    );
  },
};