// src/types/admin.ts
/**
 * Admin-facing types.
 *
 * Sections:
 *  1. Business domain types (Distributor, Product, Commission, …)
 *  2. Rank constants
 *  3. Admin user-management types (list row, stats, full detail, activity)
 */

import type { User, UserRole, UserStatus } from './auth';

export type { UserRole, UserStatus };

/* ================================================================== */
/* 1. Business domain                                                 */
/* ================================================================== */

export interface Distributor {
  id: number;
  name: string;
  email: string;
  phone: string;
  rank: Rank;
  pbv: number;
  cgv: number;
  mpv: number;
  upline?: string;
  downline: string[];
  joinDate: string;
  status: 'Active' | 'Inactive' | 'Pending';
  avatar: string;
  country: string;
  region: string;
  city: string;
}

export interface Rank {
  id: number;
  name: string;
  level: number;
  cgvRequired: number;
  pbvRequired: number;
  bonusPercentage: number;
  qualifiedLeaders: number;
  requiredRank?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'Classic' | 'Luxury';
  class: 'A' | 'B' | 'C';
  bv: number;
  price: number;
  description: string;
}

export interface Commission {
  id: number;
  distributorId: number;
  distributorName: string;
  rank: string;
  pbv: number;
  percentage: number;
  amount: number;
  month: string;
  type: 'Personal' | 'Differential';
}

export interface Bonus {
  id: number;
  name: string;
  type:
    | 'Consistency'
    | 'Referral'
    | 'Dynamic'
    | 'Training'
    | 'Event'
    | 'Booking'
    | 'Design'
    | 'Festival';
  amount: number;
  distributorId: number;
  distributorName: string;
  month: string;
  description: string;
}

export interface Award {
  id: number;
  name: string;
  category: 'Legacy' | 'Annual' | 'Special';
  winner: string;
  rank: string;
  date: string;
  prize: string;
  description: string;
}

export interface Shop {
  id: number;
  name: string;
  owner: string;
  location: string;
  performanceLevel:
    | 'Seed'
    | 'Bloom'
    | 'Garden'
    | 'Emerald'
    | 'Diamond'
    | 'Crown'
    | 'Gold Crown';
  monthlyRevenue: number;
  bonusPercentage: number;
  status: 'Active' | 'Inactive';
}

export interface SavingsBottle {
  rank: string;
  limit: number;
  currentSavings: number;
}

/* ================================================================== */
/* 2. Rank constants                                                  */
/* ================================================================== */

export const RANKS: Rank[] = [
  {
    id: 1,
    name: 'Seed',
    level: 0,
    cgvRequired: 0,
    pbvRequired: 0,
    bonusPercentage: 0,
    qualifiedLeaders: 0,
  },
  {
    id: 2,
    name: 'Associate',
    level: 1,
    cgvRequired: 0,
    pbvRequired: 20,
    bonusPercentage: 4,
    qualifiedLeaders: 0,
  },
  {
    id: 3,
    name: 'Builder',
    level: 2,
    cgvRequired: 200,
    pbvRequired: 30,
    bonusPercentage: 5,
    qualifiedLeaders: 0,
  },
  {
    id: 4,
    name: 'Leader',
    level: 3,
    cgvRequired: 600,
    pbvRequired: 50,
    bonusPercentage: 8,
    qualifiedLeaders: 1,
    requiredRank: 'Builder',
  },
  {
    id: 5,
    name: 'Senior Leader',
    level: 4,
    cgvRequired: 1500,
    pbvRequired: 70,
    bonusPercentage: 11,
    qualifiedLeaders: 2,
    requiredRank: 'Leader',
  },
  {
    id: 6,
    name: 'Executive',
    level: 5,
    cgvRequired: 4000,
    pbvRequired: 90,
    bonusPercentage: 14,
    qualifiedLeaders: 2,
    requiredRank: 'Senior Leader',
  },
  {
    id: 7,
    name: 'Manager',
    level: 6,
    cgvRequired: 10000,
    pbvRequired: 120,
    bonusPercentage: 17,
    qualifiedLeaders: 3,
    requiredRank: 'Executive',
  },
  {
    id: 8,
    name: 'Senior Manager',
    level: 7,
    cgvRequired: 25000,
    pbvRequired: 160,
    bonusPercentage: 20,
    qualifiedLeaders: 3,
    requiredRank: 'Manager',
  },
  {
    id: 9,
    name: 'Director',
    level: 8,
    cgvRequired: 60000,
    pbvRequired: 200,
    bonusPercentage: 24,
    qualifiedLeaders: 5,
    requiredRank: 'Senior Manager',
  },
  {
    id: 10,
    name: 'Crown Director',
    level: 9,
    cgvRequired: 120000,
    pbvRequired: 250,
    bonusPercentage: 28,
    qualifiedLeaders: 4,
    requiredRank: 'Director',
  },
  {
    id: 11,
    name: 'Royal Crown Director',
    level: 10,
    cgvRequired: 184000,
    pbvRequired: 300,
    bonusPercentage: 32,
    qualifiedLeaders: 5,
    requiredRank: 'Crown Director',
  },
];

/* ================================================================== */
/* 3. Admin user management                                           */
/* ================================================================== */

/**
 * Row shape returned by `GET /admin/users/`. Matches UserSerializer.
 * We deliberately extend `User` (rather than redeclaring fields) so that
 * `AdminUser` automatically carries `user_id`, `email`, `user_type`,
 * `status`, `email_verified`, `is_active`, `date_joined`, `last_login`,
 * `profile_picture`, etc. — whichever subset `User` declares.
 */
export interface AdminUser extends User {}

export interface AdminUserStats {
  total: number;
  admins: number;
  distributors: number;
  customers: number;
  active: number;
  inactive: number;
  banned: number;
  pending: number;
  email_verified: number;
  email_unverified: number;
  with_phone: number;
  created_today: number;
  created_this_week: number;
  created_this_month: number;
}

export interface AdminUserListParams {
  page?: number;
  page_size?: number;
  user_type?: UserRole;
  status?: UserStatus;
  email_verified?: boolean;
  is_active?: boolean;
  /** Exact-match on OMA user_id. */
  user_id?: string;
  /** Full-text search across user_id / email / username / names / phone. */
  search?: string;
  ordering?: string;
}

export interface AdminUserCreatePayload {
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  /** If only this is provided, backend splits into first/last. */
  full_name?: string;
  phone?: string;
  country?: string;
  region?: string;
  city?: string;
  user_type?: UserRole;
  status?: UserStatus;
  password: string;
}

export type AdminUserUpdatePayload = Partial<
  Omit<AdminUserCreatePayload, 'password'>
>;

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* ------------------------------------------------------------------ */
/* Full detail                                                        */
/* ------------------------------------------------------------------ */

export interface AdminDistributorProfile {
  id: number;
  rank: string;
  level: number;
  pbv: number;
  cgv: number;
  bonus_percentage: number;
  join_date: string;
  is_active: boolean;
  upline_id: number | null;
  upline_name: string | null;
  downline_count: number;
  active_downline_count: number;
}

export interface AdminShopMini {
  id: number;
  name: string;
  location: string;
  region: string;
  status: string;
  performance_level: string;
  monthly_revenue: number | string;
}

export interface AdminOrderMini {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  total_bv: number;
  order_date: string;
}

export interface AdminCommissionMini {
  id: number;
  type: 'personal' | 'differential';
  amount: string;
  pbv: string;
  status: 'paid' | 'pending' | 'processing';
  created_at: string;
}

export interface AdminBonusMini {
  id: number;
  name: string;
  type: string;
  amount: string;
  month: string;
  year: number;
  status: 'paid' | 'pending' | 'processing';
}

export interface AdminCartMini {
  id: number;
  code: string;
  status: 'active' | 'converted' | 'abandoned' | 'expired';
  total_items: number;
  subtotal: number | string;
  created_at: string;
}

export interface AdminUserCounts {
  orders: number;
  commissions: number;
  bonuses: number;
  awards: number;
  carts: number;
  shops: number;
  downline_members: number;
  activity_events: number;
}

export interface AdminUserTotals {
  order_revenue: number;
  total_bv: number;
  total_commission: number;
  total_bonuses: number;
}

export interface AdminUserFullDetail {
  user: User;
  counts: AdminUserCounts;
  totals: AdminUserTotals;
  distributor: AdminDistributorProfile | null;
  shops: AdminShopMini[];
  recent_orders: AdminOrderMini[];
  recent_commissions: AdminCommissionMini[];
  recent_bonuses: AdminBonusMini[];
  recent_carts: AdminCartMini[];
  recent_activity: ActivityEvent[];
}

/* ------------------------------------------------------------------ */
/* Activity                                                           */
/* ------------------------------------------------------------------ */

export type ActivityEventType =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'register'
  | 'verify_email'
  | 'password_change'
  | 'password_reset'
  | 'profile_update'
  | 'role_change'
  | 'status_change'
  | 'order_placed'
  | 'order_updated'
  | 'order_cancelled'
  | 'cart_updated'
  | 'commission_earned'
  | 'bonus_awarded'
  | 'downline_added'
  | 'downline_removed'
  | 'admin_action';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  summary: string;
  description?: string;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
}

export interface AdminUserActivityCounts {
  logins: number;
  failed_logins: number;
  orders: number;
  commissions: number;
  bonuses: number;
  downline_members: number;
}

export interface AdminUserActivity {
  user: User;
  counts: AdminUserActivityCounts;
  events: ActivityEvent[];
}