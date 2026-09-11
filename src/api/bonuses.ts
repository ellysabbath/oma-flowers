// src/api/bonuses.ts
import api from './index';
import type { Bonus, PaginatedResponse } from '../types';

export const bonusAPI = {
  getAll: async (params?: any): Promise<PaginatedResponse<Bonus>> => {
    const response: any = await api.get('/bonuses/', { params });
    return response?.data ?? response;
  },

  getById: async (id: number): Promise<Bonus> => {
    const response: any = await api.get(`/bonuses/${id}/`);
    return response?.data ?? response;
  },

  updateStatus: async (
    id: number,
    payload: { status: string; payment_date?: string | null }
  ): Promise<Bonus> => {
    const response: any = await api.patch(`/bonuses/${id}/`, payload);
    return response?.data ?? response;
  },
};