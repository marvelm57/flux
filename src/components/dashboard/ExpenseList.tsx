'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { GlassCard } from '../ui/GlassComponents';
import { Expense } from '@/lib/types';
import { getCategoryById } from '@/lib/categories';
import { formatIDR } from '@/lib/budget';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  isMobile: boolean;
}

export function ExpenseList({ expenses, onDelete, isMobile }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-neutral-500"
      >
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
          <span className="text-3xl">💸</span>
        </div>
        <p className="text-lg font-medium">No expenses yet</p>
        <p className="text-sm">Tap the + button to add your first expense</p>
      </motion.div>
    );
  }

  // Group expenses by date
  const groupedExpenses = expenses.reduce(
    (groups, expense) => {
      const date = format(new Date(expense.expense_date), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
      return groups;
    },
    {} as Record<string, Expense[]>
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {Object.entries(groupedExpenses).map(([date, dateExpenses]) => {
        const dateTotal = dateExpenses.reduce((sum, e) => sum + e.amount, 0);
        const formattedDate = format(new Date(date), 'EEEE, MMM d');
        const isToday = format(new Date(), 'yyyy-MM-dd') === date;

        return (
          <div key={date}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-medium text-neutral-500">
                {isToday ? 'Today' : formattedDate}
              </h3>
              <span className="text-sm font-semibold text-neutral-700">
                {formatIDR(dateTotal)}
              </span>
            </div>

            <div className="space-y-2">
              {dateExpenses.map((expense) => {
                const category = getCategoryById(expense.category);
                const CategoryIcon = category.icon;

                return (
                  <motion.div key={expense.id} variants={item}>
                    <GlassCard
                      variant="light"
                      padding={isMobile ? 'sm' : 'md'}
                      rounded="xl"
                      className="group"
                    >
                      <div className="flex items-center gap-3">
                        {/* Category Icon */}
                        <div className="w-10 h-10 rounded-xl bg-neutral-900/10 flex items-center justify-center shrink-0">
                          <CategoryIcon size={20} className="text-neutral-700" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-neutral-800 truncate">
                            {expense.description || category.name}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {format(new Date(expense.created_at), 'h:mm a')}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <p className="font-semibold text-neutral-800">
                            -{formatIDR(expense.amount)}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(expense.id)}
                          className={`
                            p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50
                            transition-all duration-200
                            ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                          `}
                        >
                          <Trash2 size={18} />
                        </motion.button>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
