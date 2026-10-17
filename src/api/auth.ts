// src/api/auth.ts
import api from './index';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ChangePasswordData,
  UpdateProfileData,
} from '../types';

/* ------------------------------------------------------------------ */
/* Safe unwrap                                                         */
/*                                                                     */
/* - If `api` has a response interceptor that returns `res.data`, the */
/*   body is already the payload.                                     */
/* - If not, the body is `AxiosResponse` and we need `.data`.         */
/*                                                                     */
/* Using `res?.data ?? res` handles both.                              */
/* ------------------------------------------------------------------ */

const unwrap = <T,>(res: any): T => {
  if (res && typeof res === 'object' && 'data' in res && 'status' in res) {
    return res.data as T;
  }
  return res as T;
};

/* ------------------------------------------------------------------ */
/* Response shapes                                                     */
/* ------------------------------------------------------------------ */

export interface RefreshResponse {
  access: string;
  /** Backend may rotate the refresh token on use. */
  refresh?: string;
}

/* ------------------------------------------------------------------ */
/* authAPI                                                             */
/* ------------------------------------------------------------------ */

export const authAPI = {
  /* ---------- Registration ---------- */
  register: (
    data: RegisterData
  ): Promise<{ message: string; email: string }> =>
    api
      .post('/auth/register/', data)
      .then((res) => unwrap<{ message: string; email: string }>(res)),

  /* ---------- Login ---------- */
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api
      .post('/auth/login/', credentials)
      .then((res) => unwrap<AuthResponse>(res)),

  /* ---------- Token refresh ---------- */
  refresh: (refreshToken: string): Promise<RefreshResponse> =>
    api
      .post('/auth/refresh/', { refresh: refreshToken })
      .then((res) => unwrap<RefreshResponse>(res)),

  /* ---------- Logout ---------- */
  logout: (refreshToken: string): Promise<{ message: string }> =>
    api
      .post('/auth/logout/', { refresh: refreshToken })
      .then((res) => unwrap<{ message: string }>(res)),

  /* ---------- Profile ---------- */
  getProfile: (): Promise<User> =>
    api
      .get('/auth/profile/')
      .then((res) => unwrap<User>(res)),

  updateProfile: (data: UpdateProfileData): Promise<User> =>
    api
      .put('/auth/profile/update/', data)
      .then((res) => unwrap<User>(res)),

  /* ---------- Password ---------- */
  changePassword: (
    data: ChangePasswordData
  ): Promise<{ message: string }> =>
    api
      .post('/auth/change-password/', data)
      .then((res) => unwrap<{ message: string }>(res)),

  /* ---------- Email verification ---------- */
  verifyEmail: (
    email: string,
    code: string
  ): Promise<{ message: string }> =>
    api
      .post('/auth/verify-email/', { email, code })
      .then((res) => unwrap<{ message: string }>(res)),

  resendVerification: (email: string): Promise<{ message: string }> =>
    api
      .post('/auth/resend-verification/', { email })
      .then((res) => unwrap<{ message: string }>(res)),

  /* ---------- Password reset ---------- */
  resetPassword: (email: string): Promise<{ message: string }> =>
    api
      .post('/auth/reset-password/', { email })
      .then((res) => unwrap<{ message: string }>(res)),

  resetPasswordVerify: (data: {
    email: string;
    code: string;
    password: string;
    confirm_password: string;
  }): Promise<{ message: string }> =>
    api
      .post('/auth/reset-password/verify/', data)
      .then((res) => unwrap<{ message: string }>(res)),
};

export default authAPI;