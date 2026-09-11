// src/api/cart.ts
import api from './index';
import type {
  Cart,
  CartItem,
  CartCreatePayload,
  CartUpdatePayload,
  CartItemCreatePayload,
  CartItemUpdatePayload,
  PaginatedResponse,
} from '../types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Normalize { count, results } | Cart[] into a plain Cart[] */
const normalizeCartList = (data: any): Cart[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

/** Normalize { count, results } | CartItem[] into a plain CartItem[] */
const normalizeItemList = (data: any): CartItem[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

/* ------------------------------------------------------------------ */
/* cartAPI                                                             */
/* ------------------------------------------------------------------ */

export const cartAPI = {
  /* ==================== CARTS ==================== */

  /** GET /carts/ — list all carts (optionally filtered). */
  getAll: async (params?: {
    status?: string;
    user?: number;
    distributor?: number;
    shop?: number;
    session_key?: string;
  }): Promise<Cart[]> => {
    try {
      const response = await api.get('/carts/', { params });
      return normalizeCartList(response);
    } catch (error) {
      console.error('Error in cartAPI.getAll:', error);
      throw error;
    }
  },

  /** Same as getAll but wrapped in a paginated envelope. */
  getAllPaginated: async (params?: any): Promise<PaginatedResponse<Cart>> => {
    const results = await cartAPI.getAll(params);
    return {
      count: results.length,
      next: null,
      previous: null,
      results,
    };
  },

  /** GET /carts/<id>/ */
  getById: async (id: number): Promise<Cart> => {
    const response = await api.get(`/carts/${id}/`);
    return response as any;
  },

  /** POST /carts/ */
  create: async (data: CartCreatePayload): Promise<Cart> => {
    const response = await api.post('/carts/', data);
    return response as any;
  },

  /** PUT /carts/<id>/ — full replace */
  update: async (id: number, data: CartCreatePayload): Promise<Cart> => {
    const response = await api.put(`/carts/${id}/`, data);
    return response as any;
  },

  /** PATCH /carts/<id>/ — partial update */
  patch: async (id: number, data: CartUpdatePayload): Promise<Cart> => {
    const response = await api.patch(`/carts/${id}/`, data);
    return response as any;
  },

  /** DELETE /carts/<id>/ */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/carts/${id}/`);
  },

  /* ==================== CART ITEMS ==================== */

  /** GET /carts/<cart_id>/items/ */
  getItems: async (cartId: number): Promise<CartItem[]> => {
    try {
      const response = await api.get(`/carts/${cartId}/items/`);
      return normalizeItemList(response);
    } catch (error) {
      console.error('Error in cartAPI.getItems:', error);
      throw error;
    }
  },

  /** POST /carts/<cart_id>/items/ — add (or bump quantity of) a product. */
  addItem: async (
    cartId: number,
    data: CartItemCreatePayload
  ): Promise<CartItem> => {
    const response = await api.post(`/carts/${cartId}/items/`, data);
    return response as any;
  },

  /** PATCH /carts/<cart_id>/items/<item_id>/ */
  updateItem: async (
    cartId: number,
    itemId: number,
    data: CartItemUpdatePayload
  ): Promise<CartItem> => {
    const response = await api.patch(
      `/carts/${cartId}/items/${itemId}/`,
      data
    );
    return response as any;
  },

  /** PUT /carts/<cart_id>/items/<item_id>/ — full replace */
  replaceItem: async (
    cartId: number,
    itemId: number,
    data: CartItemUpdatePayload
  ): Promise<CartItem> => {
    const response = await api.put(
      `/carts/${cartId}/items/${itemId}/`,
      data
    );
    return response as any;
  },

  /** DELETE /carts/<cart_id>/items/<item_id>/ */
  removeItem: async (cartId: number, itemId: number): Promise<void> => {
    await api.delete(`/carts/${cartId}/items/${itemId}/`);
  },

  /* ==================== HELPERS ==================== */

  /** POST /carts/<cart_id>/clear/ — remove all items */
  clear: async (cartId: number): Promise<Cart> => {
    const response = await api.post(`/carts/${cartId}/clear/`);
    return response as any;
  },

  /** POST /carts/<cart_id>/checkout/ — mark cart as 'converted' */
  checkout: async (cartId: number): Promise<Cart> => {
    const response = await api.post(`/carts/${cartId}/checkout/`);
    return response as any;
  },

  /* ==================== CONVENIENCE ==================== */

  /**
   * Get or create the "current" cart for a given user or guest session.
   * Tries to fetch an active cart first; creates one if none exists.
   */
  getOrCreateForUser: async (
    userId: number | null,
    sessionKey?: string | null,
    distributorId?: number | null
  ): Promise<Cart> => {
    const params: any = { status: 'active' };
    if (userId) params.user = userId;
    if (sessionKey) params.session_key = sessionKey;

    const carts = await cartAPI.getAll(params);
    if (carts.length > 0) return carts[0];

    return cartAPI.create({
      user_id: userId ?? null,
      distributor_id: distributorId ?? null,
      session_key: sessionKey ?? null,
      status: 'active',
    });
  },
};