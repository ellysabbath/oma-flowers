// src/api/awards.ts
import api from './index';
import type { Award, PaginatedResponse } from '../types';

export const awardAPI = {
  /**
   * GET /api/v1/awards/
   * Returns { count, next, previous, results: [...] }
   */
  getAll: async (params?: any): Promise<PaginatedResponse<Award>> => {
    const response: any = await api.get('/awards/', { params });
    return response?.data ?? response;
  },

  /**
   * GET /api/v1/awards/<id>/
   */
  getById: async (id: number): Promise<Award> => {
    const response: any = await api.get(`/awards/${id}/`);
    return response?.data ?? response;
  },

  /**
   * PATCH /api/v1/awards/<id>/
   * Body: { status?: 'active'|'past'|'upcoming', given_date?: 'YYYY-MM-DD'|null }
   */
  updateStatus: async (
    id: number,
    payload: { status?: string; given_date?: string | null }
  ): Promise<Award> => {
    const response: any = await api.patch(`/awards/${id}/`, payload);
    return response?.data ?? response;
  },
};