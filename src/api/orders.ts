import api from './index';
import type { Order, PaginatedResponse } from '../types';

export const orderAPI = {
  getAll: (params?: any): Promise<PaginatedResponse<Order>> =>
    api.get('/orders/', { params }),

  getById: (id: number): Promise<Order> =>
    api.get(`/orders/${id}/`),

  create: (data: Partial<Order>): Promise<Order> =>
    api.post('/orders/create/', data),

  updateStatus: (id: number, status: string): Promise<Order> =>
    api.patch(`/orders/${id}/status/`, { status }),
};