'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { categories } from '@/lib/categories';
import { formatIDR } from '@/lib/budget';

export interface ExpenseToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  filteredCount: number;
  totalCount: number;
  filteredTotal: number;
  className?: string;
}

export function ExpenseToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  filteredCount,
  totalCount,
  filteredTotal,
  className = '',
}: ExpenseToolbarProps) {
  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'all';

  return (
    <div className={`space-y-2.5 bg-white/80 backdrop-blur-xl border border-white/70 p-3 rounded-2xl shadow-sm shadow-neutral-200/60 transition-all ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-900 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search description, category, or amount..."
          className="w-full rounded-xl border border-neutral-200/80 bg-white/60 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 backdrop-blur-md transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange('all')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white/60 border border-neutral-200/70 text-neutral-600 hover:bg-white hover:text-neutral-900'
          }`}
        >
          All
        </motion.button>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-white/60 border border-neutral-200/70 text-neutral-600 hover:bg-white hover:text-neutral-900'
              }`}
            >
              <Icon size={12} className={isSelected ? 'text-white' : 'text-neutral-500'} />
              <span>{cat.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Filter Summary Bar (Only when search or category is active) */}
      <AnimatePresence>
        {isFiltered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between text-xs text-neutral-500 px-1 pt-1 border-t border-neutral-200/40"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span>
                Found <strong className="font-semibold text-neutral-800">{filteredCount}</strong> of{' '}
                {totalCount}
              </span>
              <span>•</span>
              <span className="truncate">
                Total: <strong className="font-semibold text-neutral-800">{formatIDR(filteredTotal)}</strong>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
