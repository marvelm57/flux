'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { BottomSheet, Modal } from '../ui/Overlays';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { categories, Category } from '@/lib/categories';
import { ExpenseInsert } from '@/lib/types';

// IDR currency icon component
const RupiahIcon = ({ size = 18 }: { size?: number }) => (
  <span style={{ fontSize: size * 0.8 }} className="font-semibold">Rp</span>
);

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => format(new Date(), 'yyyy-MM-dd');

// Format number with thousand separators
const formatWithThousandSeparator = (value: string): string => {
  // Remove all non-digit characters
  const numericValue = value.replace(/[^\d]/g, '');
  // Add thousand separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse formatted number back to raw number
const parseFormattedNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0;
};

interface AddExpenseFormProps {
  onSubmit: (expense: ExpenseInsert) => Promise<void>;
  isMobile: boolean;
}

export function AddExpenseForm({ onSubmit, isMobile }: AddExpenseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(getTodayDate);
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setExpenseDate(getTodayDate());
    setSelectedCategory(categories[0]);
  };

  const handleSubmit = async () => {
    if (!amount || parseFormattedNumber(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: parseFormattedNumber(amount),
        category: selectedCategory.id,
        description: description || selectedCategory.name,
        expense_date: expenseDate,
      });
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <div className="space-y-5">
      {/* Amount Input */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-600">Amount (IDR)</label>
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <RupiahIcon size={18} />
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(formatWithThousandSeparator(e.target.value))}
            className="w-full rounded-xl border border-neutral-200 bg-white/50 py-3 pl-12 pr-4 text-2xl font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-600">Category</label>
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-6'}`}>
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={`
                relative isolate flex flex-col items-center gap-1 overflow-hidden rounded-xl border p-3
                transition-all duration-200
                ${
                  selectedCategory.id === category.id
                    ? 'border-neutral-900/85 bg-neutral-900 text-white shadow-[inset_0px_-1px_2px_rgba(0,0,0,0.35),inset_0px_1px_2px_rgba(255,255,255,0.08)]'
                    : 'border-white/80 bg-white/55 text-neutral-700 shadow-[inset_0px_-1px_2px_rgba(0,0,0,0.08),inset_0px_1px_2px_rgba(255,255,255,0.8)] hover:bg-white/75'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              <category.icon size={20} className="relative z-[2]" />
              <span className="relative z-[2] w-full truncate text-center text-xs">{category.name.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-600">Date</label>
        <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
          <PopoverTrigger className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white/50 px-4 py-3 text-left text-neutral-900 transition-all duration-200 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-neutral-900/10">
            <CalendarIcon size={18} className="shrink-0 text-neutral-400" />
            <span className="flex-1 text-neutral-900">{format(parseISO(expenseDate), 'dd/MM/yyyy')}</span>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={10}
            className="w-auto border border-neutral-200 bg-white p-0 shadow-xl shadow-neutral-200/70"
          >
            <Calendar
              mode="single"
              selected={parseISO(expenseDate)}
              onSelect={(date) => {
                if (date) {
                  setExpenseDate(format(date, 'yyyy-MM-dd'));
                  setIsDateOpen(false);
                }
              }}
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-600">Description (Optional)</label>
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <FileText size={18} />
          </div>
          <input
            type="text"
            placeholder="Add a note..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white/50 py-3 pl-12 pr-4 text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!amount || parseFormattedNumber(amount) <= 0 || isSubmitting}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 text-base font-medium text-white transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
          />
        ) : (
          'Add Expense'
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Floating Add Button */}
      <motion.div
        className={`fixed z-30 ${isMobile ? 'bottom-6 right-6' : 'bottom-8 right-8'}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.3 }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`
            flex items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 transition-colors duration-200 hover:bg-neutral-800
            ${isMobile ? 'h-14 w-14' : 'h-16 w-16'}
          `}
        >
          <Plus size={isMobile ? 24 : 28} />
        </button>
      </motion.div>

      {/* Form Modal/Sheet */}
      {isMobile ? (
        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Add Expense"
          cardClassName="bg-white/60 border border-white/50 shadow-xl shadow-neutral-200/50 backdrop-blur-xl"
        >
          {formContent}
        </BottomSheet>
      ) : (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Add Expense"
          cardClassName="bg-white/60 border border-white/50 shadow-xl shadow-neutral-200/50 backdrop-blur-xl"
        >
          {formContent}
        </Modal>
      )}
    </>
  );
}
