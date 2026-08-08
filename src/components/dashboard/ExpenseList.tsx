'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { GlassCard } from '../ui/GlassComponents';
import { Expense } from '@/lib/types';
import { getCategoryById } from '@/lib/categories';
import { formatIDR } from '@/lib/budget';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  isMobile: boolean;
}

const PAGE_SIZE = 25;

export function ExpenseList({ expenses, onDelete, isMobile }: ExpenseListProps) {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

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

  // Slice expenses for pagination to prevent rendering massive list DOM nodes at once
  const visibleExpenses = expenses.slice(0, displayCount);

  // Group visible expenses by date
  const groupedExpenses = visibleExpenses.reduce(
    (groups, expense) => {
      const date = expense.expense_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
      return groups;
    },
    {} as Record<string, Expense[]>
  );

  const hasMore = expenses.length > displayCount;

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {Object.entries(groupedExpenses).map(([dateStr, dateExpenses]) => {
          const dateTotal = dateExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
          const parsedDate = parseISO(dateStr);
          const formattedDate = format(parsedDate, 'EEEE, MMM d');
          const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

          return (
            <div key={dateStr}>
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
                  const createdTimeStr = expense.created_at
                    ? format(parseISO(expense.created_at), 'h:mm a')
                    : 'Just now';

                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
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
                              {createdTimeStr}
                            </p>
                          </div>

                          {/* Amount */}
                          <div className="text-right">
                            <p className="font-semibold text-neutral-800">
                              -{formatIDR(Number(expense.amount))}
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
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-neutral-200 text-sm font-medium text-neutral-700 hover:bg-white hover:shadow-sm transition-all"
          >
            <span>Load More ({expenses.length - displayCount} remaining)</span>
            <ChevronDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
