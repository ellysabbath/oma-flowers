import api from './index';
import type { Distributor, DistributorStats, PaginatedResponse } from '../types';

export const distributorAPI = {
  // Get all distributors with optional filtering
  getAll: (params?: any): Promise<PaginatedResponse<Distributor>> =>
    api.get('/distributors/', { params }),

  // Get a single distributor by ID
  getById: (id: number): Promise<Distributor> =>
    api.get(`/distributors/${id}/`),

  // Get distributor hierarchy (downline tree)
  getHierarchy: (id?: number): Promise<any> =>
    api.get(`/distributors/${id || ''}/hierarchy/`),

  // Get distributor statistics
  getStats: (): Promise<DistributorStats> =>
    api.get('/distributors/stats/'),

  // Create a new distributor from existing user
  create: (data: { user_id: number; upline_id?: number | null; rank?: string }): Promise<Distributor> =>
    api.post('/distributors/', data),

  // Update an existing distributor
  update: (id: number, data: Partial<Distributor>): Promise<Distributor> =>
    api.put(`/distributors/${id}/`, data),

  // Delete a distributor
  delete: (id: number): Promise<{ message: string }> =>
    api.delete(`/distributors/${id}/`),
};