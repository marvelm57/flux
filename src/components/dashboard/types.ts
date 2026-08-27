import { Expense, ExpenseInsert } from '@/lib/types';
import { FilterType, CustomDateRange, AvgCalcMode } from '@/hooks/useExpenses';

export interface ViewProps {
  expenses: Expense[];
  loading: boolean;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  customDateRange?: CustomDateRange;
  setCustomDateRange: (range: CustomDateRange) => void;
  totalExpenses: number;
  weeklyTotal: number;
  monthlyTotal: number;
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
  avgCalcMode: AvgCalcMode;
  setAvgCalcMode: (mode: AvgCalcMode) => void;
  addExpense: (expense: ExpenseInsert) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}
