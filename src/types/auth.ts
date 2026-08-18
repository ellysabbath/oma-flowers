// src/types/auth.ts
export interface User {
  id: number | string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  avatar?: string;
  profile_picture?: string; // Added profile picture field
  role: 'customer' | 'distributor' | 'admin';
  isVerified: boolean;
  emailVerified: boolean;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  bio?: string; // Optional user bio
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dateOfBirth?: string;
  preferredLanguage?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  country: string;
  phone: string;
  region: string;
  city: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  profile_picture?: string; // Optional profile picture on registration
}

export interface ResetPasswordData {
  email: string;
}

export interface NewPasswordData {
  password: string;
  confirmPassword: string;
}

export interface VerifyAccountData {
  email: string;
  code: string;
}

export interface PasswordResetVerifyData {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface UpdateProfileData {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  profile_picture?: string;
  bio?: string;
  gender?: 'male' | 'female';
  dateOfBirth?: string;
  preferredLanguage?: string;
}