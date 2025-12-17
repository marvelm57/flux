'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { GlassButton, GlassInput } from '../ui/GlassComponents';
import { BottomSheet, Modal } from '../ui/Overlays';
import { categories, Category } from '@/lib/categories';
import { ExpenseInsert } from '@/lib/types';

// IDR currency icon component
const RupiahIcon = ({ size = 18 }: { size?: number }) => (
  <span style={{ fontSize: size * 0.8 }} className="font-semibold">Rp</span>
);

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => format(new Date(), 'yyyy-MM-dd');

interface AddExpenseFormProps {
  onSubmit: (expense: ExpenseInsert) => Promise<void>;
  isMobile: boolean;
}

export function AddExpenseForm({ onSubmit, isMobile }: AddExpenseFormProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
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
        <label className="block text-sm font-medium text-neutral-600 mb-2">Amount (IDR)</label>
        <GlassInput
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={<RupiahIcon size={18} />}
          className="text-2xl font-semibold"
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-2">Category</label>
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-4' : 'grid-cols-6'}`}>
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className={`
                relative flex flex-col items-center gap-1 p-3 rounded-xl
                transition-all duration-200
                ${
                  selectedCategory.id === category.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white/30 text-neutral-600 hover:bg-white/50'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              <category.icon size={20} />
              <span className="text-xs truncate w-full text-center">{category.name.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-2">Date</label>
        <GlassInput
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          icon={<Calendar size={18} />}
          max={getTodayDate()}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-2">Description (Optional)</label>
        <GlassInput
          type="text"
          placeholder="Add a note..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          icon={<FileText size={18} />}
        />
      </div>

      {/* Submit Button */}
      <GlassButton
        variant="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
        className="py-4 text-lg mt-4"
      >
        {isSubmitting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
          />
        ) : (
          'Add Expense'
        )}
      </GlassButton>
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
        <GlassButton
          variant="primary"
          size="icon"
          onClick={() => setIsOpen(true)}
          className={`
            ${isMobile ? 'w-14 h-14' : 'w-16 h-16'} 
            rounded-full shadow-lg shadow-neutral-900/20
            flex items-center justify-center
          `}
        >
          <Plus size={isMobile ? 24 : 28} />
        </GlassButton>
      </motion.div>

      {/* Form Modal/Sheet */}
      {isMobile ? (
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Expense">
          {formContent}
        </BottomSheet>
      ) : (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Expense">
          {formContent}
        </Modal>
      )}
    </>
  );
}
