'use client';

import { useExpenses } from '@/hooks/useExpenses';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { MobileView } from './MobileView';
import { DesktopView } from './DesktopView';

export function BudgetTracker() {
  const {
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
    weeklyLimit,
    weeklyLimitStatus,
    expensesByCategory,
    expensesByDate,
    dailyAverage,
    numberOfDays,
  } = useExpenses();

  const isMobile = useIsMobile();

  const commonProps = {
    expenses,
    loading,
    filter,
    setFilter,
    customDateRange,
    setCustomDateRange,
    totalExpenses,
    weeklyTotal,
    weeklyLimit,
    weeklyLimitStatus,
    expensesByCategory,
    expensesByDate,
    dailyAverage,
    numberOfDays,
    addExpense,
    deleteExpense,
  };

  return isMobile ? <MobileView {...commonProps} /> : <DesktopView {...commonProps} />;
}
