import api from './index';
import type { Shop, PaginatedResponse } from '../types';

export const shopAPI = {
  getAll: (params?: any): Promise<PaginatedResponse<Shop>> =>
    api.get('/shops/', { params }),

  getById: (id: number): Promise<Shop> =>
    api.get(`/shops/${id}/`),

  create: (data: Partial<Shop>): Promise<Shop> =>
    api.post('/shops/create/', data),

  update: (id: number, data: Partial<Shop>): Promise<Shop> =>
    api.put(`/shops/${id}/`, data),

  delete: (id: number): Promise<{ message: string }> =>
    api.delete(`/shops/${id}/`),
};