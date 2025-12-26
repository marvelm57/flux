import { Expense, ExpenseInsert } from '@/lib/types';
import { FilterType, CustomDateRange } from '@/hooks/useExpenses';

export interface ViewProps {
  expenses: Expense[];
  loading: boolean;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  customDateRange?: CustomDateRange;
  setCustomDateRange: (range: CustomDateRange) => void;
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
  dailyAverage: number;
  numberOfDays: number;
  addExpense: (expense: ExpenseInsert) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}
