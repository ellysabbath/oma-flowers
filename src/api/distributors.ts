// api/distributors.ts
import api from './index';
import type { Distributor, DistributorStats } from '../types';

export const distributorAPI = {
  // Get all distributors - returns array directly (no pagination)
  getAll: async (params?: any): Promise<Distributor[]> => {
    try {
      const data = await api.get<Distributor[]>('/distributors/', { params });

      if (Array.isArray(data)) {
        return data;
      }

      const wrappedData = data as any;
      if (wrappedData && Array.isArray(wrappedData.results)) {
        return wrappedData.results;
      }

      console.warn('Unexpected API response format:', data);
      return [];
    } catch (error) {
      console.error('Error in distributorAPI.getAll:', error);
      throw error;
    }
  },

  // Get a single distributor by ID
  getById: async (id: number): Promise<Distributor> => {
    return api.get<Distributor>(`/distributors/${id}/`);
  },

  // Get distributor hierarchy (downline tree)
  // - If `id` given: /distributors/<id>/hierarchy/
  // - Otherwise:     /distributors/me/hierarchy/
  getHierarchy: async (id?: number): Promise<any> => {
    const url = id
      ? `/distributors/${id}/hierarchy/`
      : '/distributors/me/hierarchy/';
    return api.get(url);
  },

  /**
   * Get the logged-in distributor's own hierarchy.
   * Returns { distributor: {...}, downline: [...] } or throws 404
   * if the current user is not a distributor.
   */
  getMyHierarchy: async (): Promise<{
    distributor: any;
    downline: any[];
  }> => {
    return api.get('/distributors/me/hierarchy/');
  },

  // Get distributor statistics
  getStats: async (): Promise<DistributorStats> => {
    return api.get<DistributorStats>('/distributors/stats/');
  },

  // Create a new distributor from existing user
  create: async (data: {
    user_id: number;
    upline_id?: number | null;
    rank?: string;
  }): Promise<Distributor> => {
    return api.post<Distributor>('/distributors/', data);
  },

  // Update an existing distributor - using PATCH for partial updates
  update: async (
    id: number,
    data: Partial<Distributor>
  ): Promise<Distributor> => {
    const updateData: any = {};

    if (data.rank !== undefined) updateData.rank = data.rank;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.pbv !== undefined) updateData.pbv = data.pbv;
    if (data.cgv !== undefined) updateData.cgv = data.cgv;
    if (data.bonus_percentage !== undefined)
      updateData.bonus_percentage = data.bonus_percentage;
    if (data.upline_id !== undefined) updateData.upline_id = data.upline_id;

    // user_id is NOT sent on update (only on create)
    console.log('Sending update data:', updateData);

    return api.patch<Distributor>(`/distributors/${id}/`, updateData);
  },

  // Delete a distributor
  delete: async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/distributors/${id}/`);
  },

  /**
   * Remove a direct downline from the logged-in distributor's team.
   * @param distributorId — the distributor record to remove
   * @param action
   *   - 'detach' → clears the upline (they stay a distributor)
   *   - 'delete' → deletes their Distributor profile (User stays, downgraded to 'customer')
   */
  removeDownline: async (
    distributorId: number,
    action: 'detach' | 'delete' = 'detach'
  ): Promise<{ message: string }> => {
    return api.post<{ message: string }>(
      `/distributors/${distributorId}/remove-downline/`,
      { action }
    );
  },
};