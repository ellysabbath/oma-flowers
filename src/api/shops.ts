// src/api/shops.ts
import api from './index';
import type { Shop, PaginatedResponse } from '../types';

/** Normalize either an array or a paginated object into a plain array. */
const normalizeList = (data: any): Shop[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

export const shopAPI = {
  /** GET /shops/ — returns a plain Shop[] (backend has no pagination). */
  getAll: async (params?: any): Promise<Shop[]> => {
    try {
      const response = await api.get('/shops/', { params });
      return normalizeList(response);
    } catch (error) {
      console.error('Error in shopAPI.getAll:', error);
      throw error;
    }
  },

  /** Alias kept for callers that expect a paginated wrapper. */
  getAllPaginated: async (params?: any): Promise<PaginatedResponse<Shop>> => {
    const results = await shopAPI.getAll(params);
    return {
      count: results.length,
      next: null,
      previous: null,
      results,
    };
  },

  getById: async (id: number): Promise<Shop> => {
    const response = await api.get(`/shops/${id}/`);
    return response as any;
  },

  create: async (data: Partial<Shop>): Promise<Shop> => {
    const response = await api.post('/shops/', data);
    return response as any;
  },

  update: async (id: number, data: Partial<Shop>): Promise<Shop> => {
    const response = await api.put(`/shops/${id}/`, data);
    return response as any;
  },

  patch: async (id: number, data: Partial<Shop>): Promise<Shop> => {
    const response = await api.patch(`/shops/${id}/`, data);
    return response as any;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/shops/${id}/`);
  },
};