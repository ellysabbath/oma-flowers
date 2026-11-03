// src/types/index.ts
/**
 * Canonical type barrel.
 *
 * Grouped by domain:
 *   User · Distributor · Shop · Cart · Category · Product ·
 *   Order · Commission · Bonus · Award · Blog · Analytics ·
 *   API envelope · Auth · Admin
 *
 * The OMA public identifier `user_id` (e.g. "OMA-2025-847291")
 * appears on every user-shaped type so screens can display and
 * search on it consistently.
 */

/* ================================================================== */
/* User                                                               */
/* ================================================================== */

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

  profile_picture?: string | null;
  has_profile_picture?: boolean;

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

/* ================================================================== */
/* Distributor                                                        */
/* ================================================================== */

export interface DistributorUser {
  id: number;
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
  profile_picture?: string | null;
  user_type: UserRole;
  status: UserStatus;
  email_verified: boolean;
  created_at: string;
}

export interface Distributor {
  id: number;
  user: DistributorUser;
  full_name: string;
  rank: string;
  level: number;
  pbv: number | string;
  cgv: number | string;
  bonus_percentage: number | string;
  join_date: string;
  is_active?: boolean;
  downline_count: number;
  active_downline_count: number;
  created_at: string;
}

export interface DistributorStats {
  total_orders: number;
  total_commission: number;
  total_bonuses: number;
  downline_count: number;
  active_downline: number;
  rank: string;
  pbv: number;
  cgv: number;
  growth_rate: number;
}

/* ================================================================== */
/* Shop                                                               */
/* ================================================================== */

export interface Shop {
  id: number;
  distributor: number | null;
  distributor_name: string | null;
  name: string;
  location: string;
  region: string;
  country: string;
  phone: string;
  email: string | null;
  performance_level:
    | 'Seed'
    | 'Bloom'
    | 'Garden'
    | 'Emerald'
    | 'Diamond'
    | 'Crown'
    | 'Gold Crown';
  performance_display: string;
  bonus_percentage: number | string;
  owner_bv: number | string;
  customers: number;
  monthly_revenue: number | string;
  rating: number | string;
  status: 'active' | 'inactive' | 'pending';
  established_date: string;
  created_at: string;
  updated_at: string;
}

/* ================================================================== */
/* Cart                                                               */
/* ================================================================== */

export interface CartUserMini {
  id: number;
  user_id?: string;
  email: string;
  username: string;
  full_name: string;
}

export interface CartDistributorMini {
  id: number;
  full_name: string;
  email: string;
  rank: string;
}

export interface CartShopMini {
  id: number;
  name: string;
  location: string;
  region: string;
  country: string;
}

export interface CartItem {
  id: number;
  cart: number;
  product: number;
  product_name: string;
  product_sku: string;
  product_picture?: string | null;
  quantity: number;
  price: number | string;
  bv: number;
  subtotal: number | string;
  seller_id?: number | null;
  seller_name?: string | null;
  seller_rank?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  id: number;
  user: CartUserMini | null;
  distributor: CartDistributorMini | null;
  shop: CartShopMini | null;
  session_key: string | null;
  status: 'active' | 'converted' | 'abandoned' | 'expired';
  notes: string | null;
  items: CartItem[];
  subtotal: number | string;
  total_bv: number;
  total_items: number;
  distributor_name?: string | null;
  distributor_rank?: string | null;
  distributor_bonus_percentage?: number | string | null;
  created_at: string;
  updated_at: string;
}

export interface CartCreatePayload {
  user_id?: number | null;
  distributor_id?: number | null;
  shop_id?: number | null;
  session_key?: string | null;
  status?: 'active' | 'converted' | 'abandoned' | 'expired';
  notes?: string;
}

export type CartUpdatePayload = Partial<CartCreatePayload>;

export interface CartItemCreatePayload {
  product: number;
  quantity: number;
  price?: number;
  bv?: number;
}

export interface CartItemUpdatePayload {
  product?: number;
  quantity?: number;
  price?: number;
  bv?: number;
}

/* ================================================================== */
/* Category                                                           */
/* ================================================================== */

export interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  type: 'Classic' | 'Luxury';
  class_type: 'A' | 'B' | 'C' | 'D';
  class_type_display?: string;
  bv: number;
  price: number;
  status: 'active' | 'inactive';
  product_count: number;
  created_at: string;
  updated_at?: string;
}

/* ================================================================== */
/* Product                                                            */
/* ================================================================== */

export interface Product {
  id: number;
  category: number;
  category_name: string;
  category_code: string;
  category_type?: 'Classic' | 'Luxury';
  category_class_type?: 'A' | 'B' | 'C' | 'D';
  seller?: number | null;
  seller_name?: string | null;
  seller_rank?: string | null;
  sku: string;
  name: string;
  description: string;
  price: number | null;
  bv: number | null;
  effective_price: number;
  effective_bv: number;
  stock: number;
  sales: number;
  status: 'active' | 'inactive' | 'coming_soon';
  product_picture?: string | null;
  created_at: string;
  updated_at?: string;
}

/* ================================================================== */
/* Order                                                              */
/* ================================================================== */

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: number;
  bv: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer: number;
  customer_name: string;
  customer_email: string;
  customer_user_id?: string;
  distributor: number | null;
  distributor_name: string | null;
  total_amount: number;
  total_bv: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'paid' | 'unpaid' | 'partial';
  shipping_address: {
    street: string;
    city: string;
    region: string;
    country: string;
    zipCode: string;
  };
  delivery_date: string | null;
  notes: string | null;
  order_date: string;
  items: OrderItem[];
}

/* ================================================================== */
/* Commission                                                         */
/* ================================================================== */

export interface Commission {
  id: number;
  distributor: number;
  distributor_name: string;
  distributor_rank?: string;
  distributor_level?: number;
  order: number | null;
  order_number: string | null;
  type: 'personal' | 'differential';
  source_distributor: number | null;
  source_distributor_name: string | null;
  pbv: string;
  percentage: string;
  amount: string;
  status: 'paid' | 'pending' | 'processing';
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

/* ================================================================== */
/* Bonus                                                              */
/* ================================================================== */

export type BonusType =
  | 'consistency'
  | 'referral'
  | 'dynamic'
  | 'training'
  | 'event'
  | 'booking'
  | 'design'
  | 'festival'
  | 'loyalty';

export type BonusStatus = 'paid' | 'pending' | 'processing';

export interface Bonus {
  id: number;
  distributor: number;
  distributor_name: string;
  distributor_rank?: string;
  name: string;
  type: BonusType;
  amount: string;
  description: string;
  month: string;
  year: number;
  status: BonusStatus;
  payment_date: string | null;
  created_at: string;
  updated_at?: string;
}

export interface BonusCreatePayload {
  distributor: number;
  name: string;
  type: BonusType;
  amount: number;
  description?: string;
  month: string;
  year: number;
  status?: BonusStatus;
  payment_date?: string | null;
}

export type BonusUpdatePayload = Partial<BonusCreatePayload>;

/* ================================================================== */
/* Award                                                              */
/* ================================================================== */

export interface Award {
  id: number;
  distributor: number;
  distributor_name: string;
  distributor_rank?: string;
  name: string;
  category: 'legacy_circle' | 'legacy' | 'annual' | 'special';
  prize: string;
  description: string;
  year: number;
  status: 'active' | 'past' | 'upcoming';
  given_date: string | null;
  created_at: string;
  updated_at?: string;
}

/* ================================================================== */
/* Blog                                                               */
/* ================================================================== */

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: number;
  author_name: string;
  read_time: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
}

/* ================================================================== */
/* Analytics                                                          */
/* ================================================================== */

export interface AnalyticsData {
  totalRevenue: number;
  totalCommissions: number;
  totalBonuses: number;
  totalDistributors: number;
  activeDistributors: number;
  totalShops: number;
  totalOrders: number;
  totalBV: number;
  growthRate: number;
  monthlyData: MonthlyData[];
  topPerformers: TopPerformer[];
  rankDistribution: RankDistribution[];
}

export interface MonthlyData {
  month: string;
  revenue: number;
  commissions: number;
  bonuses: number;
  orders: number;
  distributors: number;
}

export interface TopPerformer {
  name: string;
  rank: string;
  value: number;
  type: 'Revenue' | 'Sales' | 'Commissions' | 'Bonuses';
}

export interface RankDistribution {
  rank: string;
  count: number;
  percentage: number;
}

/* ================================================================== */
/* API envelope                                                       */
/* ================================================================== */

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* ================================================================== */
/* Auth                                                               */
/* ================================================================== */

/** Login can be done with an OMA User ID, email, or username. */
export interface LoginCredentials {
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

export interface RegisterResponse {
  message: string;
  email: string;
  /** OMA User ID auto-assigned on creation. */
  user_id: string;
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

/* ================================================================== */
/* Admin — users & activity                                           */
/* ================================================================== */

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
  user_id?: string;
  search?: string;
  ordering?: string;
}

export interface AdminUserCreatePayload {
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
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