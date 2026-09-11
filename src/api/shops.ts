// src/api/shops.ts
import api from './index';
import type { Shop, PaginatedResponse } from '../types';

/**
 * What the frontend is allowed to send when creating or updating a shop.
 *
 * NOTE: performance_level, bonus_percentage, owner_bv, and customers
 * are auto-computed on the backend and will be rejected if sent.
 */
export interface ShopPayload {
  name?: string;
  location?: string;
  region?: string;
  country?: string;
  phone?: string;
  email?: string | null;
  monthly_revenue?: number | string;
  rating?: number | string;
  status?: 'active' | 'inactive' | 'pending';
  established_date?: string;
  distributor?: number | null;
}

export const shopAPI = {
  /** GET /shops/ — returns array or paginated response */
  getAll: async (
    params?: any
  ): Promise<Shop[] | PaginatedResponse<Shop>> => {
    const response: any = await api.get('/shops/', { params });
    return response?.data ?? response;
  },

  /** GET /shops/<id>/ */
  getById: async (id: number): Promise<Shop> => {
    const response: any = await api.get(`/shops/${id}/`);
    return response?.data ?? response;
  },

  /** POST /shops/ — create a new shop */
  create: async (payload: ShopPayload): Promise<Shop> => {
    const response: any = await api.post('/shops/', payload);
    return response?.data ?? response;
  },

  /** PATCH /shops/<id>/ — partial update */
  update: async (id: number, payload: ShopPayload): Promise<Shop> => {
    const response: any = await api.patch(`/shops/${id}/`, payload);
    return response?.data ?? response;
  },

  /** DELETE /shops/<id>/ */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/shops/${id}/`);
  },

  /**
   * POST /shops/recompute-performance/
   * Recomputes owner_bv, customers, performance_level, and
   * bonus_percentage for every shop from the owner's activity.
   */
  recomputePerformance: async (): Promise<{ detail: string }> => {
    const response: any = await api.post('/shops/recompute-performance/');
    return response?.data ?? response;
  },

  /**
   * POST /shops/recompute-performance/<distributor_id>/
   * Recomputes all shops owned by a specific distributor.
   */
  recomputeForDistributor: async (
    distributorId: number
  ): Promise<{ detail: string }> => {
    const response: any = await api.post(
      `/shops/recompute-performance/${distributorId}/`
    );
    return response?.data ?? response;
  },
};