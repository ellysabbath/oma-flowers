import api from './index';
import type  { Commission, PaginatedResponse } from '../types';

export const commissionAPI = {
  getAll: (params?: any): Promise<PaginatedResponse<Commission>> =>
    api.get('/commissions/', { params }),

  getById: (id: number): Promise<Commission> =>
    api.get(`/commissions/${id}/`),
};