'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, ChevronDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { GlassCard } from '../ui/GlassComponents';
import { Modal } from '../ui/Overlays';
import { Expense } from '@/lib/types';
import { getCategoryById } from '@/lib/categories';
import { formatIDR } from '@/lib/budget';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  onEdit?: (expense: Expense) => void;
  isMobile: boolean;
}

const PAGE_SIZE = 25;

export function ExpenseList({ expenses, onDelete, onEdit, isMobile }: ExpenseListProps) {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(expenseToDelete.id);
      setExpenseToDelete(null);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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
                        className="group cursor-pointer hover:bg-white/75 active:scale-[0.99] transition-all"
                        onClick={() => onEdit?.(expense)}
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
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpenseToDelete(expense);
                            }}
                            className={`
                              p-2 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50
                              transition-all duration-200
                              ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            `}
                            aria-label="Delete transaction"
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(expenseToDelete)}
        onClose={() => {
          if (!isDeleting) setExpenseToDelete(null);
        }}
        cardClassName="bg-white/85 border border-white/60 shadow-2xl shadow-neutral-300/40 backdrop-blur-2xl max-w-sm mx-auto"
      >
        {expenseToDelete && (() => {
          const category = getCategoryById(expenseToDelete.category);
          const CategoryIcon = category.icon;
          const dateFormatted = format(parseISO(expenseToDelete.expense_date), 'dd MMM yyyy');

          return (
            <div className="flex flex-col items-center text-center">
              {/* Warning/Trash Icon */}
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3.5 shadow-inner">
                <Trash2 size={24} />
              </div>

              {/* Modal Title & Message */}
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                Delete Transaction?
              </h3>
              <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>

              {/* Transaction Summary Card */}
              <div className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 mb-6 flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs border border-neutral-100 flex items-center justify-center shrink-0">
                  <CategoryIcon size={20} className="text-neutral-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {expenseToDelete.description || category.name}
                  </p>
                  <p className="text-xs text-neutral-500">{dateFormatted}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-red-600">
                    -{formatIDR(Number(expenseToDelete.amount))}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setExpenseToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDeleting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
