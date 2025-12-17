'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, Receipt, PieChart, AlertTriangle, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { GlassCard } from '../ui/GlassComponents';
import { FilterTabs } from './FilterTabs';
import { ExpenseList } from './ExpenseList';
import { ExpenseChart } from './ExpenseChart';
import { AddExpenseForm } from './AddExpenseForm';
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
  weeklyLimit,
  weeklyLimitStatus,
  expensesByCategory,
  expensesByDate,
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

  const statsCards = [
    {
      title: 'Total Spending',
      value: formatIDR(totalExpenses),
      icon: TrendingDown,
      color: 'bg-neutral-900 text-white',
    },
    {
      title: 'Transactions',
      value: expenses.length.toString(),
      icon: Receipt,
      color: 'bg-white/40',
    },
    {
      title: 'Categories',
      value: Object.keys(expensesByCategory).length.toString(),
      icon: PieChart,
      color: 'bg-white/40',
    },
  ];

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
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 backdrop-blur-sm border border-white/20 text-neutral-700 hover:bg-white/60 transition-all disabled:opacity-50"
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

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <GlassCard
                variant={index === 0 ? 'dark' : 'light'}
                padding="lg"
                rounded="2xl"
                className={index === 0 ? 'bg-neutral-900' : ''}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm mb-1 ${index === 0 ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {index === 0 ? filterLabels[filter] + ' ' : ''}{stat.title}
                    </p>
                    <motion.h2
                      key={stat.value}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-3xl font-bold ${index === 0 ? 'text-white' : 'text-neutral-900'}`}
                    >
                      {stat.value}
                    </motion.h2>
                  </div>
                  <div className={`p-3 rounded-xl ${index === 0 ? 'bg-white/10' : 'bg-neutral-900/10'}`}>
                    <stat.icon size={20} className={index === 0 ? 'text-white' : 'text-neutral-700'} />
                  </div>
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
