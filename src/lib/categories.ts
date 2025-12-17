import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  Home,
  Heart,
  GraduationCap,
  Plane,
  MoreHorizontal,
  Coffee,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
};

export const categories: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: Utensils },
  { id: 'transport', name: 'Transport', icon: Car },
  { id: 'shopping', name: 'Shopping', icon: ShoppingBag },
  { id: 'entertainment', name: 'Entertainment', icon: Film },
  { id: 'utilities', name: 'Utilities', icon: Zap },
  { id: 'housing', name: 'Housing', icon: Home },
  { id: 'health', name: 'Health', icon: Heart },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'travel', name: 'Travel', icon: Plane },
  { id: 'coffee', name: 'Coffee', icon: Coffee },
  { id: 'tech', name: 'Tech', icon: Smartphone },
  { id: 'other', name: 'Other', icon: MoreHorizontal },
];

export const getCategoryById = (id: string): Category => {
  return categories.find((c) => c.id === id) || categories[categories.length - 1];
};
