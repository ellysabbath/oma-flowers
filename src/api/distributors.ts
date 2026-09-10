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
  getHierarchy: async (id?: number): Promise<any> => {
    return api.get(`/distributors/${id || ''}/hierarchy/`);
  },

  // Get distributor statistics
  getStats: async (): Promise<DistributorStats> => {
    return api.get<DistributorStats>('/distributors/stats/');
  },

  // Create a new distributor from existing user
  create: async (data: { user_id: number; upline_id?: number | null; rank?: string }): Promise<Distributor> => {
    return api.post<Distributor>('/distributors/', data);
  },

  // Update an existing distributor - using PATCH for partial updates
  update: async (id: number, data: Partial<Distributor>): Promise<Distributor> => {
    // Only send fields that are allowed to be updated
    const updateData: any = {};
    
    // Map frontend fields to backend expected fields
    if (data.rank !== undefined) updateData.rank = data.rank;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.pbv !== undefined) updateData.pbv = data.pbv;
    if (data.cgv !== undefined) updateData.cgv = data.cgv;
    if (data.bonus_percentage !== undefined) updateData.bonus_percentage = data.bonus_percentage;
    if (data.upline_id !== undefined) updateData.upline_id = data.upline_id;
    
    // Note: user_id is NOT sent on update (only on create)
    
    console.log('Sending update data:', updateData);
    
    // Use PATCH for partial updates
    return api.patch<Distributor>(`/distributors/${id}/`, updateData);
  },

  // Delete a distributor
  delete: async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/distributors/${id}/`);
  },
};