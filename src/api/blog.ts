import api from './index';
import type  { BlogPost, PaginatedResponse } from '../types';

export const blogAPI = {
  getAll: (params?: any): Promise<PaginatedResponse<BlogPost>> =>
    api.get('/blog/', { params }),

  getById: (id: number): Promise<BlogPost> =>
    api.get(`/blog/${id}/`),

  // Admin endpoints
  adminGetAll: (params?: any): Promise<PaginatedResponse<BlogPost>> =>
    api.get('/blog/admin/', { params }),

  adminCreate: (data: Partial<BlogPost>): Promise<BlogPost> =>
    api.post('/blog/admin/', data),

  adminUpdate: (id: number, data: Partial<BlogPost>): Promise<BlogPost> =>
    api.put(`/blog/admin/${id}/`, data),

  adminDelete: (id: number): Promise<{ message: string }> =>
    api.delete(`/blog/admin/${id}/`),
};