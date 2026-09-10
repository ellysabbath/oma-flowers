// src/api/categories.ts
import api from './index';
import type { Category } from '../types';

const normalize = (data: any): Category[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

export const categoryAPI = {
  getAll: async (params?: any): Promise<Category[]> => {
    const response = await api.get('/categories/', { params });
    return normalize(response);
  },

  getById: async (id: number): Promise<Category> => {
    return api.get(`/categories/${id}/`) as any;
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    return api.post('/categories/', data) as any;
  },

  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    return api.patch(`/categories/${id}/`, data) as any;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return api.delete(`/categories/${id}/`) as any;
  },
};