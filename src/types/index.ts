// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  profile_picture: string | null;
  user_type: 'customer' | 'distributor' | 'admin';
  status: 'active' | 'inactive' | 'pending' | 'banned';
  email_verified: boolean;
  created_at: string;
}

// In your types file - update the Distributor interface
export interface Distributor {
  id: number;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    phone: string;
    country: string;
    region: string;
    city: string;
    profile_picture: string | null;
    user_type: 'customer' | 'distributor' | 'admin';
    status: 'active' | 'inactive' | 'pending' | 'banned';
    email_verified: boolean;
    created_at: string;
  };
  full_name: string; // This is also directly on the distributor
  rank: string;
  level: number;
  pbv: number | string;
  cgv: number | string;
  bonus_percentage: number | string;
  join_date: string;
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

// Shop Types
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
  monthly_revenue: number | string;
  bonus_percentage: number | string;
  customers: number;
  rating: number | string;
  status: 'active' | 'inactive' | 'pending';
  established_date: string;
  created_at: string;
  updated_at: string;
}


/* ------------------------------------------------------------------ */
/* Cart Types                                                          */
/* ------------------------------------------------------------------ */

export interface CartUserMini {
  id: number;
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
  created_at: string;
  updated_at: string;
}

/** POST /carts/ payload */
export interface CartCreatePayload {
  user_id?: number | null;
  distributor_id?: number | null;
  shop_id?: number | null;
  session_key?: string | null;
  status?: 'active' | 'converted' | 'abandoned' | 'expired';
  notes?: string;
}

/** PATCH /carts/<id>/ payload */
export type CartUpdatePayload = Partial<CartCreatePayload>;

/** POST /carts/<cart_id>/items/ payload */
export interface CartItemCreatePayload {
  product: number;
  quantity: number;
  price?: number;
  bv?: number;
}

/** PATCH /carts/<cart_id>/items/<item_id>/ payload */
export interface CartItemUpdatePayload {
  product?: number;
  quantity?: number;
  price?: number;
  bv?: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  type: 'Classic' | 'Luxury';
  class_type: 'A' | 'B' | 'C' | 'D';        // ← added 'D'
  class_type_display?: string;              // ← optional (backend new field)
  bv: number;
  price: number;
  status: 'active' | 'inactive';
  product_count: number;
  created_at: string;
  updated_at?: string;                      // ← optional
}

// Product Types
export interface Product {
  id: number;
  category: number;
  category_name: string;
  category_code: string;
  category_type?: 'Classic' | 'Luxury';     // ← new
  category_class_type?: 'A' | 'B' | 'C' | 'D'; // ← new
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
  updated_at?: string;                      // ← optional
}
// Order Types
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

// Commission Types
export interface Commission {
  id: number;
  distributor: number;
  distributor_name: string;
  order: number;
  order_number: string;
  type: 'personal' | 'differential';
  source_distributor: number | null;
  source_distributor_name: string | null;
  percentage: number;
  amount: number;
  status: 'paid' | 'pending' | 'processing';
  payment_date: string | null;
  created_at: string;
}

// Bonus Types
export interface Bonus {
  id: number;
  distributor: number;
  distributor_name: string;
  name: string;
  type: 'consistency' | 'referral' | 'dynamic' | 'training' | 'event' | 'booking' | 'festival' | 'loyalty';
  amount: number;
  description: string;
  month: string;
  year: number;
  status: 'paid' | 'pending' | 'processing';
  payment_date: string | null;
  created_at: string;
}

// Award Types
export interface Award {
  id: number;
  distributor: number;
  distributor_name: string;
  name: string;
  category: 'legacy_circle' | 'legacy' | 'annual' | 'special';
  prize: string;
  description: string;
  year: number;
  status: 'active' | 'past' | 'upcoming';
  given_date: string;
  created_at: string;
}

// Blog Types
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

// Analytics Types
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

// API Response Types
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

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  profile_picture?: string;
  password: string;
  password2: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  distributor: Distributor | null;
  user_type: string;
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