import api from './index';
import type { Bonus, PaginatedResponse } from '../types';

export const bonusAPI = {
  getAll: (params?: any): Promise<PaginatedResponse<Bonus>> =>
    api.get('/bonuses/', { params }),

  getById: (id: number): Promise<Bonus> =>
    api.get(`/bonuses/${id}/`),
};