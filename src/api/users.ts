// api/users.ts
import api from './index';
import type { User, PaginatedResponse } from '../types';

export const userAPI = {
  // Get all users (admin only)
  getAll: async (params?: any): Promise<PaginatedResponse<User>> => {
    try {
      const response = await api.get('/auth/admin/users/', { params });
      
      // TypeScript now knows response can be any
      const data = response as any;
      
      // Handle different response formats
      if (data && data.results) {
        return data;
      }
      
      if (Array.isArray(data)) {
        return {
          count: data.length,
          next: null,
          previous: null,
          results: data
        };
      }
      
      console.warn('Unexpected users response format:', data);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
      
    } catch (error) {
      console.error('Error in userAPI.getAll:', error);
      throw error;
    }
  },
  
  // Get users by type (customer, distributor, admin)
  getByType: async (userType: string, params?: any): Promise<PaginatedResponse<User>> => {
    return userAPI.getAll({ ...params, user_type: userType });
  },
  
  // Get users excluding distributors
  getNonDistributors: async (params?: any): Promise<PaginatedResponse<User>> => {
    return userAPI.getAll({ ...params, exclude_distributors: 'true' });
  },
  
  // Get customers only
  getCustomers: async (params?: any): Promise<PaginatedResponse<User>> => {
    return userAPI.getByType('customer', params);
  },
  
  // Get distributors only
  getDistributors: async (params?: any): Promise<PaginatedResponse<User>> => {
    return userAPI.getByType('distributor', params);
  },
  
  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile/');
    const data = response as any;
    return data;
  },
  
  // Update current user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile/update/', data);
    const result = response as any;
    return result;
  },
};