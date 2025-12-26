'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TrendingDown, CalendarDays, AlertTriangle, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { GlassCard } from '../ui/GlassComponents';
import { FilterTabs } from './FilterTabs';
import { ExpenseList } from './ExpenseList';
import { ExpenseChart } from './ExpenseChart';
import { AddExpenseForm } from './AddExpenseForm';
import { ViewProps } from './types';
import { formatIDR } from '@/lib/budget';

export function MobileView({
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
}: ViewProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filterLabels: Record<string, string> = {
    daily: "Today's",
    weekly: "This Week's",
    monthly: "This Month's",
    custom: "Custom",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200">
      {/* Status Bar Spacer */}
      <div className="h-12" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5 pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Flux</h1>
            <p className="text-sm text-neutral-500">Budget Tracker</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/20 text-neutral-700 hover:bg-white/60 transition-all disabled:opacity-50"
          >
            <LogOut size={18} />
            <span className="text-xs font-medium">{loggingOut ? '...' : 'Logout'}</span>
          </button>
        </div>

        {/* Total Spending Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard variant="dark" padding="lg" rounded="3xl" className="bg-neutral-900 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-neutral-400 text-sm mb-1">{filterLabels[filter]} Spending</p>
                <motion.h2
                  key={totalExpenses}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold tracking-tight"
                >
                  {formatIDR(totalExpenses)}
                </motion.h2>
              </div>
              <div className="p-3 rounded-2xl bg-white/10">
                <TrendingDown size={24} className="text-neutral-300" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <CalendarDays size={14} />
              <span>{expenses.length} transactions</span>
            </div>
            
            {/* Daily Average - only shown for weekly/monthly/custom */}
            {filter !== 'daily' && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-neutral-400 text-xs mb-0.5">Daily Average Spending</p>
                    <motion.p
                      key={dailyAverage}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-lg font-semibold text-white"
                    >
                      {formatIDR(Math.round(dailyAverage))}
                    </motion.p>
                  </div>
                  <p className="text-neutral-500 text-xs">
                    over {numberOfDays} day{numberOfDays !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Weekly Limit Warning */}
        {(weeklyLimitStatus.isWarning || weeklyLimitStatus.isExceeded) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <GlassCard 
              variant="frosted" 
              padding="sm" 
              rounded="xl" 
              className={`${
                weeklyLimitStatus.isExceeded 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle 
                  size={16} 
                  className={weeklyLimitStatus.isExceeded ? 'text-red-500' : 'text-amber-500'} 
                />
                <p className={`text-sm font-medium ${weeklyLimitStatus.isExceeded ? 'text-red-700' : 'text-amber-700'}`}>
                  {weeklyLimitStatus.message}
                </p>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyLimitStatus.percentage}%` }}
                  className={`h-full rounded-full ${
                    weeklyLimitStatus.isExceeded ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {formatIDR(weeklyTotal)} / {formatIDR(weeklyLimit)}
              </p>
            </GlassCard>
          </motion.div>
        )}
      </motion.header>

      {/* Main Content */}
      <main className="px-5 pb-24">
        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <GlassCard variant="light" padding="sm" rounded="2xl">
            <FilterTabs 
              filter={filter} 
              setFilter={setFilter} 
              isMobile={true}
              customDateRange={customDateRange}
              onCustomDateChange={setCustomDateRange}
            />
          </GlassCard>
        </motion.div>

        {/* Chart */}
        <div className="mb-6">
          <ExpenseChart
            expensesByDate={expensesByDate}
            expensesByCategory={expensesByCategory}
            totalExpenses={totalExpenses}
            isMobile={true}
          />
        </div>

        {/* Expense List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-sm font-medium text-neutral-500 mb-3 px-1">Recent Transactions</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-neutral-300 border-t-neutral-800 rounded-full"
              />
            </div>
          ) : (
            <ExpenseList expenses={expenses} onDelete={deleteExpense} isMobile={true} />
          )}
        </motion.div>
      </main>

      {/* Add Expense Button */}
      <AddExpenseForm onSubmit={addExpense} isMobile={true} />
    </div>
  );
}
