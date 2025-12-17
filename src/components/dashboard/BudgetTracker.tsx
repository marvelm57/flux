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
    addExpense,
    deleteExpense,
    totalExpenses,
    weeklyTotal,
    weeklyLimit,
    weeklyLimitStatus,
    expensesByCategory,
    expensesByDate,
  } = useExpenses();

  const isMobile = useIsMobile();

  const commonProps = {
    expenses,
    loading,
    filter,
    setFilter,
    totalExpenses,
    weeklyTotal,
    weeklyLimit,
    weeklyLimitStatus,
    expensesByCategory,
    expensesByDate,
    addExpense,
    deleteExpense,
  };

  return isMobile ? <MobileView {...commonProps} /> : <DesktopView {...commonProps} />;
}
