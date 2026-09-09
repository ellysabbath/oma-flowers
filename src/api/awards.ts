import api from './index';
import type { Award, PaginatedResponse } from '../types';

export const awardAPI = {
  getAll: (params?: any): Promise<PaginatedResponse<Award>> =>
    api.get('/awards/', { params }),

  getById: (id: number): Promise<Award> =>
    api.get(`/awards/${id}/`),
};