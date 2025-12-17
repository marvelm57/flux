'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '../ui/GlassComponents';
import { FilterType } from '@/hooks/useExpenses';

interface FilterTabsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  isMobile: boolean;
}

export function FilterTabs({ filter, setFilter, isMobile }: FilterTabsProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'Week' },
    { value: 'monthly', label: 'Month' },
  ];

  if (isMobile) {
    return (
      <div className="flex gap-2 px-1">
        {filters.map((f) => (
          <motion.button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`
              relative flex-1 py-2.5 px-4 rounded-xl text-sm font-medium
              transition-colors duration-200
              ${filter === f.value ? 'text-neutral-900' : 'text-neutral-500'}
            `}
            whileTap={{ scale: 0.95 }}
          >
            {filter === f.value && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-white/40 border border-white/50 rounded-xl shadow-sm"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{f.label}</span>
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <GlassCard variant="frosted" padding="sm" rounded="xl" className="inline-flex gap-1">
      {filters.map((f) => (
        <motion.button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`
            relative py-2 px-5 rounded-lg text-sm font-medium
            transition-colors duration-200
            ${filter === f.value ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}
          `}
          whileTap={{ scale: 0.97 }}
        >
          {filter === f.value && (
            <motion.div
              layoutId="activeFilterDesktop"
              className="absolute inset-0 bg-white/50 border border-white/60 rounded-lg shadow-sm"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            />
          )}
          <span className="relative z-10">{f.label}</span>
        </motion.button>
      ))}
    </GlassCard>
  );
}
