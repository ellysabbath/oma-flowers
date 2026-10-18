// src/api/bonuses.ts
import api from './index';
import type {
  Bonus,
  BonusCreatePayload,
  BonusUpdatePayload,
  BonusStatus,
  PaginatedResponse,
} from '../types';

/**
 * Normalize a possibly-paginated list into a plain array.
 */
const normalizeList = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;
  if (data?.data && Array.isArray(data.data.results)) return data.data.results;
  return [];
};

export const bonusAPI = {
  /**
   * Get all bonuses.
   * Backend returns either an array or `{ results: [...] }`.
   */


  // api/bonuses.ts — ongeza method hii ndani ya bonusAPI

/**
 * Get bonuses belonging to the logged-in distributor only.
 * Backend should filter by request.user's distributor profile.
 */
getMine: async (params?: any): Promise<Bonus[]> => {
  const response: any = await api.get('/bonuses/', {
    params: { mine: true, ...params },
  });
  return normalizeList<Bonus>(response);
},
  getAll: async (params?: any): Promise<Bonus[]> => {
    const response: any = await api.get('/bonuses/', { params });
    return normalizeList<Bonus>(response);
  },

  /**
   * Get one bonus by ID.
   */
  getById: async (id: number): Promise<Bonus> => {
    const response: any = await api.get(`/bonuses/${id}/`);
    return response?.data ?? response;
  },

  /**
   * Create a new bonus.
   */
  create: async (payload: BonusCreatePayload): Promise<Bonus> => {
    const response: any = await api.post('/bonuses/', payload);
    return response?.data ?? response;
  },

  /**
   * Update a bonus (partial). Works for status, amount, etc.
   */
  update: async (
    id: number,
    payload: BonusUpdatePayload
  ): Promise<Bonus> => {
    const response: any = await api.patch(`/bonuses/${id}/`, payload);
    return response?.data ?? response;
  },

  /**
   * Delete a bonus.
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/bonuses/${id}/`);
  },

  /**
   * Convenience: mark a bonus as paid with today's date.
   */
  markPaid: async (id: number): Promise<Bonus> => {
    const today = new Date().toISOString().split('T')[0];
    return bonusAPI.update(id, {
      status: 'paid',
      payment_date: today,
    });
  },

  /**
   * Change status only (keeps payment_date if not paid).
   */
  updateStatus: async (
    id: number,
    status: BonusStatus,
    paymentDate?: string | null
  ): Promise<Bonus> => {
    const payload: BonusUpdatePayload = { status };
    if (status === 'paid') {
      payload.payment_date =
        paymentDate ?? new Date().toISOString().split('T')[0];
    } else {
      payload.payment_date = null;
    }
    return bonusAPI.update(id, payload);
  },

  /**
   * Bulk mark many bonuses as paid.
   */
  bulkMarkPaid: async (ids: number[]): Promise<Bonus[]> => {
    const today = new Date().toISOString().split('T')[0];
    const results = await Promise.all(
      ids.map((id) =>
        bonusAPI.update(id, { status: 'paid', payment_date: today })
      )
    );
    return results;
  },
};

