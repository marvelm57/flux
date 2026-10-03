import {
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  Heart,
  GraduationCap,
  Coffee,
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
  { id: 'coffee', name: 'Coffee', icon: Coffee },
  { id: 'health', name: 'Health', icon: Heart },
  { id: 'education', name: 'Education', icon: GraduationCap },
];

export const getCategoryById = (id: string): Category => {
  return categories.find((c) => c.id === id) || categories[categories.length - 1];
};
