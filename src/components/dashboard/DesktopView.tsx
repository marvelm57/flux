'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, Receipt, PieChart, AlertTriangle, LogOut, Calculator } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { GlassCard } from '../ui/GlassComponents';
import { FilterTabs } from './FilterTabs';
import { ExpenseList } from './ExpenseList';
import { ExpenseChart } from './ExpenseChart';
import { AddExpenseForm } from './AddExpenseForm';
import { MonthlyTargetTracker } from './MonthlyTargetTracker';
import { ViewProps } from './types';
import { formatIDR } from '@/lib/budget';

export function DesktopView({
  expenses,
  loading,
  filter,
  setFilter,
  customDateRange,
  setCustomDateRange,
  totalExpenses,
  weeklyTotal,
  monthlyTotal,
  weeklyLimit,
  weeklyLimitStatus,
  expensesByCategory,
  expensesByDate,
  dailyAverage,
  numberOfDays,
  avgCalcMode,
  setAvgCalcMode,
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

  const modeLabels: Record<string, string> = {
    all: 'all days',
    workdays: 'workdays',
    active: 'active days',
  };

  const totalSpendingCard = {
    id: 'total-spending',
    title: 'Total Spending',
    value: formatIDR(totalExpenses),
    icon: TrendingDown,
    isDark: true,
    isAvgCard: false,
  };

  const dailyAvgCard = {
    id: 'daily-average',
    title: `Daily Average (${numberOfDays} ${modeLabels[avgCalcMode]})`,
    value: formatIDR(Math.round(dailyAverage)),
    icon: Calculator,
    isDark: true,
    isAvgCard: true,
  };

  const otherStatsCards = [
    {
      id: 'transactions',
      title: 'Transactions',
      value: expenses.length.toString(),
      icon: Receipt,
      isDark: false,
      isAvgCard: false,
    },
    {
      id: 'categories',
      title: 'Categories',
      value: Object.keys(expensesByCategory).length.toString(),
      icon: PieChart,
      isDark: false,
      isAvgCard: false,
    },
  ];

  // Add Daily Average card at index 1 for weekly/monthly/custom filters
  const statsCards = filter !== 'daily' 
    ? [totalSpendingCard, dailyAvgCard, ...otherStatsCards]
    : [totalSpendingCard, ...otherStatsCards];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <GlassCard variant="dark" padding="md" rounded="xl" className="bg-neutral-900">
              <Wallet size={24} className="text-white" />
            </GlassCard>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Flux</h1>
              <p className="text-neutral-500">Track your expenses with ease</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <FilterTabs 
              filter={filter} 
              setFilter={setFilter} 
              isMobile={false}
              customDateRange={customDateRange}
              onCustomDateChange={setCustomDateRange}
            />
            
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 backdrop-blur-sm border border-white/20 text-neutral-700 hover:text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </motion.header>

        {/* Weekly Limit Warning */}
        {(weeklyLimitStatus.isWarning || weeklyLimitStatus.isExceeded) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassCard 
              variant="frosted" 
              padding="md" 
              rounded="xl" 
              className={`flex items-center gap-3 ${
                weeklyLimitStatus.isExceeded 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <AlertTriangle 
                size={20} 
                className={weeklyLimitStatus.isExceeded ? 'text-red-500' : 'text-amber-500'} 
              />
              <div className="flex-1">
                <p className={`font-medium ${weeklyLimitStatus.isExceeded ? 'text-red-700' : 'text-amber-700'}`}>
                  {weeklyLimitStatus.message}
                </p>
                <p className="text-sm text-neutral-600">
                  Weekly limit: {formatIDR(weeklyLimit)} | Spent: {formatIDR(weeklyTotal)}
                </p>
              </div>
              <div className="w-32 h-2 bg-white/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyLimitStatus.percentage}%` }}
                  className={`h-full rounded-full ${
                    weeklyLimitStatus.isExceeded ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Monthly Spending Target Tracker */}
        <MonthlyTargetTracker monthlyTotal={monthlyTotal} />

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`grid gap-6 mb-8 ${filter !== 'daily' ? 'grid-cols-2 xl:grid-cols-4' : 'grid-cols-3'}`}
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="h-full"
            >
              <GlassCard
                variant={stat.isDark ? 'dark' : 'light'}
                padding="lg"
                rounded="2xl"
                className={`h-full flex flex-col justify-between ${stat.isDark ? 'bg-neutral-900 text-white' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-xs font-medium mb-1 ${stat.isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {index === 0 ? filterLabels[filter] + ' ' : ''}{stat.title}
                    </p>
                    <motion.h2
                      key={stat.value}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-3xl font-bold ${stat.isDark ? 'text-white' : 'text-neutral-900'}`}
                    >
                      {stat.value}
                    </motion.h2>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.isDark ? 'bg-white/10' : 'bg-neutral-900/10'}`}>
                    <stat.icon size={20} className={stat.isDark ? 'text-white' : 'text-neutral-700'} />
                  </div>
                </div>

                <div className={`mt-3 pt-2 border-t ${stat.isDark ? 'border-white/10' : 'border-neutral-200/60'} flex items-center h-6 gap-1 text-xs`}>
                  {stat.isAvgCard && (
                    <>
                      <span className={`${stat.isDark ? 'text-neutral-400' : 'text-neutral-500'} font-medium text-[9px] mr-1`}>Mode:</span>
                      {(['all', 'workdays', 'active'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setAvgCalcMode(mode)}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-medium transition-all ${
                            avgCalcMode === mode
                              ? stat.isDark
                                ? 'bg-white text-neutral-900 shadow-xs'
                                : 'bg-neutral-900 text-white shadow-xs'
                              : stat.isDark
                                ? 'bg-white/10 text-neutral-300 hover:bg-white/20'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {mode === 'all' ? 'All Days' : mode === 'workdays' ? 'Workdays' : 'Active Days'}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <ExpenseChart
            expensesByDate={expensesByDate}
            expensesByCategory={expensesByCategory}
            totalExpenses={totalExpenses}
            isMobile={false}
          />
        </motion.div>

        {/* Expense List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard variant="light" padding="lg" rounded="2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">Recent Transactions</h3>
              <span className="text-sm text-neutral-500">{expenses.length} items</span>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-3 border-neutral-300 border-t-neutral-800 rounded-full"
                />
              </div>
            ) : (
              <ExpenseList expenses={expenses} onDelete={deleteExpense} isMobile={false} />
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Add Expense Button */}
      <AddExpenseForm onSubmit={addExpense} isMobile={false} />
    </div>
  );
}
