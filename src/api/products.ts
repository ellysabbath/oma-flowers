import api from './index';
import type { Category, Product, PaginatedResponse } from '../types';

export const productAPI = {
  getCategories: (params?: any): Promise<PaginatedResponse<Category>> =>
    api.get('/products/categories/', { params }),

  getCategory: (id: number): Promise<Category> =>
    api.get(`/products/categories/${id}/`),

  getAll: (params?: any): Promise<PaginatedResponse<Product>> =>
    api.get('/products/', { params }),

  getById: (id: number): Promise<Product> =>
    api.get(`/products/${id}/`),
};