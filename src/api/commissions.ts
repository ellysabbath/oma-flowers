// src/api/commissions.ts
import api from './index';
import type { Commission, PaginatedResponse } from '../types';

export const commissionAPI = {
  /**
   * GET /api/v1/commissions/
   * Returns { count, next, previous, results: [...] }
   */
  getAll: async (params?: any): Promise<PaginatedResponse<Commission>> => {
    const response: any = await api.get('/commissions/', { params });
    return response?.data ?? response;
  },

  /**
   * GET /api/v1/commissions/<id>/
   */
  getById: async (id: number): Promise<Commission> => {
    const response: any = await api.get(`/commissions/${id}/`);
    return response?.data ?? response;
  },

  /**
   * PATCH /api/v1/commissions/<id>/
   * Body: { status: 'paid' | 'pending' | 'processing', payment_date?: 'YYYY-MM-DD' | null }
   */
  updateStatus: async (
    id: number,
    payload: { status: string; payment_date?: string | null }
  ): Promise<Commission> => {
    const response: any = await api.patch(`/commissions/${id}/`, payload);
    return response?.data ?? response;
  },
};