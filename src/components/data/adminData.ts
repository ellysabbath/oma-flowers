// src/data/adminData.ts
export interface Rank {
  level: number;
  name: string;
  cgv: number;
  pbv: number;
  bonus: number;
  qualified: string;
}

export const ranks: Rank[] = [
  { level: 0, name: 'Seed', cgv: 0, pbv: 0, bonus: 0, qualified: '—' },
  { level: 1, name: 'Associate', cgv: 0, pbv: 20, bonus: 4, qualified: '—' },
  { level: 2, name: 'Builder', cgv: 200, pbv: 30, bonus: 5, qualified: '—' },
  { level: 3, name: 'Leader', cgv: 600, pbv: 50, bonus: 8, qualified: '1 Builder' },
  { level: 4, name: 'Senior Leader', cgv: 1500, pbv: 70, bonus: 11, qualified: '2 Leader' },
  { level: 5, name: 'Executive', cgv: 4000, pbv: 90, bonus: 14, qualified: '2 Senior Leader' },
  { level: 6, name: 'Manager', cgv: 10000, pbv: 120, bonus: 17, qualified: '3 Executive' },
  { level: 7, name: 'Senior Manager', cgv: 25000, pbv: 160, bonus: 20, qualified: '3 Manager' },
  { level: 8, name: 'Director', cgv: 60000, pbv: 200, bonus: 24, qualified: '5 Senior Manager' },
  { level: 9, name: 'Crown Director', cgv: 120000, pbv: 250, bonus: 28, qualified: '4 Director' },
  { level: 10, name: 'Royal Crown Director', cgv: 184000, pbv: 300, bonus: 32, qualified: '5 Crown Director' },
];

export interface Product {
  code: string;
  name: string;
  category: 'Classic' | 'Luxury';
  class: string;
  bv: number;
  price: number;
}

export const products: Product[] = [
  { code: 'CCA', name: 'Classic Class A Flower', category: 'Classic', class: 'A', bv: 6, price: 56000 },
  { code: 'CCB', name: 'Classic Class B Flower', category: 'Classic', class: 'B', bv: 4, price: 34000 },
  { code: 'CCC', name: 'Classic Class C Flower', category: 'Classic', class: 'C', bv: 2, price: 15000 },
  { code: 'LCA', name: 'Luxury Class A Flower', category: 'Luxury', class: 'A', bv: 20, price: 250000 },
  { code: 'LCB', name: 'Luxury Class B Flower', category: 'Luxury', class: 'B', bv: 14, price: 160000 },
  { code: 'LCC', name: 'Luxury Class C Flower', category: 'Luxury', class: 'C', bv: 10, price: 120000 },
];

export interface CommissionData {
  name: string;
  rank: string;
  pbv: number;
  percentage: number;
  amount: number;
}

export const personalBonuses: CommissionData[] = [
  { name: 'John Doe', rank: 'Royal Crown Director', pbv: 350, percentage: 32, amount: 280000 },
  { name: 'Sarah Smith', rank: 'Crown Director', pbv: 280, percentage: 28, amount: 196000 },
  { name: 'Mike Johnson', rank: 'Director', pbv: 220, percentage: 24, amount: 132000 },
  { name: 'Peter Wilson', rank: 'Senior Manager', pbv: 180, percentage: 20, amount: 90000 },
  { name: 'Jane Brown', rank: 'Manager', pbv: 140, percentage: 17, amount: 59500 },
  { name: 'Robert Davis', rank: 'Executive', pbv: 90, percentage: 14, amount: 31500 },
];

export interface Distributor {
  id: number;
  name: string;
  rank: string;
  pbv: number;
  cgv: number;
  status: 'Active' | 'Inactive';
  joinDate: string;
  avatar: string;
}

export const distributors: Distributor[] = [
  { id: 1, name: 'John Doe', rank: 'Royal Crown Director', pbv: 350, cgv: 184000, status: 'Active', joinDate: '2023-01-15', avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=amber&color=fff' },
  { id: 2, name: 'Sarah Smith', rank: 'Crown Director', pbv: 280, cgv: 120000, status: 'Active', joinDate: '2023-03-20', avatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=amber&color=fff' },
  { id: 3, name: 'Mike Johnson', rank: 'Director', pbv: 220, cgv: 60000, status: 'Active', joinDate: '2023-05-10', avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=amber&color=fff' },
  { id: 4, name: 'Peter Wilson', rank: 'Senior Manager', pbv: 180, cgv: 25000, status: 'Active', joinDate: '2023-07-05', avatar: 'https://ui-avatars.com/api/?name=Peter+Wilson&background=amber&color=fff' },
  { id: 5, name: 'Jane Brown', rank: 'Manager', pbv: 140, cgv: 10000, status: 'Active', joinDate: '2023-09-12', avatar: 'https://ui-avatars.com/api/?name=Jane+Brown&background=amber&color=fff' },
  { id: 6, name: 'Robert Davis', rank: 'Executive', pbv: 90, cgv: 4000, status: 'Active', joinDate: '2023-11-18', avatar: 'https://ui-avatars.com/api/?name=Robert+Davis&background=amber&color=fff' },
];

export interface BonusItem {
  id: number;
  name: string;
  type: string;
  amount: number;
  winner: string;
  rank: string;
}

export const bonuses: BonusItem[] = [
  { id: 1, name: 'Consistency Bonus', type: 'Consistency', amount: 150000, winner: 'John Doe', rank: 'Royal Crown Director' },
  { id: 2, name: 'Smart Referral Score', type: 'Referral', amount: 75000, winner: 'John Doe', rank: 'Royal Crown Director' },
  { id: 3, name: 'Diamond Garden Star', type: 'Dynamic', amount: 200000, winner: 'John Doe', rank: 'Royal Crown Director' },
  { id: 4, name: 'Gold Garden Star', type: 'Dynamic', amount: 150000, winner: 'Sarah Smith', rank: 'Crown Director' },
  { id: 5, name: 'Mentor Academy Bonus', type: 'Training', amount: 250000, winner: 'John Doe', rank: 'Royal Crown Director' },
  { id: 6, name: 'Wedding Decoration Award', type: 'Event', amount: 120000, winner: 'Sarah Smith', rank: 'Crown Director' },
  { id: 7, name: 'Christmas Festival Bonus', type: 'Festival', amount: 80000, winner: 'John Doe', rank: 'Royal Crown Director' },
];

export interface AwardItem {
  id: number;
  name: string;
  category: string;
  winner: string;
  rank: string;
  prize: string;
}

export const awards: AwardItem[] = [
  { id: 1, name: 'Legacy Circle Award', category: 'Legacy', winner: 'John Doe', rank: 'Royal Crown Director', prize: 'OMA LEGACY RING' },
  { id: 2, name: 'Team Builder of the Year', category: 'Annual', winner: 'John Doe', rank: 'Royal Crown Director', prize: 'TSh 5,000,000' },
  { id: 3, name: 'Annual Sales Excellence Award', category: 'Annual', winner: 'Sarah Smith', rank: 'Crown Director', prize: 'TSh 3,000,000' },
  { id: 4, name: 'Best Trainer Award', category: 'Annual', winner: 'John Doe', rank: 'Royal Crown Director', prize: 'TSh 2,500,000' },
  { id: 5, name: 'Event Designer of the Year', category: 'Annual', winner: 'Sarah Smith', rank: 'Crown Director', prize: 'TSh 2,000,000' },
  { id: 6, name: 'Innovation Award', category: 'Special', winner: 'Mike Johnson', rank: 'Director', prize: 'TSh 1,500,000' },
];

export interface Shop {
  id: number;
  name: string;
  owner: string;
  location: string;
  performanceLevel: string;
  monthlyRevenue: number;
  bonusPercentage: number;
}

export const shops: Shop[] = [
  { id: 1, name: 'OMA Flowers - Dar es Salaam', owner: 'John Doe', location: 'Dar es Salaam', performanceLevel: 'Gold Crown', monthlyRevenue: 55000, bonusPercentage: 6.0 },
  { id: 2, name: 'OMA Flowers - Arusha', owner: 'Sarah Smith', location: 'Arusha', performanceLevel: 'Crown', monthlyRevenue: 35000, bonusPercentage: 5.5 },
  { id: 3, name: 'OMA Flowers - Mwanza', owner: 'Mike Johnson', location: 'Mwanza', performanceLevel: 'Diamond', monthlyRevenue: 25000, bonusPercentage: 5.0 },
  { id: 4, name: 'OMA Flowers - Kilimanjaro', owner: 'Peter Wilson', location: 'Moshi', performanceLevel: 'Emerald', monthlyRevenue: 15000, bonusPercentage: 4.5 },
  { id: 5, name: 'OMA Flowers - Tanga', owner: 'Jane Brown', location: 'Tanga', performanceLevel: 'Garden', monthlyRevenue: 8000, bonusPercentage: 4.0 },
];

export const savingsBottles = [
  { rank: 'Leader', limit: 200000 },
  { rank: 'Senior Leader', limit: 550000 },
  { rank: 'Executive', limit: 1750000 },
  { rank: 'Manager', limit: 6375000 },
  { rank: 'Senior Manager', limit: 15000000 },
  { rank: 'Director', limit: 39000000 },
  { rank: 'Crown Director', limit: 1190000000 },
  { rank: 'Royal Crown Director', limit: 1840000000 },
];