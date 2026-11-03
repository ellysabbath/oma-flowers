// src/types/auth.ts
/**
 * Auth-facing types.

 * These mirror the Django `User` model + `LoginUserSerializer` exactly.
 * `user_id` is the public OMA identifier (e.g. "OMA-2025-847291"),
 * and can be used to sign in in place of email or username.
 */

/* ------------------------------------------------------------------ */
/* User                                                               */
/* ------------------------------------------------------------------ */

export type UserRole = 'customer' | 'distributor' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'banned';

export interface User {
  id: number;
  /** Public OMA identifier, e.g. "OMA-2025-847291". */
  user_id: string;

  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;

  phone?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;

  profile_picture?: string | null; // base64 data-URI, or null
  has_profile_picture?: boolean;   // lean login payload hint

  user_type: UserRole;
  status: UserStatus;

  email_verified: boolean;
  email_verified_at?: string | null;

  created_at: string;
  updated_at?: string;

  last_login?: string | null;
  date_joined?: string;

  is_active?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
}

/* ------------------------------------------------------------------ */
/* Auth payloads                                                      */
/* ------------------------------------------------------------------ */

export interface LoginCredentials {
  /** OMA User ID | email | username */
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  profile_picture?: string;
  password: string;
  password2: string;
}

export interface ResetPasswordData {
  email: string;
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

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  profile_picture?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  distributor: {
    id: number;
    rank: string;
    level: number;
    pbv: string;
    cgv: string;
  } | null;
  user_type: UserRole;
}

export interface RegisterResponse {
  message: string;
  email: string;
  /** OMA User ID auto-assigned on creation. */
  user_id: string;
}