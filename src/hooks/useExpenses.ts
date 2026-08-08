'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense, ExpenseInsert } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, parseISO } from 'date-fns';
import { getWeeklyLimitStatus, WEEKLY_LIMIT } from '@/lib/budget';

export type FilterType = 'daily' | 'weekly' | 'monthly' | 'custom';

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

  const startDateStr = toDateString(activeDateRange.start);
  const endDateStr = toDateString(activeDateRange.end);
  const weeklyStartStr = toDateString(weeklyRange.start);
  const weeklyEndStr = toDateString(weeklyRange.end);

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

  // Query 2: Weekly expenses for budget status tracking (skip redundant DB query if filter === 'weekly')
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
    enabled: !isWeeklyFilter, // De-duplicate: do not run if weekly filter is active
  });

  const weeklyExpenses = isWeeklyFilter ? expenses : separateWeeklyExpenses;
  const loading = loadingExpenses;

  // Add Expense Mutation (Optimistic Update)
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
    onMutate: async (newExpense) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] });

      const optimisticItem: Expense = {
        id: 'temp-' + Date.now(),
        amount: newExpense.amount,
        category: newExpense.category,
        description: newExpense.description ?? null,
        expense_date: newExpense.expense_date || toDateString(new Date()),
        user_id: 'optimistic-user',
        created_at: new Date().toISOString(),
      };

      // Optimistically update current active query
      queryClient.setQueryData<Expense[]>(
        ['expenses', filter, startDateStr, endDateStr],
        (old = []) => [optimisticItem, ...old]
      );

      return { optimisticItem };
    },
    onError: (err) => {
      console.error('Error adding expense:', err);
    },
    onSettled: () => {
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

      const previousExpenses = queryClient.getQueryData<Expense[]>([
        'expenses',
        filter,
        startDateStr,
        endDateStr,
      ]);

      queryClient.setQueryData<Expense[]>(
        ['expenses', filter, startDateStr, endDateStr],
        (old = []) => old.filter((item) => item.id !== id)
      );

      return { previousExpenses };
    },
    onError: (err, id, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(
          ['expenses', filter, startDateStr, endDateStr],
          context.previousExpenses
        );
      }
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
  const weeklyLimitStatus = useMemo(() => getWeeklyLimitStatus(weeklyTotal), [weeklyTotal]);

  const numberOfDays = useMemo(() => {
    if (filter === 'daily') return 1;
    if (expenses.length === 0) return 0;
    const uniqueDates = new Set(expenses.map((e) => e.expense_date));
    return uniqueDates.size;
  }, [filter, expenses]);

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
    weeklyLimit: WEEKLY_LIMIT,
    weeklyLimitStatus,
    expensesByCategory,
    expensesByDate,
    dailyAverage,
    numberOfDays,
    refetch,
  };
}
