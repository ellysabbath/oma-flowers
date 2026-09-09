import api from './index';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ChangePasswordData,
  UpdateProfileData,
} from '../types';

export const authAPI = {
  register: (data: RegisterData): Promise<{ message: string; email: string }> =>
    api.post('/auth/register/', data),

  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api.post('/auth/login/', credentials),

  refresh: (refreshToken: string): Promise<{ access: string }> =>
    api.post('/auth/refresh/', { refresh: refreshToken }),

  logout: (refreshToken: string): Promise<{ message: string }> =>
    api.post('/auth/logout/', { refresh: refreshToken }),

  getProfile: (): Promise<User> =>
    api.get('/auth/profile/'),

  updateProfile: (data: UpdateProfileData): Promise<User> =>
    api.put('/auth/profile/update/', data),

  changePassword: (data: ChangePasswordData): Promise<{ message: string }> =>
    api.post('/auth/change-password/', data),

  verifyEmail: (email: string, code: string): Promise<{ message: string }> =>
    api.post('/auth/verify-email/', { email, code }),

  resendVerification: (email: string): Promise<{ message: string }> =>
    api.post('/auth/resend-verification/', { email }),

  resetPassword: (email: string): Promise<{ message: string }> =>
    api.post('/auth/reset-password/', { email }),

  resetPasswordVerify: (data: {
    email: string;
    code: string;
    password: string;
    confirm_password: string;
  }): Promise<{ message: string }> =>
    api.post('/auth/reset-password/verify/', data),
};