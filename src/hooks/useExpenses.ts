'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense, ExpenseInsert } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO, differenceInCalendarDays } from 'date-fns';
import { getWeeklyLimitStatus, WEEKLY_LIMIT } from '@/lib/budget';

export type FilterType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type AvgCalcMode = 'all' | 'workdays' | 'active';

export interface CustomDateRange {
  start: string;
  end: string;
}

// Helper to get date range based on filter type
function getDateRange(filter: Exclude<FilterType, 'custom'>, now = new Date()) {
  const ranges = {
    daily: { start: startOfDay(now), end: endOfDay(now) },
    weekly: { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) },
    monthly: { start: startOfMonth(now), end: endOfMonth(now) },
  };
  return ranges[filter];
}

// Format date for Supabase query (YYYY-MM-DD)
const toDateString = (date: Date) => format(date, 'yyyy-MM-dd');

export function useExpenses() {
  const [filter, setFilter] = useState<FilterType>('daily');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();
  const [avgCalcMode, setAvgCalcMode] = useState<AvgCalcMode>(() => {
    if (typeof window === 'undefined') return 'all';
    const saved = localStorage.getItem('flux_avg_calc_mode');
    if (saved === 'all' || saved === 'workdays' || saved === 'active') {
      return saved as AvgCalcMode;
    }
    return 'all';
  });

  const handleSetAvgCalcMode = useCallback((mode: AvgCalcMode) => {
    setAvgCalcMode(mode);
    localStorage.setItem('flux_avg_calc_mode', mode);
  }, []);

  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  // Compute date range for active filter
  const activeDateRange = useMemo(() => {
    if (filter === 'custom' && customDateRange) {
      return {
        start: startOfDay(parseISO(customDateRange.start)),
        end: endOfDay(parseISO(customDateRange.end)),
      };
    } else if (filter !== 'custom') {
      return getDateRange(filter);
    }
    return {
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    };
  }, [filter, customDateRange]);

  const weeklyRange = useMemo(() => getDateRange('weekly'), []);
  const monthlyRange = useMemo(() => getDateRange('monthly'), []);

  const startDateStr = toDateString(activeDateRange.start);
  const endDateStr = toDateString(activeDateRange.end);
  const weeklyStartStr = toDateString(weeklyRange.start);
  const weeklyEndStr = toDateString(weeklyRange.end);
  const monthlyStartStr = toDateString(monthlyRange.start);
  const monthlyEndStr = toDateString(monthlyRange.end);

  // Query 1: Filtered expenses
  const {
    data: expenses = [],
    isLoading: loadingExpenses,
    refetch,
  } = useQuery<Expense[]>({
    queryKey: ['expenses', filter, startDateStr, endDateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, amount, category, description, expense_date, user_id, created_at')
        .gte('expense_date', startDateStr)
        .lte('expense_date', endDateStr)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  // Query 2: Weekly expenses for budget status tracking
  const isWeeklyFilter = filter === 'weekly';
  const { data: separateWeeklyExpenses = [] } = useQuery<Expense[]>({
    queryKey: ['expenses', 'weekly-summary', weeklyStartStr, weeklyEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, amount, category, description, expense_date, user_id, created_at')
        .gte('expense_date', weeklyStartStr)
        .lte('expense_date', weeklyEndStr);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !isWeeklyFilter,
  });

  // Query 3: Monthly expenses for monthly target calculations
  const isMonthlyFilter = filter === 'monthly';
  const { data: separateMonthlyExpenses = [] } = useQuery<Expense[]>({
    queryKey: ['expenses', 'monthly-summary', monthlyStartStr, monthlyEndStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, amount, category, description, expense_date, user_id, created_at')
        .gte('expense_date', monthlyStartStr)
        .lte('expense_date', monthlyEndStr);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !isMonthlyFilter,
  });

  const weeklyExpenses = isWeeklyFilter ? expenses : separateWeeklyExpenses;
  const monthlyExpenses = isMonthlyFilter ? expenses : separateMonthlyExpenses;
  const loading = loadingExpenses;

  // Add Expense Mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: ExpenseInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('expenses')
        .insert({ ...newExpense, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (savedExpense) => {
      if (!savedExpense) return;

      // Update all cached expense queries (Daily, Weekly, Monthly, Custom) whose date range includes the new item
      const queries = queryClient.getQueriesData<Expense[]>({ queryKey: ['expenses'] });
      queries.forEach(([queryKey, oldData]) => {
        if (!oldData) return;
        const keyArr = queryKey as string[];
        if (keyArr.length >= 4) {
          const startStr = keyArr[2];
          const endStr = keyArr[3];

          if (savedExpense.expense_date >= startStr && savedExpense.expense_date <= endStr) {
            const updated = oldData.some((item) => item.id === savedExpense.id)
              ? oldData
              : [savedExpense, ...oldData].sort((a, b) =>
                  b.expense_date.localeCompare(a.expense_date)
                );
            queryClient.setQueryData(queryKey, updated);
          }
        }
      });

      // Invalidate in background for total server sync
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  // Delete Expense Mutation (Optimistic Update)
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] });

      // Optimistically remove deleted expense from ALL cached expense queries (Daily, Weekly, Monthly, etc.)
      queryClient.setQueriesData<Expense[]>(
        { queryKey: ['expenses'] },
        (old) => (old ? old.filter((item) => item.id !== id) : [])
      );
    },
    onError: (err) => {
      console.error('Error deleting expense:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const addExpense = useCallback(
    async (expense: ExpenseInsert) => {
      await addExpenseMutation.mutateAsync(expense);
    },
    [addExpenseMutation]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await deleteExpenseMutation.mutateAsync(id);
    },
    [deleteExpenseMutation]
  );

  // Derived state computations
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.amount), 0), [expenses]);
  const weeklyTotal = useMemo(() => weeklyExpenses.reduce((sum, e) => sum + Number(e.amount), 0), [weeklyExpenses]);
  const monthlyTotal = useMemo(() => monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0), [monthlyExpenses]);
  const weeklyLimitStatus = useMemo(() => getWeeklyLimitStatus(weeklyTotal), [weeklyTotal]);

  const numberOfDays = useMemo(() => {
    if (filter === 'daily') return 1;

    if (avgCalcMode === 'active') {
      if (expenses.length === 0) return 0;
      const uniqueDates = new Set(expenses.map((e) => e.expense_date));
      return uniqueDates.size;
    }

    const { start, end } = activeDateRange;
    const now = new Date();
    const actualEnd = end > now ? now : end;

    const startDate = startOfDay(start);
    const endDate = startOfDay(actualEnd);

    if (startDate > endDate) return 1;

    if (avgCalcMode === 'workdays') {
      let count = 0;
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) count++;
        cur.setDate(cur.getDate() + 1);
      }
      return Math.max(1, count);
    }

    // Default 'all' calendar days
    const diffDays = differenceInCalendarDays(endDate, startDate) + 1;
    return Math.max(1, diffDays);
  }, [filter, expenses, activeDateRange, avgCalcMode]);

  const dailyAverage = useMemo(() => {
    if (numberOfDays === 0) return 0;
    return totalExpenses / numberOfDays;
  }, [totalExpenses, numberOfDays]);

  const expensesByCategory = useMemo(
    () =>
      expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
      }, {}),
    [expenses]
  );

  const expensesByDate = useMemo(
    () =>
      expenses.reduce<Record<string, number>>((acc, e) => {
        const date = format(parseISO(e.expense_date), 'MMM dd');
        acc[date] = (acc[date] || 0) + Number(e.amount);
        return acc;
      }, {}),
    [expenses]
  );

  return {
    expenses,
    loading,
    filter,
    setFilter,
    customDateRange,
    setCustomDateRange,
    addExpense,
    deleteExpense,
    totalExpenses,
    weeklyTotal,
    monthlyTotal,
    weeklyLimit: WEEKLY_LIMIT,
    weeklyLimitStatus,
    expensesByCategory,
    expensesByDate,
    dailyAverage,
    numberOfDays,
    avgCalcMode,
    setAvgCalcMode: handleSetAvgCalcMode,
    refetch,
  };
}
