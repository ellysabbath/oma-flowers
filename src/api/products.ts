// api/products.ts
import api from './index';
import type { Product } from '../types';

export const productAPI = {
  getAll: async (params?: any): Promise<Product[]> => {
    try {
      const data = await api.get<Product[]>('/products/', { params });
      if (Array.isArray(data)) return data;
      const wrapped = data as any;
      if (wrapped && Array.isArray(wrapped.results)) return wrapped.results;
      return [];
    } catch (error) {
      console.error('Error in productAPI.getAll:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<Product> => {
    return api.get<Product>(`/products/${id}/`);
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    return api.post<Product>('/products/', data);
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    return api.patch<Product>(`/products/${id}/`, data);
  },

  delete: async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/products/${id}/`);
  },
};