import { Expense, ExpenseInsert } from '@/lib/types';
import { FilterType } from '@/hooks/useExpenses';

export interface ViewProps {
  expenses: Expense[];
  loading: boolean;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  totalExpenses: number;
  weeklyTotal: number;
  weeklyLimit: number;
  weeklyLimitStatus: {
    percentage: number;
    remaining: number;
    isWarning: boolean;
    isExceeded: boolean;
    message: string;
  };
  expensesByCategory: Record<string, number>;
  expensesByDate: Record<string, number>;
  addExpense: (expense: ExpenseInsert) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}
