'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [weeklyExpenses, setWeeklyExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('daily');
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | undefined>();

  const supabase = useMemo(() => createClient(), []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);

    let start: Date;
    let end: Date;

    if (filter === 'custom' && customDateRange) {
      start = startOfDay(parseISO(customDateRange.start));
      end = endOfDay(parseISO(customDateRange.end));
    } else if (filter !== 'custom') {
      const range = getDateRange(filter);
      start = range.start;
      end = range.end;
    } else {
      // Custom filter without date range - default to today
      start = startOfDay(new Date());
      end = endOfDay(new Date());
    }

    const weeklyRange = getDateRange('weekly');

    try {
      // Fetch filtered expenses and weekly expenses in parallel
      const [filteredResult, weeklyResult] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .gte('expense_date', toDateString(start))
          .lte('expense_date', toDateString(end))
          .order('expense_date', { ascending: false }),
        supabase
          .from('expenses')
          .select('*')
          .gte('expense_date', toDateString(weeklyRange.start))
          .lte('expense_date', toDateString(weeklyRange.end)),
      ]);

      setExpenses(filteredResult.data ?? []);
      setWeeklyExpenses(weeklyResult.data ?? []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
      setWeeklyExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [filter, customDateRange, supabase]);

  const addExpense = useCallback(async (expense: ExpenseInsert) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: user.id });

    if (error) throw error;
    fetchExpenses();
  }, [supabase, fetchExpenses]);

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    fetchExpenses();
  }, [supabase, fetchExpenses]);

  // Derived state
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const weeklyTotal = useMemo(() => weeklyExpenses.reduce((sum, e) => sum + e.amount, 0), [weeklyExpenses]);
  const weeklyLimitStatus = useMemo(() => getWeeklyLimitStatus(weeklyTotal), [weeklyTotal]);

  const expensesByCategory = useMemo(() => 
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {}), [expenses]);

  const expensesByDate = useMemo(() => 
    expenses.reduce<Record<string, number>>((acc, e) => {
      const date = format(new Date(e.expense_date), 'MMM dd');
      acc[date] = (acc[date] || 0) + e.amount;
      return acc;
    }, {}), [expenses]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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
    refetch: fetchExpenses,
  };
}
