import api from './index';
import type { User, PaginatedResponse } from '../types';

export const userAPI = {
  // Get all users (admin only)
  getAll: (params?: any): Promise<PaginatedResponse<User>> =>
    api.get('/auth/admin/users/', { params }),
  
  // Get users by type (customer, distributor, admin)
  getByType: (userType: string, params?: any): Promise<PaginatedResponse<User>> =>
    api.get('/auth/admin/users/', { params: { ...params, user_type: userType } }),
  
  // Get users excluding distributors
  getNonDistributors: (params?: any): Promise<PaginatedResponse<User>> =>
    api.get('/auth/admin/users/', { 
      params: { ...params, exclude_distributors: 'true' } 
    }),
  
  // Get current user profile
  getProfile: (): Promise<User> =>
    api.get('/auth/profile/'),
  
  // Update current user profile
  updateProfile: (data: Partial<User>): Promise<User> =>
    api.put('/auth/profile/update/', data),
};