// src/types/admin.ts
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
  type: 'Consistency' | 'Referral' | 'Dynamic' | 'Training' | 'Event' | 'Booking' | 'Design' | 'Festival';
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
  performanceLevel: 'Seed' | 'Bloom' | 'Garden' | 'Emerald' | 'Diamond' | 'Crown' | 'Gold Crown';
  monthlyRevenue: number;
  bonusPercentage: number;
  status: 'Active' | 'Inactive';
}

export interface SavingsBottle {
  rank: string;
  limit: number;
  currentSavings: number;
}

export const RANKS: Rank[] = [
  { id: 1, name: 'Seed', level: 0, cgvRequired: 0, pbvRequired: 0, bonusPercentage: 0, qualifiedLeaders: 0 },
  { id: 2, name: 'Associate', level: 1, cgvRequired: 0, pbvRequired: 20, bonusPercentage: 4, qualifiedLeaders: 0 },
  { id: 3, name: 'Builder', level: 2, cgvRequired: 200, pbvRequired: 30, bonusPercentage: 5, qualifiedLeaders: 0 },
  { id: 4, name: 'Leader', level: 3, cgvRequired: 600, pbvRequired: 50, bonusPercentage: 8, qualifiedLeaders: 1, requiredRank: 'Builder' },
  { id: 5, name: 'Senior Leader', level: 4, cgvRequired: 1500, pbvRequired: 70, bonusPercentage: 11, qualifiedLeaders: 2, requiredRank: 'Leader' },
  { id: 6, name: 'Executive', level: 5, cgvRequired: 4000, pbvRequired: 90, bonusPercentage: 14, qualifiedLeaders: 2, requiredRank: 'Senior Leader' },
  { id: 7, name: 'Manager', level: 6, cgvRequired: 10000, pbvRequired: 120, bonusPercentage: 17, qualifiedLeaders: 3, requiredRank: 'Executive' },
  { id: 8, name: 'Senior Manager', level: 7, cgvRequired: 25000, pbvRequired: 160, bonusPercentage: 20, qualifiedLeaders: 3, requiredRank: 'Manager' },
  { id: 9, name: 'Director', level: 8, cgvRequired: 60000, pbvRequired: 200, bonusPercentage: 24, qualifiedLeaders: 5, requiredRank: 'Senior Manager' },
  { id: 10, name: 'Crown Director', level: 9, cgvRequired: 120000, pbvRequired: 250, bonusPercentage: 28, qualifiedLeaders: 4, requiredRank: 'Director' },
  { id: 11, name: 'Royal Crown Director', level: 10, cgvRequired: 184000, pbvRequired: 300, bonusPercentage: 32, qualifiedLeaders: 5, requiredRank: 'Crown Director' },
];